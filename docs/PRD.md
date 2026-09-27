# Axiora Protocol — Product Requirements Document (PRD)

**Version:** 0.1 (PRD-first, pre-implementation)
**Brand:** Axiora Protocol — Autonomous Intelligence for Crypto Markets
**Reference policy:** The Aevos site is a visual/UX reference only. Do not copy Aevos branding, copy, imagery, 3D assets, financial claims, fee percentages, referral rates, legal identity, or blog content. All Axiora copy, visuals, data, calculations, and branding must be original.
**Demo policy:** No fake production data. Simulated values must be labeled DEMO. No yield guarantees.

## 1. Product definition

Premium AI/crypto protocol platform with three layers:

- **Layer A — Marketing site (SEO-first, server-rendered):** protocol explanation, agent architecture, statistics (backend-driven in prod), interactive calculator (estimate only), fees, referrals overview, research/blog, FAQ, legal.
- **Layer B — Application (authenticated):** registration/login, deposits (address assignment + detection states), capital deployments (quote → confirm → active → matured), portfolio, trades/activity, withdrawals (balance-checked, windowed, 2FA), wallets, referrals dashboard, notifications, support.
- **Layer C — Operations/admin:** users, deposits, deployments, withdrawals, trades, protocol parameters, fees, referrals, CMS (blog/FAQ), announcements, audit log, risk controls including global halts.

## 2. Product principles

1. **Transparency:** user always sees deposited vs deployed vs available, earnings, fees, locks, maturity.
2. **Protocol-first:** AI protocol + institutional terminal, not a generic exchange look.
3. **Data-driven:** numbers dominate hierarchy, but every production number is backend-sourced and auditable.
4. **Conversion without clutter:** Learn → Calculate → Fees → Statistics → Deploy.

## 3. Locked stack (minimal V1)

- Frontend: Next.js 16, React, TypeScript (strict), App Router, vinext (beta — compat check in Phase 1 before any migration).
- Runtime/deploy: Cloudflare Workers via Wrangler (Workers, not Pages-legacy).
- Styling/UI: Tailwind CSS, shadcn/ui primitives + custom Axiora components (AxioraCard, MetricCard, AgentCard, DeploymentCard, etc.).
- Animation/3D: Motion for UI; Three.js / React Three Fiber isolated to small WebGL scenes (lazy-loaded).
- Backend/data: Supabase PostgreSQL (single source of truth), Supabase Auth (`@supabase/ssr` cookie sessions + RLS), Supabase Realtime only where it improves the product (balances, deployment status, activity feed, notifications, admin monitoring).
- Email: Resend (verification, reset, security, deployment/withdrawal/referral notifications).
- API shape: Next.js Route Handlers / Server Actions → Supabase. No separate backend service in V1.
- Validation: Zod on every external boundary.
- Testing: Vitest (+ RTL) unit/integration; Playwright browser + visual (375/768/1280/1440/1920).
- Do NOT add by default: Hono, Drizzle, Prisma, Redis, D1, GraphQL, tRPC, R2, KV, Durable Objects, Queues, Hyperdrive, extra state frameworks, unnecessary deps. New infra requires: (1) why needed, (2) why current stack can't solve it, (3) simplest option, (4) approval.
- Reserve only: Hyperdrive (Worker → Supabase Postgres pooling, added after benchmark need proven; use `pg`/Postgres.js driver per Cloudflare guidance), then R2/Queues, then Durable Objects/specialized workers.

## 4. Information architecture (target URLs)

Public: `/`, `/protocol`, `/statistics`, `/calculator`, `/referrals`, `/blog`, `/blog/:slug`, `/faq`, `/investor-deck`, `/whitepaper`, `/terms`, `/privacy`.
Auth: `/login`, `/register`, `/forgot-password`, `/reset-password`, `/verify-email`.
App: `/app/dashboard`, `/app/deposit`, `/app/deploy`, `/app/deployments`, `/app/deployments/:id`, `/app/portfolio`, `/app/trades`, `/app/transactions`, `/app/withdraw`, `/app/wallets`, `/app/referrals`, `/app/referrals/network`, `/app/referrals/earnings`, `/app/profile`, `/app/security`, `/app/notifications`, `/app/support`.
Admin: `/admin`, `/admin/users`, `/admin/users/:id`, `/admin/deposits`, `/admin/withdrawals`, `/admin/deployments`, `/admin/trades`, `/admin/positions`, `/admin/protocol`, `/admin/referrals`, `/admin/fees`, `/admin/assets`, `/admin/wallets`, `/admin/blog`, `/admin/faq`, `/admin/announcements`, `/admin/audit-log`, `/admin/settings`.

## 5. Homepage (visual reference order, original content)

