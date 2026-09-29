-- Axiora Protocol: support ticket categories (run AFTER 0008).
alter table public.support_tickets add column if not exists category text not null default 'general';
