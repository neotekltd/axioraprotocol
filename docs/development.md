# Development

## Environment
Copy `.env.example` to `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (public)
- `SUPABASE_SERVICE_ROLE_KEY` (server only, never browser)
- `RESEND_API_KEY` (server only)

## Commands
```text
npm install
npm run dev
npx tsc --noEmit
npm run lint
npx vitest run
npx playwright test   # from Phase 11; earlier: config check only
npm run build
npx wrangler --version
```

## Rules
One phase at a time per `docs/PLAN.md`. No silent Next/vinext migration. No new infra without justification + approval.
