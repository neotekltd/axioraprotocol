-- Axiora Protocol: AI agent registry (run AFTER 0005 in SQL editor).
-- Public-safe status surface for the intelligence layer: name, provider,
-- role, enabled, status, timestamps. No credentials, no signals content,
-- no user data. Only service-role writes (no user insert/update/delete).

create table if not exists public.ai_agents (
  key text primary key,
  name text not null,
  provider text not null default 'AXIORA',
  role text not null,
  enabled boolean not null default false,
  status text not null default 'standby'
    check (status in ('standby','analyzing','active','disabled')),
  last_signal_at timestamptz,
  last_consensus_at timestamptz,
  updated_at timestamptz not null default now()
);
alter table public.ai_agents enable row level security;
drop policy if exists "Public read agent registry" on public.ai_agents;
create policy "Public read agent registry" on public.ai_agents
  for select using (true);

-- Seed the four canonical Axiora agents as standby. Real integrations flip
-- enabled/status via server-side operations only — never from the browser.
insert into public.ai_agents (key, name, provider, role, enabled, status)
values
  ('signal', 'SIGNAL AGENT', 'AXIORA', 'MARKET ANALYSIS', false, 'standby'),
  ('risk', 'RISK AGENT', 'AXIORA', 'EXPOSURE CONTROL', false, 'standby'),
  ('execution', 'EXECUTION AGENT', 'AXIORA', 'ORDER ROUTING', false, 'standby'),
  ('sentiment', 'SENTIMENT AGENT', 'AXIORA', 'FLOW ANALYSIS', false, 'standby')
on conflict (key) do nothing;