Sequence: nav → hero (eyebrow, H1, supporting copy, CTAs, stats) + original 3D-abstract visual → convergence network (horizontal desktop / vertical mobile) → battle-tested + stats → beyond-scripts + phone dashboard concept → calculator → business model + liquidity visual → three steps → built-for-consensus + metrics + fees + security → referral network → blog (3 cards) → FAQ accordion → footer.
Copy/visuals must be Axiora-original. Animations: ambient glow/particles, consensus pulses, count-ups on viewport, calculator interpolation, progressive chart draw, referral line animation. Full WebGL page prohibited; isolate 3D. Mobile-first responsive; tables collapse to cards.

## 6. Calculator

Inputs: term 20–90 days (slider), capital $10–$100,000 (slider + numeric, comma formatting, validation). Outputs: daily result, projected profit, net result, total, protocol fee line. Frontend = instant estimate; authoritative figures from `POST /api/deployments/quote` (server recalculation, snapshotted rates). No guaranteed returns.

## 7. Auth

Email/password, remember-me, forgot/reset, email verification, rate limiting, suspicious-login detection, 2FA (required for withdrawals), sessions + login history, wallet-address verification. Never expose service-role keys; cookie-based SSR sessions via `@supabase/ssr`.

## 8. Financial core (authoritative rules)

- Ledger-first, append-oriented, auditable. Balances derived from ledger; never `balance += profit` as architecture.
- Mutations atomic via DB transactions (authenticate → validate → balance check → lock → create → ledger entries → commit).
- Money: PostgreSQL NUMERIC/DECIMAL or integer minor units; never float.
- Snapshots: deployment stores daily-rate + fee-rate at activation; referral rewards store rate at calculation time.
- State machines: deposit (CREATED → ADDRESS_ASSIGNED → AWAITING → DETECTED → CONFIRMING → CONFIRMED → CREDITED / FAILED); deployment (DRAFT → PENDING_CONFIRMATION → ACTIVE → MATURING → COMPLETED); withdrawal (REQUESTED → SECURITY_CHECK → RISK_CHECK → QUEUED → PROCESSING → BROADCAST → CONFIRMING → COMPLETED / FAILED → REFUNDED).
- Withdrawals from available balance only; configurable daily window; network fee + 0% platform fee (configurable); 2FA.
- Referrals: 5-level max, instant-on-deploy + daily-share-on-profit; anti-abuse (self-referral, circular, velocity, wallet reuse → REVIEW_REQUIRED, no auto-confiscation).
- Browser is hostile: never trust user_id/amount/balance/role from client; server authorization + RLS.

## 9. Data model (foundation first, then extension)

Phase 2 designs `profiles`, `accounts`, `audit_logs` (+ minimum auth/foundation needs) with relationships, ownership, indexes, unique constraints, FKs, RLS, tx boundaries. Later phases extend to wallets, deposits, deployments, trades, agent_decisions, consensus_decisions, transactions ledger, referrals, referral_rewards, withdrawals, notifications, blog, faq. RLS: users access only own rows; sensitive ops via service layer. Audit: auth events, account changes, financial mutations, admin actions.

## 10. API surface (target)

- `GET /api/health` → `{ status: "ok", service: "axiora" }` (no secrets).
- Public: stats, trades feed (anonymized), calculator quote, blog/blog/:slug, faq, referral-config.
- Auth: register/login/logout/verify-email/forgot/reset/2fa setup+verify.
- Account: me/balance/transactions/notifications/security.
- Deposits/withdrawals/deployments/referrals/admin per PRD §4 flows; all Zod-validated; idempotency keys on mutations.

## 11. Non-functional requirements

- Performance: LCP < 2.5s, CLS < 0.1, INP < 200ms; SSR marketing, code-split dashboards, optimized images, lazy 3D.
- SEO: title/description/canonical/OG/Twitter/JSON-LD (Organization, Article, FAQPage, WebSite), sitemap, robots.
- Accessibility: semantic HTML, keyboard operable accordion/dialogs, focus states, contrast, reduced-motion respect.
- Analytics events (only after consent infra where required): page_view, hero_cta, calculator interactions, signup/login, deposit/deployment/withdrawal funnels, referral copy, blog open.

## 12. Acceptance (definition of done per area)

Marketing responsive + animated + SEO; calculator validates + server quote matches; auth incl. 2FA + sessions; deposit→deploy→profit→withdraw lifecycle in sandbox with ledger reconciliation; referrals L1–L5 with snapshotted rates; admin CRUD + halts + audit; security (RBAC, rate limits, audit, secrets); no demo data presented as real; legal/risk disclosures present; Lighthouse targets met; Playwright matrix green.

## 13. Risks / decisions log

- **vinext beta:** Cloudflare recommends vinext for new Next.js-on-Workers apps (App Router/SSR/RSC/Server Actions/bindings) but labels it beta. Decision: Phase 1 runs the compat check against official docs before any Next 16 migration; current scaffold remains Next 14 until Phase 1 passes. No silent migration.
- **Current scaffold:** repo contains a Next 14 + Tailwind + Hono/Drizzle/Supabase-helper scaffold (pre-PRD). Preserved; Phase 0 will reconcile it to this PRD rather than deleting blindly.
- **No git repo yet:** init + initial commit are Phase 0 tasks.
