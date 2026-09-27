-- Axiora Protocol: auto-create profile on signup (secure, server-side).
-- Run AFTER 0001_foundation.sql in the Supabase SQL editor.
-- The trigger runs as SECURITY DEFINER so the browser never creates profiles.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_referral_code text := upper(substr(md5(new.id::text), 1, 8));
begin
  insert into public.profiles (id, email, referral_code, referred_by_id)
  values (new.id, new.email, v_referral_code, null)
  on conflict (id) do update set email = excluded.email;
  insert into public.accounts (user_id)
  values (new.id)
  on conflict (user_id) do nothing;
  insert into public.audit_logs (actor_id, action, entity, entity_id)
  values (new.id, 'user.registered', 'profiles', new.id::text);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
