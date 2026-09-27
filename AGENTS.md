# AXIORA PROTOCOL — ENGINEERING RULES

PRIMARY STACK
=============
Frontend: Next.js 16, React, TypeScript (strict), vinext. Runtime: Cloudflare Workers.
Styling: Tailwind CSS. UI: shadcn/ui. Animation: Motion. 3D: Three.js / React Three Fiber.
Backend/data: Supabase PostgreSQL, Supabase Auth, Supabase Realtime. Email: Resend.

DO NOT ADD BY DEFAULT
======================
Hono, Prisma, Drizzle, Redis, D1, GraphQL, tRPC, R2, KV, Durable Objects, Queues, Hyperdrive,
unless a concrete requirement justifies it. New infra needs: (1) why, (2) why current stack
can't solve it, (3) simplest option, (4) approval.

DATABASE
========
Supabase PostgreSQL is the single source of truth. No second DB, no duplicated financial state.

AUTH
====
Supabase Auth + @supabase/ssr + RLS. Never expose privileged credentials. Never service-role client-side.

EMAIL
=====
Resend only. No second provider.

FINANCIAL DATA
==============
No float for money (NUMERIC/minor-units). Server validation mandatory. Client input untrusted.
Financial mutations atomic. No fake production statistics (DEMO-labeled only).

CLOUDFLARE
==========
Target is Cloudflare Workers via vinext per current docs. Check docs before changing config.

SEO / PERFORMANCE / QUALITY
===========================
Public pages SEO-first, Server Components by default, 3D isolated + lazy, mobile-first.
Product: "Axiora Protocol" brand; Aevos is visual/UX reference only — no copied branding/assets/copy/claims.
Before finishing: typecheck, lint, test, build. Report failures honestly.

BEFORE CHANGING CODE
====================
Inspect repo, read AGENTS.md + relevant docs, prefer existing abstractions, no giant monoliths,
no unnecessary client components, no silent Next/vinext migration (compat check first).
