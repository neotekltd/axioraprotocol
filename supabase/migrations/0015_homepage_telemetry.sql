-- Axiora Protocol 0015: public-safe homepage telemetry.
--
-- Read-only aggregate projection of the REAL ledger for anonymous
-- homepage visitors. SECURITY DEFINER functions expose ONLY aggregates
-- and shortened transaction identifiers — never emails, user ids,
-- addresses, or full hashes. Granted to anon + authenticated.
--
-- Qualifying records (strict):
-- * deposits:    type='deposit' AND status='completed' (credited only;
--                pending/failed/rejected never count)
-- * withdrawals: type='withdrawal' AND status='completed' (sent only)
-- * payouts:     type IN ('payout','profit') AND status='completed'
--                (no payout engine writes these yet, so this is 0 until one does)
-- * accounts:    COUNT(profiles)
-- * money totals are USDT-only (the platform accounting unit); no invented
--   FX conversion for other assets.
-- * days:        days since the earliest registered profile (real
--                operational start); 0 when empty.

create or replace function public.homepage_telemetry()
returns jsonb
language sql
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'depositedToDate', coalesce((select sum(amount) from public.wallet_transactions
      where type = 'deposit' and status = 'completed' and asset = 'USDT'), 0),
    'withdrawnByMembers', coalesce((select sum(amount) from public.wallet_transactions
      where type = 'withdrawal' and status = 'completed' and asset = 'USDT'), 0),
    'accounts', (select count(*) from public.profiles),
    'payoutsMade', (select count(*) from public.wallet_transactions
      where type in ('payout', 'profit') and status = 'completed'),
    'daysInOperation', coalesce((select ceil(extract(epoch from (now() - min(created_at))) / 86400.0)::int
      from public.profiles), 0),
    'at', now()
  );
$$;

create or replace function public.homepage_live_activity()
returns jsonb
language sql
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'incoming', coalesce((
      select jsonb_agg(row_to_json(t)) from (
        select asset, amount,
               coalesce(completed_at, created_at) as occurred_at,
               case when tx_hash is not null and tx_hash <> ''
                 then left(tx_hash, 4) || '•••' || right(tx_hash, 4)
                 else null end as tx_short
        from public.wallet_transactions
        where type = 'deposit' and status = 'completed'
        order by coalesce(completed_at, created_at) desc
        limit 5
      ) t
    ), '[]'::jsonb),
    'outgoing', coalesce((
      select jsonb_agg(row_to_json(t)) from (
        select asset, amount,
               coalesce(completed_at, created_at) as occurred_at,
               case when tx_hash is not null and tx_hash <> ''
                 then left(tx_hash, 4) || '•••' || right(tx_hash, 4)
                 else null end as tx_short
        from public.wallet_transactions
        where type = 'withdrawal' and status = 'completed'
        order by coalesce(completed_at, created_at) desc
        limit 5
      ) t
    ), '[]'::jsonb)
  );
$$;

revoke all on function public.homepage_telemetry() from public, anon, authenticated;
revoke all on function public.homepage_live_activity() from public, anon, authenticated;
grant execute on function public.homepage_telemetry() to anon, authenticated;
grant execute on function public.homepage_live_activity() to anon, authenticated;
