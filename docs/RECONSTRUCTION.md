# AXIORA PROTOCOL — Reconstruction Standard + Master Prompt

## Project definition (read first)

```text
AXIORA PROTOCOL
================
PROJECT TYPE
High-fidelity reconstruction of a crypto/AI protocol website and
application UX based on a supplied reference website.
PRIMARY REFERENCE: https://aevosprotocol.net/
REFERENCE MATERIALS
1. Live reference website
2. Supplied full-page screenshot (primary visual spec for homepage)
3. Authenticated-app screenshots — NOT YET AVAILABLE (see Reference B gap)
RECONSTRUCTION STANDARD
Reproduce as closely as practical: layout, section ordering, spacing,
typography hierarchy, card geometry, navigation, responsive behavior,
interaction patterns, animations, charts, calculator UX, authentication
UX, application IA, dashboard interaction model.
Do not create a generic interpretation. Do not redesign or "improve"
the reference layout without approval.
ORIGINALITY REQUIREMENT (hard constraint)
Axiora logo, brand, copy, imagery, 3D assets, icons, financial parameters,
referral economics, legal and company information must be original.
No Aevos logo, trademarks, artwork, 3D assets, exact copy, legal identity,
financial claims, or referral rates. Reference is UX/visual only.
AXIORA BRAND: Axiora Protocol — Autonomous intelligence for crypto markets.
```

## Reference sets

- **Reference A (public site): HAVE.** Live site + full-page screenshot. Homepage sequence locked:
  Navigation → Hero → How Convergence Works → Battle-Tested Protocol → Beyond Scripts →
  Model Your Returns → Business Model → Three Steps → Built for Consensus →
  Referral Network → Blog Insights → Questions → Footer.
- **Reference B (authenticated app): MISSING.** Public crawl exposes only the login screen
  (email/password, remember-me, recovery, security messaging). No dashboard, deploy, portfolio,
  deposit, withdrawal, transactions, trading-activity, referral-dashboard, profile, security,
  or notification screens available. Per stop conditions below, app passes are GATED until
  reference screenshots are supplied. Current `/app/*` routes are explicitly placeholder
  concept UX (DEMO-labeled), not claimed reconstructions.

## Master prompt (Codex/Muse Spark handoff)

```text
You are the principal frontend engineer and visual reconstruction specialist for Axiora Protocol.
Build Axiora Protocol as a high-fidelity reconstruction of the supplied reference website and
application UX. Primary reference: https://aevosprotocol.net/. Additional visual reference: the
supplied full-page screenshot in project context.
Do NOT build a generic crypto landing page. Do NOT redesign or reinterpret the layout.
Reconstruct IA, composition, component geometry, spacing, responsive behavior, interactions and
animation language as closely as possible. Goal is visual and functional fidelity.
Brand everything Axiora Protocol. Do NOT copy Aevos logo, trademarks, artwork, 3D assets,
exact copy, legal identity, financial claims, or referral rates. Use original Axiora equivalents
with the same UX structure.
Stack: Next.js 16, React, TypeScript, vinext, Cloudflare Workers, Tailwind, shadcn/ui, Motion,
Three.js/R3F, Supabase (PG/Auth/Realtime), Resend. No Prisma/Drizzle/Hono/Redis/D1/GraphQL/tRPC
or extra infra without approval.
Fidelity: measure the screenshot like a Figma spec — viewport proportions, 1280px max width,
margins, section heights, rhythm, type scale, buttons, radii, cards, grids, gradients, glow,
shadows, image/chart placement, mobile transformations. Reusable tokens; one component per
homepage section (13 sections in reference order); no monolith.
Sections: nav, hero (eyebrow, multi-line H1, sub, CTAs, right 3D visual — ORIGINAL Axiora art,
stats, glow), convergence (Signal/Risk/Execution/Sentiment→consensus→trade, animated links),
battle-tested (editorial heading, paragraph, metric cards, right 3D visual), beyond-scripts
(text, stat cards, CTA, phone mockup with chart + glow), calculator (term + capital → daily,
monthly, profit, total, fee; Axiora config only; deterministic, tested), business model
(text left, 3D financial visual right, original economics), three steps (FUND/DEPLOY/EARN),
built-for-consensus (architecture card, risk engine, stats, fees, security — original content),
referral (network visual, hierarchy, CTA, no copied rates), blog (3-card desktop, stacked mobile),
FAQ accordion, footer (brand, nav, resources, legal, social, copyright).
App: same visual language. Modules: login, register, forgot-password, verification, dashboard,
portfolio, deployments, deposit, withdrawal, transactions, trading activity, referrals, profile,
security, notifications. STOP and report any referenced authenticated screen not yet provided
instead of inventing a generic replacement.
Responsive: 375/390/768/1024/1280/1440/1920; mobile is a true hierarchy transformation.
Animation: Motion for UI, R3F for 3D (isolated, lazy, reduced-motion respected); GSAP only if
necessary. SEO: SSR metadata, canonicals, OG, sitemap, robots, semantic HTML, JSON-LD, original
copy. Data: Supabase-sourced; never hardcode balances or invent performance/legal claims. Auth:
Supabase SSR, no exposed privileged credentials. DB: Supabase PG + RLS; never trust client
balances/IDs/roles/amounts. Quality per phase: inspect, reuse, implement, typecheck, lint,
test, build, visual-inspect, fix. Never silently ignore build errors. Stop on: missing reference
screen, Cloudflare/vinext conflict, unspecified financial rule, missing integration credentials,
or any step requiring copied assets.
```

