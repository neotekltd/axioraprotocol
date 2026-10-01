-- Axiora Protocol: server-authoritative 6-hour plan payout engine (run AFTER 0015).
-- Idempotent (IF NOT EXISTS / OR REPLACE / ON CONFLICT).
--
-- Design:
-- - deployments gain schedule columns (rate_per_credit, cycle_hours,
--   next_payout_at, last_payout_at, payouts_completed, payouts_total,
--   earned_total, principal_returned_at).
-- - plan_payouts records each scheduled credit exactly once:
--   UNIQUE(deployment_id, payout_number) enforced at the database level.
-- - wallet_transactions rows of type 'profit' are the ledger credits
--   (existing type value; existing portfolio math picks them up).
-- - process_due_payouts() is SECURITY DEFINER. Called with a user JWT it
--   settles only that user's rows (settle-on-read from the app). Called
--   without a JWT (pg_cron as postgres) it settles all due rows.
-- - Term economics: current plans (Essential/Premium/Exclusive) are
--   open-ended 6h credits with no maturity term configured, so
--   payouts_total stays NULL (indefinite) and no principal-return is
--   processed. When plan terms are defined, completion logic extends here.
-- - Money is NUMERIC everywhere; no floats.

-- ---------------------------------------------------------- schedule columns
alter table public.deployments add column if not exists rate_per_credit numeric(10,6);
alter table public.deployments add column if not exists cycle_hours int not null default 6;
alter table public.deployments add column if not exists next_payout_at timestamptz;
alter table public.deployments add column if not exists last_payout_at timestamptz;
alter table public.deployments add column if not exists payouts_completed int not null default 0;
alter table public.deployments add column if not exists payouts_total int;
alter table public.deployments add column if not exists earned_total numeric(20,2) not null default 0;
alter table public.deployments add column if not exists principal_returned_at timestamptz;

do $$ begin
  alter table public.deployments
    add constraint deployments_rate_nonnegative check (rate_per_credit is null or rate_per_credit >= 0);
exception when duplicate_object then null;
end $$;

create index if not exists idx_deploy_due_payout
  on public.deployments (status, next_payout_at)
  where status = 'active';

-- Backfill schedule for existing active deployments. Rates come from the
-- canonical plan config (Essential 1.00%, Premium 1.50%, Exclusive 2.00%
-- per 6h credit). Legacy rows with no recognized plan keep next_payout_at
-- NULL so the processor never fabricates economics for them.
update public.deployments d
set rate_per_credit = case d.plan
    when 'essential' then 0.01
    when 'premium' then 0.015
    when 'exclusive' then 0.02
    else null end,
  cycle_hours = 6,
  next_payout_at = coalesce(d.started_at, d.created_at) + interval '6 hours',
  payouts_total = null
where d.status = 'active'
  and d.plan in ('essential', 'premium', 'exclusive')
  and d.next_payout_at is null;

