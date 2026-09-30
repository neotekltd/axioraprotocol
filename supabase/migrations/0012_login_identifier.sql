-- Axiora Protocol 0012: case-insensitive username uniqueness + minimal
-- login identifier resolver. The app login accepts username OR email;
-- Supabase password sign-in needs the email, so this SECURITY DEFINER
-- function resolves a username to its account email server-side. It returns
-- ONLY the email (or NULL) — never profiles, balances, or statuses.
-- Ambiguous (0 or 2+) matches resolve to NULL: the login then fails with
-- the same generic message as any invalid credential (no enumeration).

-- Harden uniqueness: exact unique constraint already exists (0010); add a
-- case-insensitive guard for future rows (no existing conflicts verified).
create unique index if not exists profiles_username_lower_unique
  on public.profiles (lower(username)) where username is not null;

create or replace function public.resolve_login_email(p_username text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
  v_email text;
begin
  if p_username is null then
    return null;
  end if;
  p_username := btrim(p_username);
  if p_username = '' or length(p_username) > 64 then
    return null;
  end if;
  select count(*), max(email)
    into v_count, v_email
    from public.profiles
    where username is not null
      and lower(username) = lower(p_username);
  if v_count = 1 then
    return v_email;
  end if;
  return null;
end;
$$;

revoke all on function public.resolve_login_email(text) from public, anon, authenticated;
grant execute on function public.resolve_login_email(text) to anon, authenticated;