## Build passes (small, sequential)

```text
PASS 1  Foundation (done: minimal stack aligned, build green)
PASS 2  Navbar + hero fidelity
PASS 3  Convergence
PASS 4  Battle-Tested + Beyond Scripts
PASS 5  Calculator
PASS 6  Business Model + Three Steps
PASS 7  Built for Consensus
PASS 8  Referral Network
PASS 9  Blog + FAQ + Footer
PASS 10 3D + animation polish
PASS 11 Responsive visual matching (375–1920)
PASS 12 Authentication (login/register/recovery — Reference A login screen available)
PASS 13 Dashboard/app reconstruction — GATED on Reference B
PASS 14 Supabase integration (auth + data + RLS)
PASS 15 Realtime (narrow subscriptions only)
PASS 16 Email/Resend
PASS 17 Security + QA
PASS 18 Cloudflare deployment
```

Rule: reference screen → screenshot → reconstruction prompt → implementation →
screenshot comparison → correction. No generic-dashboard invention.

## Locked homepage order (12 sections, no additions/removals/reorders)

01 Hero (headline, copy, primary+secondary CTA, visual, 3 headline metrics) →
02 How Convergence Works (Signal/Risk/Execution/Sentiment, consensus + trade viz) →
03 Battle-Tested Protocol (editorial + metrics + cinematic visual) →
04 Beyond Scripts. Trading by Consensus. (copy, stats, phone visual, Protocol Stats CTA) →
05 Model Your Returns (term + amount controls, daily/monthly/net/total/fee, deploy CTA) →
06 Business Model (economics + performance-fee copy, Investor Deck + Whitepaper CTAs, large visual) →
07 Three Steps. Four Agents. (01 FUND / 02 DEPLOY / 03 EARN) →
08 Built for Consensus (Consensus-Driven Execution + Risk Agent + Transparent Fee Model + Bank-Grade Security + stats) →
09 Earn From Your Referral Network (instant + daily concepts, levels table, CTA, network viz; Axiora economics only) →
10 Blog Insights (exactly 3 cards: image, date, title, excerpt, read action) →
11 Questions (narrow centered accordion) → 12 Footer.

PROHIBITED on homepage unless explicitly requested: testimonials, pricing,
tokenomics, partners, roadmap, team, extra CTAs, newsletter, extra statistics
section, reordered/restructured nav. Mobile retains the exact same order.

Phone asset: contributor-supplied phone visual is used at
public/phone-protocol-stats.png in §04 (same placement as reference).
Save the supplied picture to that path; the component falls back to the
original Axiora CSS phone concept until the file exists. Note: figures
embedded in a supplied bitmap are that bitmap's claims — do not present
them as audited Axiora performance.
