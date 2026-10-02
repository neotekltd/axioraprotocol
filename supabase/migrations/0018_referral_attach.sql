-- 0018_referral_attach.sql — server-side referral attribution.
--
-- The referral cookie is TRANSPORT ONLY (first-touch, client-readable 8-char
-- code, no secrets). The database relationship is the SOURCE OF TRUTH and is
-- created exclusively through attach_referrer(), which re-validates
-- everything: code exists, referrer exists, no self-referral, referee is new
-- to the tree (referred_by_id IS NULL and no referrals row). referee_id is
-- UNIQUE, so even a raced double-call can attach only once.
-- No INSERT/UPDATE policies exist for anon/authenticated on referrals or on
-- profiles.referred_by_id — the browser can never forge a relationship
-- directly; writes happen only inside these SECURITY DEFINER functions.

-- Normalizes a raw code the same way everywhere: trim + uppercase.
create or replace function public.normalize_referral_code(raw text)
returns text
language sql
immutable
as $$
  select upper(regexp_replace(coalesce(raw, ''), '[^A-Za-z0-9]', '', 'g'));
$$;

-- Public validity check for the /r/[code] entry point. Returns true only
-- when the code belongs to a real profile. Granted to anon (pre-signup
-- visitors) and authenticated.
create or replace function public.referral_code_valid(p_code text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where referral_code = public.normalize_referral_code(p_code)
  );
$$;

revoke all on function public.normalize_referral_code(text) from public;
revoke all on function public.referral_code_valid(text) from public;
grant execute on function public.normalize_referral_code(text) to anon, authenticated;
grant execute on function public.referral_code_valid(text) to anon, authenticated;

-- Attaches the CALLER (auth.uid()) to the referrer owning p_code.
-- Idempotent: 'already' when the caller is already attributed (by any path),
-- including raced concurrent calls (unique referee_id backs it).
-- Returns: attached | already | invalid | self | no_session
create or replace function public.attach_referrer(p_code text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid;
  v_code text;
  v_referrer uuid;
  v_current uuid;
begin
  v_uid := auth.uid();
  if v_uid is null then
    return 'no_session';
  end if;

  v_code := public.normalize_referral_code(p_code);
  if v_code = '' then
    return 'invalid';
  end if;

  select id into v_referrer
  from public.profiles
  where referral_code = v_code;

  if v_referrer is null then
    return 'invalid';
  end if;

  if v_referrer = v_uid then
    return 'self';
  end if;

  select referred_by_id into v_current
  from public.profiles
  where id = v_uid;

  if v_current is not null then
    return 'already';
  end if;

  if exists (select 1 from public.referrals where referee_id = v_uid) then
    return 'already';
  end if;

  -- First-touch wins: only fill when still unattributed.
  update public.profiles
  set referred_by_id = v_referrer
  where id = v_uid and referred_by_id is null;

  begin
    insert into public.referrals (referrer_id, referee_id, level)
    values (v_referrer, v_uid, 1);
  exception when unique_violation then
    return 'already';
  end;

  return 'attached';
end;
$$;

revoke all on function public.attach_referrer(text) from public;
grant execute on function public.attach_referrer(text) to authenticated;
