# Axiora Protocol — Code Architecture (minimal V1 stack)

## Runtime shape

```text
INTERNET → CLOUDFLARE (CDN/WAF/DNS) → WORKER → NEXT.JS/vinext
  ├─ (marketing) SSR pages: /, /protocol, /statistics, /calculator, /referrals, /blog, /faq, legal
  ├─ (auth) /login, /register, /forgot-password, /reset-password, /verify-email
  ├─ app/ authenticated dashboard routes (client-islands only where needed)
  └─ api/ Route Handlers → Supabase (service-role never in browser)
SUPABASE: Auth + Postgres (RLS) + Realtime (balances, deployment status, activity, notifications)
RESEND: transactional email only
```

No Hono, no Drizzle, no separate backend in V1. `supabase-js` + SQL migrations + Postgres RPC for complex logic. Reserve: Hyperdrive (after benchmarks) → R2/Queues → DO/workers.

## Repo map (post-alignment)

```text
src/app/            # layout, page (12 homepage sections), protocol/statistics/calculator/referrals/blog/faq/legal/auth/app-dashboard routes, api/health + api/deployments/quote
src/components/     # Header, Footer, ui (Card/Badge/Stat), HeroViz, CalculatorWidget (reusable, no monoliths)
src/lib/            # config (fees/referral/tiers), finance (pure calc, mirrored server-side), validation (zod), mock (DEMO-labeled), supabase-browser/server, resend
supabase/migrations/# profiles, accounts, audit_logs first; finance tables per Phase 2 design
tests/              # unit (finance/validation/ledger rules), integration (api+auth), e2e (Playwright)
```

## Key contracts

- `quotePlan(planKey, amount)` pure in `src/lib/plans.ts` (single source of truth for plan economics); Route Handler `/api/deployments/quote` re-runs server-side; client never authoritative. (The old term-based `calculateDeployment` model was retired in the plan-engine migration.)
- Zod at every boundary (`CalculatorQuery`, `CreateDeployment` incl. idempotencyKey, `WithdrawalQuote`).
- Money: NUMERIC/minor-units, never float; ledger append-only; txs wrap balance-check→lock→insert→ledger→commit.
- Auth: `@supabase/ssr` cookies; RLS owns rows; server re-checks ownership/role per request.
- Realtime: subscribe narrowly (own user id / deployment ids); never world-readable streams.
- Email: Resend via server-only functions (verify, reset, security, deployment, withdrawal, referral).
- 3D: dynamic-import R3F scenes with `ssr:false`, static fallback, `prefers-reduced-motion` respected.

## Upgrade path (gated, never silent)

Phase 1 vinext compat check before any Next 16 migration. Hyperdrive/R2/Queues/DO only with measured need + approval. New package only with a second consumer.
