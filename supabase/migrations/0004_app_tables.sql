-- Axiora Protocol: application tables (run AFTER 0003 in the Supabase SQL editor).
-- Money as NUMERIC(20,2), never float. Every user-owned row is gated by
-- auth.uid() RLS. Reads are defensive: the app renders empty states when a
-- table has no rows (or before this migration is applied).
--
-- Tables: wallets, wallet_transactions, deployments, trades, referrals,
-- referral_earnings, notifications, support_tickets, protocol_stats.

-- Display name on profiles (user-editable, own row only).
alter table public.profiles add column if not exists display_name text;

drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile"
  on public.profiles for update using (auth.uid() = id);

-- ---------------------------------------------------------------- wallets
create table if not exists public.wallets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  asset text not null,
  network text not null,
  address text not null,
  label text,
  verified boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.wallets enable row level security;
drop policy if exists "Users manage own wallets" on public.wallets;
create policy "Users manage own wallets" on public.wallets
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists idx_wallets_user on public.wallets(user_id);

-- ------------------------------------------------------ wallet_transactions
create table if not exists public.wallet_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in ('deposit','withdrawal','deployment','profit','referral','fee')),
  asset text not null default 'USDT',
  amount numeric(20,2) not null check (amount >= 0),
  status text not null default 'pending'
    check (status in ('pending','processing','completed','failed','cancelled')),
  network text,
  address text,
  tx_hash text,
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  meta jsonb
);
alter table public.wallet_transactions enable row level security;
drop policy if exists "Users read own transactions" on public.wallet_transactions;
create policy "Users read own transactions" on public.wallet_transactions
  for select using (auth.uid() = user_id);
drop policy if exists "Users insert own transactions" on public.wallet_transactions;
create policy "Users insert own transactions" on public.wallet_transactions
  for insert with check (auth.uid() = user_id);
create index if not exists idx_wtx_user_time on public.wallet_transactions(user_id, created_at desc);
create index if not exists idx_wtx_user_type on public.wallet_transactions(user_id, type);

-- ------------------------------------------------------------- deployments
create table if not exists public.deployments (
  id uuid primary key default gen_random_uuid(),
  ref text not null unique default ('AX-' || upper(substr(gen_random_uuid()::text, 1, 6))),
  user_id uuid not null references public.profiles(id) on delete cascade,
  amount numeric(20,2) not null check (amount >= 10 and amount <= 100000),
  term_days int not null check (term_days >= 20 and term_days <= 90),
  asset text not null default 'USDT',
  status text not null default 'pending'
    check (status in ('pending','active','matured','cancelled','failed')),
  profit numeric(20,2) not null default 0,
  quoted_daily_rate numeric(10,6),
  started_at timestamptz,
  matures_at timestamptz,
  idempotency_key uuid not null unique,
  created_at timestamptz not null default now()
);
alter table public.deployments enable row level security;
drop policy if exists "Users read own deployments" on public.deployments;
create policy "Users read own deployments" on public.deployments
  for select using (auth.uid() = user_id);
drop policy if exists "Users insert own deployments" on public.deployments;
create policy "Users insert own deployments" on public.deployments
  for insert with check (auth.uid() = user_id);
create index if not exists idx_deploy_user_status on public.deployments(user_id, status, created_at desc);

-- ------------------------------------------------------------------ trades
create table if not exists public.trades (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  pair text not null,
  side text not null check (side in ('LONG','SHORT')),
  entry numeric(20,8) not null,
  exit numeric(20,8),
  size numeric(20,8) not null,
  pnl numeric(20,2) not null default 0,
  status text not null default 'open' check (status in ('open','closed')),
  opened_at timestamptz not null default now(),
  closed_at timestamptz
);
alter table public.trades enable row level security;
drop policy if exists "Users read own trades" on public.trades;
create policy "Users read own trades" on public.trades
  for select using (auth.uid() = user_id);
create index if not exists idx_trades_user_status on public.trades(user_id, status, opened_at desc);

-- --------------------------------------------------------------- referrals
create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid not null references public.profiles(id) on delete cascade,
  referee_id uuid not null unique references public.profiles(id) on delete cascade,
  level int not null default 1 check (level between 1 and 5),
  created_at timestamptz not null default now(),
  constraint no_self_referral2 check (referrer_id is distinct from referee_id)
);
alter table public.referrals enable row level security;
drop policy if exists "Referrers read downline" on public.referrals;
create policy "Referrers read downline" on public.referrals
  for select using (auth.uid() = referrer_id or auth.uid() = referee_id);
create index if not exists idx_referrals_referrer on public.referrals(referrer_id, created_at desc);

create table if not exists public.referral_earnings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  source_user_id uuid references public.profiles(id) on delete set null,
  kind text not null check (kind in ('instant','daily')),
  level int not null default 1 check (level between 1 and 5),
  amount numeric(20,2) not null check (amount >= 0),
  status text not null default 'available' check (status in ('available','paid','cancelled')),
  created_at timestamptz not null default now()
);
alter table public.referral_earnings enable row level security;
drop policy if exists "Users read own referral earnings" on public.referral_earnings;
create policy "Users read own referral earnings" on public.referral_earnings
  for select using (auth.uid() = user_id);
create index if not exists idx_refearn_user on public.referral_earnings(user_id, created_at desc);

-- ------------------------------------------------------------ notifications
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null default 'system'
    check (type in ('deposit','withdrawal','deployment','profit','referral','security','system')),
  title text not null,
  body text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.notifications enable row level security;
drop policy if exists "Users manage own notifications" on public.notifications;
create policy "Users manage own notifications" on public.notifications
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists idx_notif_user on public.notifications(user_id, created_at desc);

-- ---------------------------------------------------------- support_tickets
create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  subject text not null,
  message text not null,
  status text not null default 'open' check (status in ('open','answered','closed')),
  created_at timestamptz not null default now()
);
alter table public.support_tickets enable row level security;
drop policy if exists "Users manage own tickets" on public.support_tickets;
create policy "Users manage own tickets" on public.support_tickets
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ----------------------------------------------------------- protocol_stats
-- Single admin-maintained row (id = 1). Public read; only service-role writes
-- (no user insert/update/delete policies). Absent row = "not published yet".
create table if not exists public.protocol_stats (
  id int primary key,
  capital numeric(20,2) not null default 0,
  verified_trades int not null default 0,
  total_pnl numeric(20,2) not null default 0,
  win_rate numeric(5,2) not null default 0,
  active_positions int not null default 0,
  current_value numeric(20,2) not null default 0,
  updated_at timestamptz not null default now(),
  constraint single_row check (id = 1)
);
alter table public.protocol_stats enable row level security;
drop policy if exists "Public read protocol stats" on public.protocol_stats;
create policy "Public read protocol stats" on public.protocol_stats
  for select using (true);
