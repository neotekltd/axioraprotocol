-- Axiora Protocol 0017: public-safe historical telemetry series.
--
-- Read-only 30-day daily buckets of REAL ledger activity for the homepage
-- channel charts, plus the real operational launch timestamp (earliest
-- registered profile). SECURITY DEFINER exposing ONLY aggregates —
-- never emails, user ids, addresses, or full hashes. Granted to anon +
-- authenticated. Idempotent (OR REPLACE).
--
-- Buckets (strict, mirrors 0015):
-- * deposits:    type='deposit' AND status='completed', USDT only
-- * withdrawals: type='withdrawal' AND status='completed', USDT only
-- * payouts:     COUNT of type IN ('payout','profit') AND status='completed'
-- * accounts:    COUNT of new profiles per day
-- Empty days are 0 (honest flat line, never synthetic shape).

create or replace function public.homepage_series()
returns jsonb
language sql
security definer
set search_path to public
as $$
  with days as (
    select (date_trunc('day', now()) - (s || ' days')::interval)::date as d
    from generate_series(0, 29) s
  )
  select jsonb_build_object(
    'depositedSeries', coalesce((select jsonb_agg(x.v order by x.d) from (
      select days.d, coalesce(sum(w.amount), 0) as v from days
      left join public.wallet_transactions w
        on w.type = 'deposit' and w.status = 'completed' and w.asset = 'USDT'
        and (coalesce(w.completed_at, w.created_at))::date = days.d
      group by days.d) x), '[]'::jsonb),
    'withdrawnSeries', coalesce((select jsonb_agg(x.v order by x.d) from (
      select days.d, coalesce(sum(w.amount), 0) as v from days
      left join public.wallet_transactions w
        on w.type = 'withdrawal' and w.status = 'completed' and w.asset = 'USDT'
        and (coalesce(w.completed_at, w.created_at))::date = days.d
      group by days.d) x), '[]'::jsonb),
    'accountsSeries', coalesce((select jsonb_agg(x.v order by x.d) from (
      select days.d, count(p.id) as v from days
      left join public.profiles p on p.created_at::date = days.d
      group by days.d) x), '[]'::jsonb),
    'payoutsSeries', coalesce((select jsonb_agg(x.v order by x.d) from (
      select days.d, count(w.id) as v from days
      left join public.wallet_transactions w
        on w.type in ('payout', 'profit') and w.status = 'completed'
        and (coalesce(w.completed_at, w.created_at))::date = days.d
      group by days.d) x), '[]'::jsonb),
    'launchDate', (select min(created_at) from public.profiles)
  );
$$;

revoke all on function public.homepage_series() from public, anon, authenticated;
grant execute on function public.homepage_series() to anon, authenticated;
