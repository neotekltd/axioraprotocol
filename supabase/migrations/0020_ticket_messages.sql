-- Axiora Protocol 0020: ticket conversation (admin <-> user replies).
--
-- The original support_tickets row stays the ticket opener (subject/message).
-- Every follow-up lives in ticket_messages with a sender flag; internal
-- admin notes are stored with internal=true and are never readable by users.
-- Users may only ever write sender='user', internal=false rows on their own
-- tickets. Admins (is_admin()) manage everything server-side + audited.

create table if not exists public.ticket_messages (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.support_tickets (id) on delete cascade,
  sender text not null check (sender in ('user', 'admin')),
  sender_id uuid null,
  body text not null check (char_length(body) between 1 and 4000),
  internal boolean not null default false,
  idempotency_key text null,
  created_at timestamptz not null default now()
);

-- One stored message per (ticket, client key): double-clicks and network
-- retries converge instead of duplicating replies.
create unique index if not exists uq_ticket_msg_idem
  on public.ticket_messages (ticket_id, idempotency_key)
  where idempotency_key is not null and idempotency_key <> '';

create index if not exists idx_ticket_msg_ticket
  on public.ticket_messages (ticket_id, created_at);

alter table public.ticket_messages enable row level security;

-- Users read only non-internal messages on their own tickets.
drop policy if exists "Users read own ticket messages" on public.ticket_messages;
create policy "Users read own ticket messages" on public.ticket_messages
  for select to authenticated using (
    internal = false and exists (
      select 1 from public.support_tickets t
      where t.id = ticket_messages.ticket_id and t.user_id = auth.uid()
    )
  );

-- Users append only their own non-internal replies on their own tickets.
drop policy if exists "Users reply to own tickets" on public.ticket_messages;
create policy "Users reply to own tickets" on public.ticket_messages
  for insert to authenticated with check (
    sender = 'user' and internal = false and exists (
      select 1 from public.support_tickets t
      where t.id = ticket_messages.ticket_id and t.user_id = auth.uid()
    )
  );

-- Admins manage all ticket messages.
drop policy if exists "Admins manage ticket messages" on public.ticket_messages;
create policy "Admins manage ticket messages" on public.ticket_messages
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Admins manage all tickets (read + status changes + updated_at bumps).
drop policy if exists "Admins manage tickets" on public.support_tickets;
create policy "Admins manage tickets" on public.support_tickets
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Ticket activity timestamp for "recently updated" ordering.
alter table public.support_tickets
  add column if not exists updated_at timestamptz not null default now();
