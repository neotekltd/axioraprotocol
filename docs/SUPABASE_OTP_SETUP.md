# Supabase dashboard setup for 6-digit signup OTP

Run in this order. Code is already wired; these are project settings.

## 1. Apply migrations (SQL Editor, in order)

1. `supabase/migrations/0001_foundation.sql` — profiles, accounts, audit_logs + RLS
2. `supabase/migrations/0002_profile_trigger.sql` — auto-profile on signup
3. `supabase/migrations/0003_profile_insert_policy.sql` — verify-form backstop

## 2. Email provider (Authentication → Providers → Email)

- Enable Email provider: ON
- Confirm email: ON (unverified users get no session; middleware also gates `/app/*`)
- Secure email change: ON (recommended)

## 3. OTP length (Authentication → Settings or Auth config)

- `auth.email.otp_length = 6` (default is already 6; valid range 6–10)

## 4. Confirm-signup template (Authentication → Email Templates → Confirm signup)

Subject: `Verify your Axiora account`

Body (code-first — no link dependency):

```text
Welcome to Axiora.

Your email verification code is:

{{ .Token }}

Enter this 6-digit code in the Axiora application to verify your email address.

If you did not create an Axiora account, you can safely ignore this email.
```

Keep `{{ .ConfirmationURL }}` out of the primary path. Do not disable
confirmation, auto-confirm emails, or use `signInWithOtp()` for registration.

## 5. Smoke test (do not create fake users — use a real throwaway inbox)

1. `/register` → account created, redirected to `/verify-email?email=…`
2. Email arrives with exactly 6 digits → enter → `/app/dashboard`
3. Wrong code → "That verification code is invalid.", stays on page
4. Resend → new email, 60s cooldown shown
5. `/login` with unverified account → bounced to `/verify-email`
6. Logout → `/app/*` redirects to `/login`
