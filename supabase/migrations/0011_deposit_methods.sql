-- Axiora Protocol: public deposit methods (run AFTER 0010 in SQL editor).
-- Receiving addresses are PUBLIC by design (users must see them to send).
-- No secrets here. Service-role writes only; public read for display.

create table if not exists public.deposit_methods (
  id uuid primary key default gen_random_uuid(),
  asset text not null,
  asset_name text not null,
  network text not null,
  standard text not null,
  contract_address text,
  decimals int,
  deposit_address text not null,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  unique (asset, network)
);
alter table public.deposit_methods enable row level security;
drop policy if exists "Public read deposit methods" on public.deposit_methods;
create policy "Public read deposit methods" on public.deposit_methods
  for select using (true);

insert into public.deposit_methods
  (asset, asset_name, network, standard, contract_address, decimals, deposit_address, enabled)
values
  ('USDT', 'Tether USD', 'TRON', 'TRC-20', 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t', 6, 'TX3VNFswkExvKDwq3BSSVmEbVWRR9gkwdk', true)
on conflict (asset, network) do update set
  asset_name = excluded.asset_name,
  standard = excluded.standard,
  contract_address = excluded.contract_address,
  decimals = excluded.decimals,
  deposit_address = excluded.deposit_address,
  enabled = excluded.enabled;
