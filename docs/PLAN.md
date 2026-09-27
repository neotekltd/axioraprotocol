# Axiora Protocol — Implementation Plan (phased, gated)

**Rule:** one phase at a time. Each phase ends with verification + STOP. No phase may invent yield, performance stats, fees, referral rates, certifications, or integrations. Demo data is labeled DEMO.

## Repo state (verified 2026-09-27)

- Path: `C:\Users\Admin\Desktop\AxioraProtocol` — not a git repo; no `node_modules`; no README/AGENTS/docs (docs/PRD.md just created).
- Scaffold (pre-PRD, preserved): Next 14.2.18 + React 18 + TS strict + Tailwind 3 + Supabase SSR helpers + Zod + Vitest/Playwright deps (declared, uninstalled); `wrangler.jsonc` minimal; `.env.example`; `src/{app,components,lib}` (+ legacy `db/`, `server/`, `worker/` removed in minimal-stack alignment).
- Key decision: PRD locks Next.js 16 + vinext, but scaffold is Next 14. No silent upgrade — Phase 1 performs the vinext compat check first.
- Minimal stack: Next 16 + React + vinext + Workers + Tailwind + shadcn/ui + Motion + Three.js/R3F + Supabase (PG/Auth/Realtime) + Resend. No Hono/Drizzle/Redis/KV/R2/DO/Queues/separate backend/Prisma/GraphQL/tRPC by default. Hyperdrive in reserve only.

## Proposed structure (confirm in Phase 0, minimal packages only)

```text
src/app/                   # Next.js App Router: (marketing)/, (auth)/, app/, api/
src/components/            # Axiora design-system + section components (no giant monoliths)
src/lib/                   # supabase client/server, validation (zod), finance (pure), resend, config
supabase/migrations/       # Supabase SQL migrations (foundation: profiles, accounts, audit_logs)
tests/{unit,integration,e2e}/
docs/{PRD.md, PLAN.md, BRAND.md, HOMEPAGE.md, ARCHITECTURE.md, development.md}/
wrangler.jsonc AGENTS.md README.md .env.example
packages/*                 # only when a second consumer exists; otherwise keep in src/lib
```

## Phase gates

### PHASE 0 — Repository + architecture (setup only)
Objective: inspect env, lock structure, init git, configure TS/Tailwind/lint/format, Vitest + Playwright configs, env docs, README, docs/architecture.md, docs/development.md, AGENTS.md. Do NOT build homepage/auth/dashboard/trading/calculator/referrals/blog or invent economics.
Verify: `npm install`, `tsc --noEmit`, `next lint`, `vitest run`, `next build` (prod if practical), `wrangler --version` + config validation. Report: state, architecture, files, deps, Cloudflare/Supabase placeholders, env vars, compat issues, next phase. STOP.

### PHASE 1 — Cloudflare + vinext foundation
Objective: Next.js-on-Workers runtime per current Cloudflare docs. Compat-check Next 16 + vinext (beta) before migrating; minimal Wrangler config (no KV/R2/Queues/DO/Hyperdrive bindings until a proven need); split PUBLIC vs SERVER env; `GET /api/health` → `{status:"ok",service:"axiora"}`; local dev + prod build + Wrangler validation. Do NOT build product UI or financial logic. STOP.

### PHASE 2 — Supabase + database foundation
Objective: `profiles`, `accounts`, `audit_logs` (+ genuine auth minimum) with relationships/ownership/indexes/uniques/FKs/RLS/tx boundaries documented; `@supabase/ssr` client/server; Supabase migrations + supabase-js (no Drizzle); NUMERIC/minor-units; Resend sender/domain plan only; no fake balances/trades/deposits/calculations. Verify: migration validation, typecheck, lint, tests, build. STOP.

### PHASE 3 — Design system
Tokens (near-black/green-black, electric green, glass cards, geometric sans), primitives (Button/Input/Slider/Card/Badge/Modal/Toast/Table/Tabs/Accordion/Tooltip/Stat/Nav/Sidebar) via shadcn + Axiora components; no page building. Verify: visual checklist + a11y pass. STOP.

### PHASE 4 — Navbar + Hero (original content only)
Transparent→blur header, drawer, hero copy/CTAs/stats, isolated 3D-abstract visual (no reference assets). Verify: responsive 375–1920, reduced-motion, SEO metadata. STOP.

### PHASE 5 — Convergence (Signal/Risk/Execution/Sentiment → consensus → trade)
Horizontal desktop / vertical mobile network, pulse animation, agent cards. STOP.

### PHASE 6 — Battle-tested + Beyond Scripts + phone concept
Stats labeled DEMO/backend-sourced in prod; original trading-machine + dashboard-concept visuals. STOP.

### PHASE 7 — Calculator
Sliders + numeric input, 4-result grid, fee line; client estimate + `POST /api/deployments/quote` server quote; Zod; tests for math. STOP.

### PHASE 8 — Business model + steps + consensus cards + fees + security
Fee cards configurable; security claims only if implemented. STOP.

### PHASE 9 — Referral overview + network visual
Axiora-defined economics (not copied); tree visual; dashboard deferred to Phase 11-app. STOP.

### PHASE 10 — Blog/CMS + FAQ + footer + legal placeholders
SSG articles, FAQPage schema, Terms/Privacy/Risk placeholders flagged for counsel review. STOP.

### PHASE 11 — Auth + dashboard + deployments + withdrawals + wallets
Supabase Auth flows, sessions, 2FA withdrawals, ledger-backed balances, state machines, idempotency, RLS; Playwright auth + funnel tests. STOP.

### PHASE 12 — Protocol data/API + realtime
Stats/trades endpoints, Supabase Realtime channels, Queues pipelines (deposit→credit, trade→ledger→referral→notify). STOP.

### PHASE 13 — Admin + audit
User/tx/protocol/fee/CMS/audit modules, RBAC, global halts with elevated confirmation. STOP.

### PHASE 14 — SEO + performance + security hardening
Metadata/JSON-LD/sitemap/robots/canonicals; LCP/CLS/INP pass; headers/CSP/CSRF/rate limits/secrets review. STOP.

### PHASE 15 — Testing + production deployment
Full matrix (functional/visual/responsive/browser/ledger reconciliation/load); `wrangler deploy` only with real credentials, else document the single remaining step. STOP.

## Verification commands (each phase)

```text
npm install
npx tsc --noEmit
npm run lint
npx vitest run
npm run build
npx wrangler --version
npx wrangler deploy --dry-run   # Phase 15 only, or config validation where supported
npx playwright test             # from Phase 11 onward (earlier: config check only)
```

## Environment variables

PUBLIC: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`. SERVER: `SUPABASE_SERVICE_ROLE_KEY` (never client), `DATABASE_URL` (local; Hyperdrive binding in Workers), queue/R2/KV/DO bindings via Wrangler. No secrets in git.

## Next action

Approve this PRD + plan, then authorize **Phase 0 only**.
