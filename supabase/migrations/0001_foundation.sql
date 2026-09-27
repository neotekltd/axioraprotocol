-- Axiora Protocol foundation migration (Phase 2).
-- profiles / accounts / audit_logs with RLS. Money as NUMERIC, never float.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  referral_code text not null unique,
  referred_by_id uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  constraint no_self_referral check (referred_by_id is distinct from id)
);

create table if not exists public.accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  total_deposited numeric(20,2) not null default 0,
  total_withdrawn numeric(20,2) not null default 0,
  total_profit numeric(20,2) not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id),
  action text not null,
  entity text not null,
  entity_id text,
  meta jsonb,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.accounts enable row level security;
alter table public.audit_logs enable row level security;

create policy "Users read own profile" on public.profiles
  for select using (auth.uid() = id);
create policy "Users update own profile" on public.profiles
  for update using (auth.uid() = id);
create policy "Users read own account" on public.accounts
  for select using (auth.uid() = user_id);
-- No direct insert/update/delete policies on accounts: mutations go through
-- server-side transactions only. Audit logs are append-only for users.
create policy "Users read own audit trail" on public.audit_logs
  for select using (auth.uid() = actor_id);

create index if not exists idx_accounts_user on public.accounts(user_id);
create index if not exists idx_audit_actor on public.audit_logs(actor_id, created_at desc);
