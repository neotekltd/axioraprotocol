-- Axiora Protocol: profile username (run AFTER 0009 in SQL editor).
-- Collected on the first signup screen, stored in auth user_metadata, and
-- mirrored here for referral/display use. Uniqueness is best-effort: the
-- trigger never fails signup over a taken username (leaves NULL instead).

alter table public.profiles add column if not exists username text;

do $$ begin
  alter table public.profiles add constraint profiles_username_unique unique (username);
exception when duplicate_object then null;
end $$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_referral_code text := upper(substr(md5(new.id::text), 1, 8));
  v_username text := nullif(btrim(new.raw_user_meta_data->>'username'), '');
  v_taken boolean := false;
begin
  if v_username is not null then
    select exists (select 1 from public.profiles where username = v_username) into v_taken;
    if v_taken then
      v_username := null;
    end if;
  end if;
  insert into public.profiles (id, email, referral_code, referred_by_id, username)
  values (new.id, new.email, v_referral_code, null, v_username)
  on conflict (id) do update set
    email = excluded.email,
    username = coalesce(public.profiles.username, excluded.username);
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
