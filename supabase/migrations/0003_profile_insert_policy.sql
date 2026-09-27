-- Axiora Protocol: client-safe profile backstop (run AFTER 0002).
-- The signup trigger is the primary path; this allows the verify-email
-- fallback insert for the user's OWN row only. No self-service finance.

create policy "Users insert own profile once"
  on public.profiles
  for insert
  with check (auth.uid() = id);
