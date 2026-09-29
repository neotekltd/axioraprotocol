-- Axiora Protocol: plan-based deployments (run AFTER 0007).
-- Modules replace fixed terms: plan key is authoritative, term_days legacy.

alter table public.deployments add column if not exists plan text;

do $$ begin
  alter table public.deployments drop constraint deployments_term_days_check;
exception when undefined_object then null;
end $$;

do $$ begin
  alter table public.deployments alter column term_days drop not null;
exception when others then null;
end $$;
