-- Axiora Protocol: public ledger telemetry columns (run AFTER 0006).
-- Operator-published snapshot values for the homepage telemetry row.
-- Absent row or zeros = honest awaiting-live-data states in the UI.

alter table public.protocol_stats
  add column if not exists deposited numeric(20,2) not null default 0,
  add column if not exists withdrawn numeric(20,2) not null default 0,
  add column if not exists accounts int not null default 0,
  add column if not exists payouts int not null default 0,
  add column if not exists days_operation int not null default 0;
