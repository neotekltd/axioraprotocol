# Axiora Protocol

Autonomous Intelligence for Crypto Markets. Minimal V1: Next.js + vinext on Cloudflare Workers,
Supabase (Postgres/Auth/Realtime), Resend for email. Original brand/content; Aevos is UX reference only.

## Docs
- `docs/PRD.md` — requirements, financial rules, acceptance
- `docs/PLAN.md` — Phase 0–15 gated plan
- `docs/BRAND.md` — identity, tokens, logo direction, voice
- `docs/HOMEPAGE.md` — pixel-level homepage spec + copy + SEO
- `docs/ARCHITECTURE.md` — minimal-stack code map + contracts
- `docs/development.md` — env + commands
- `AGENTS.md` — engineering rules for coding agents

## Quickstart (Phase 0)
```text
npm install
npx tsc --noEmit
npm run lint
npx vitest run
npm run build
```
Env: copy `.env.example`. Never commit secrets. Service-role key server-only.
