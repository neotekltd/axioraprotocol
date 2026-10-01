-- Axiora Protocol 0014: single-administrator authorization.
--
-- GLOBAL RULE: exactly one administrator exists: jaidanem6@gmail.com.
-- No other account may ever receive admin access: no promotion UI, no
-- self-service registration, no additional role rows consulted.
--
-- The administrator identity is verified SERVER-SIDE on every check from
-- the authenticated JWT email claim. Changing the administrator requires
-- a deliberate migration updating this function AND src/lib/admin-email.ts.
--
-- The legacy admin_roles table is retained (harmless, cascade-cleaned)
-- but is NO LONGER consulted by is_admin().

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select lower(coalesce((auth.jwt() ->> 'email'), '')) = 'jaidanem6@gmail.com'
$$;

revoke all on function public.is_admin() from public, anon, authenticated;
grant execute on function public.is_admin() to authenticated;
