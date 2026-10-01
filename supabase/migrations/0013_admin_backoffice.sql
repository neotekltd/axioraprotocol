-- Axiora Protocol 0013: admin back-office + canonical asset/network config.
--
-- BOOTSTRAP (owner runs once in SQL editor after applying):
--   insert into public.admin_roles (user_id) values ('<your-auth-user-id>');
-- Admin access requires a row here; nothing else grants it.
--
-- DESIGN NOTES (see also docs/ARCHITECTURE.md):
-- * Money movement stays on public.wallet_transactions (append-only ledger;
--   balances are derived, never edited in place). No second ledger table.
-- * Per-network config lives in crypto_assets/crypto_networks; env vars
--   remain bootstrap/initial values only.
-- * TXID idempotency: partial unique index on (network, tx_hash).

-- ---------- admin roles ----------
create table if not exists public.admin_roles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'admin',
  created_at timestamptz not null default now()
);
alter table public.admin_roles enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$ select exists (select 1 from public.admin_roles where user_id = auth.uid()) $$;

revoke all on function public.is_admin() from public, anon, authenticated;
grant execute on function public.is_admin() to authenticated;

drop policy if exists "Admins manage roles" on public.admin_roles;
create policy "Admins manage roles" on public.admin_roles
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---------- crypto assets ----------
create table if not exists public.crypto_assets (
  id text primary key,
  symbol text not null,
  name text not null,
  icon text,
  is_active boolean not null default true,
  sort integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.crypto_assets enable row level security;

drop policy if exists "Authenticated read assets" on public.crypto_assets;
create policy "Authenticated read assets" on public.crypto_assets
  for select to authenticated using (true);
drop policy if exists "Admins write assets" on public.crypto_assets;
create policy "Admins write assets" on public.crypto_assets
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---------- crypto networks (per-asset/network deposit config) ----------
create table if not exists public.crypto_networks (
  id text primary key,
  asset_id text not null references public.crypto_assets (id),
  network_code text not null,
  network_name text not null,
  display_name text not null,
  deposit_address text not null default '',
  token_contract_address text,
  memo_required boolean not null default false,
  memo_label text,
  confirmations_required integer not null default 20,
  minimum_deposit numeric not null default 10,
  deposit_enabled boolean not null default false,
  withdrawal_enabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint networks_enabled_needs_address
    check (not deposit_enabled or deposit_address <> '')
);
alter table public.crypto_networks enable row level security;

drop policy if exists "Authenticated read networks" on public.crypto_networks;
create policy "Authenticated read networks" on public.crypto_networks
  for select to authenticated using (true);
drop policy if exists "Admins write networks" on public.crypto_networks;
create policy "Admins write networks" on public.crypto_networks
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create index if not exists crypto_networks_asset_idx on public.crypto_networks (asset_id);

-- ---------- seed: catalog assets (no addresses except the supplied one) ----------
insert into public.crypto_assets (id, symbol, name, sort) values
  ('USDT', 'USDT', 'Tether USD', 1),
  ('BTC', 'BTC', 'Bitcoin', 2),
  ('BNB', 'BNB', 'BNB', 3),
  ('DOGE', 'DOGE', 'Dogecoin', 4),
  ('LTC', 'LTC', 'Litecoin', 5),
  ('ETH', 'ETH', 'Ethereum', 6),
  ('TRX', 'TRX', 'TRON', 7)
on conflict (id) do nothing;

-- Supplied receiving address (public operational data, also the env bootstrap).
insert into public.crypto_networks
  (id, asset_id, network_code, network_name, display_name, deposit_address,
   token_contract_address, memo_required, memo_label, confirmations_required,
   minimum_deposit, deposit_enabled, withdrawal_enabled)
values
  ('USDT_TRC20', 'USDT', 'TRC20', 'TRON', 'TRON / TRC-20',
   'TX3VNFswkExvKDwq3BSSVmEbVWRR9gkwdk', 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
   false, null, 20, 10, true, true)
on conflict (id) do update set
  deposit_address = excluded.deposit_address,
  token_contract_address = excluded.token_contract_address,
  deposit_enabled = excluded.deposit_enabled,
  withdrawal_enabled = excluded.withdrawal_enabled,
  updated_at = now();

-- ---------- TXID idempotency: one credit per (network, transaction hash) ----------
create unique index if not exists wallet_transactions_network_txhash_unique
  on public.wallet_transactions (network, tx_hash)
  where tx_hash is not null and tx_hash <> '';

-- ---------- admin access to existing finance tables (user policies untouched) ----------
drop policy if exists "Admins read all transactions" on public.wallet_transactions;
create policy "Admins read all transactions" on public.wallet_transactions
  for select to authenticated using (public.is_admin());
drop policy if exists "Admins update transactions" on public.wallet_transactions;
create policy "Admins update transactions" on public.wallet_transactions
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admins read audit" on public.audit_logs;
create policy "Admins read audit" on public.audit_logs
  for select to authenticated using (public.is_admin());
drop policy if exists "Admins write audit" on public.audit_logs;
create policy "Admins write audit" on public.audit_logs
  for insert to authenticated with check (public.is_admin());

drop policy if exists "Admins read profiles" on public.profiles;
create policy "Admins read profiles" on public.profiles
  for select to authenticated using (public.is_admin());

drop policy if exists "Admins read wallets" on public.wallets;
create policy "Admins read wallets" on public.wallets
  for select to authenticated using (public.is_admin());

-- ---------- platform settings (admin KV; consumed wiring = follow-up) ----------
create table if not exists public.platform_settings (
  key text primary key,
  value text not null default '',
  updated_at timestamptz not null default now()
);
alter table public.platform_settings enable row level security;

drop policy if exists "Admins manage settings" on public.platform_settings;
create policy "Admins manage settings" on public.platform_settings
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

insert into public.platform_settings (key, value) values
  ('min_deposit_usdt', '10'),
  ('maintenance_mode', 'false')
on conflict (key) do nothing;