-- ------------------------------------------------------------ payout ledger
create table if not exists public.plan_payouts (
  id uuid primary key default gen_random_uuid(),
  deployment_id uuid not null references public.deployments(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  plan text,
  principal numeric(20,2) not null check (principal >= 0),
  rate_per_credit numeric(10,6) not null check (rate_per_credit >= 0),
  payout_number int not null check (payout_number >= 1),
  amount numeric(20,2) not null check (amount >= 0),
  scheduled_for timestamptz not null,
  status text not null default 'credited'
    check (status in ('scheduled','due','processing','credited','failed')),
  credited_at timestamptz,
  created_at timestamptz not null default now(),
  constraint plan_payouts_once_per_period unique (deployment_id, payout_number)
);

alter table public.plan_payouts enable row level security;
drop policy if exists "Users read own payouts" on public.plan_payouts;
create policy "Users read own payouts" on public.plan_payouts
  for select using (auth.uid() = user_id);
-- No insert/update/delete policies: rows are written only by the
-- SECURITY DEFINER processor. Users read their own history.

create index if not exists idx_payouts_user_time
  on public.plan_payouts (user_id, created_at desc);
create index if not exists idx_payouts_deployment
  on public.plan_payouts (deployment_id, payout_number);

-- ---------------------------------------------------------------- processor
create or replace function public.process_due_payouts()
returns integer
language plpgsql
security definer
set search_path to 'public'
as $fn$
declare
  scope_uid uuid := auth.uid();
  d record;
  periods_evaluated int;
  k int;
  pno int;
  sched timestamptz;
  amt numeric(20,2);
  step interval;
  inserted_count int;
  credited_count int;
  run_credited numeric(20,2);
  last_sched timestamptz;
  total_processed int := 0;
begin
  for d in
    select *
    from public.deployments
    where status = 'active'
      and next_payout_at is not null
      and next_payout_at <= now()
      and rate_per_credit is not null
      and (scope_uid is null or user_id = scope_uid)
    order by next_payout_at asc
    for update skip locked
  loop
    step := make_interval(hours => greatest(d.cycle_hours, 1));
    periods_evaluated := greatest(
      1,
      floor(extract(epoch from (now() - d.next_payout_at)) / extract(epoch from step))::int + 1
    );
    -- Safety cap per run (~60 days of 6h periods); the next run continues.
    if periods_evaluated > 240 then periods_evaluated := 240; end if;

    inserted_count := 0;
    run_credited := 0;
    last_sched := null;

    for k in 1..periods_evaluated loop
      sched := d.next_payout_at + (k - 1) * step;
      if sched > now() then exit; end if;
      -- Reconcile against already-recorded payouts so a retried period is
      -- never credited twice (unique constraint is the final backstop).
      select count(*) + 1 into pno
      from public.plan_payouts
      where deployment_id = d.id and status = 'credited';
      pno := greatest(pno, d.payouts_completed + inserted_count + 1);
      amt := round(d.amount * d.rate_per_credit, 2);

      insert into public.plan_payouts
        (deployment_id, user_id, plan, principal, rate_per_credit,
         payout_number, amount, scheduled_for, status, credited_at)
      values
        (d.id, d.user_id, d.plan, d.amount, d.rate_per_credit,
         pno, amt, sched, 'credited', now())
      on conflict (deployment_id, payout_number) do nothing;

      if found then
        insert into public.wallet_transactions
          (user_id, type, asset, amount, status, completed_at, meta)
        values
          (d.user_id, 'profit', coalesce(d.asset, 'USDT'), amt, 'completed', now(),
           jsonb_build_object(
             'deployment_id', d.id, 'deployment_ref', d.ref, 'plan', d.plan,
             'payout_number', pno, 'scheduled_for', sched,
             'rate_per_credit', d.rate_per_credit));
        inserted_count := inserted_count + 1;
        run_credited := run_credited + amt;
        last_sched := sched;
      end if;
    end loop;

    -- Advance the schedule past every evaluated period so a retried run can
    -- never re-examine the same window; reconcile counters with recorded rows.
    update public.deployments
    set next_payout_at = d.next_payout_at + periods_evaluated * step,
        last_payout_at = coalesce(last_sched, d.last_payout_at),
        payouts_completed = (
          select count(*) from public.plan_payouts
          where deployment_id = d.id and status = 'credited'
        ),
        earned_total = (
          select coalesce(sum(amount), 0) from public.plan_payouts
          where deployment_id = d.id and status = 'credited'
        )
    where id = d.id;

    -- Keep the legacy profit column in sync for any existing readers.
    update public.deployments
    set profit = earned_total
    where id = d.id;

    if inserted_count > 0 then
      insert into public.notifications (user_id, type, title, body)
      values (d.user_id, 'profit', 'Payout credited',
              round(run_credited, 2)::text || ' USDT was credited to your Earning wallet.');
      total_processed := total_processed + inserted_count;
    end if;
  end loop;

  return total_processed;
end;
$fn$;

-- Authenticated users may settle their own rows (settle-on-read from the
-- app runs with their JWT, so scope_uid confines the writes). Anonymous
-- callers get nothing. pg_cron (postgres) settles everything.
revoke all on function public.process_due_payouts() from public, anon;
grant execute on function public.process_due_payouts() to authenticated, service_role;
