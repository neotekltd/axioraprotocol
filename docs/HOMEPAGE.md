# Axiora Protocol — Homepage Build Specification (pixel-level)

Reference-order only; all content Axiora-original. Max width 1280px desktop; 20px gutters mobile. Nav 72px, transparent → blur + hairline on scroll; mobile drawer.

## Sections + exact copy

1. **Hero.** Eyebrow `AI-POWERED CONVERGENCE PROTOCOL`. H1 `Autonomous Intelligence. / Executed by Consensus.` (accent "Consensus."). Sub: `Axiora Protocol combines autonomous trading agents, real-time market intelligence and risk-controlled execution into a single consensus-driven trading system.` CTAs `[Explore Protocol → /protocol] [View Statistics → /statistics]`. Stats row: `$10 MINIMUM DEPLOYMENT · 24/7 AUTONOMOUS MONITORING · 4 AI AGENTS`. Right: original abstract market-core SVG + convergence mini-widget with `LIVE SIM` + `AXIORA MARKET CORE · ORIGINAL RENDER`.
2. **How Convergence Works.** Title `How Consensus Works`; sub `Four autonomous agents analyze independently. A trade is executed only when the protocol reaches consensus.` Diagram: desktop horizontal `SIGNAL/RISK → CONSENSUS → SENTIMENT/EXECUTION → TRADE`; mobile vertical stack. Cards: SIGNAL/Market Intelligence (structure, momentum, liquidity, regime); RISK/Risk Intelligence (exposure, correlation, volatility, drawdown, sizing); EXECUTION/Execution Intelligence (liquidity, spread, slippage, routing); SENTIMENT/Sentiment Intelligence (funding, mood, social, whales).
3. **Battle-Tested.** `Designed for changing markets.` + `Axiora continuously evaluates market conditions, risk and execution before capital is deployed.` Stat tiles LIVE CAPITAL $24.8M / VERIFIED TRADES 48,213 / PROTOCOL P&L $3.91M / WIN RATE 63.42% + DEMO badge. Right: original trading-machine SVG.
4. **Beyond Scripts.** `Beyond Scripts. / Trading by Consensus.` + `Traditional bots follow predetermined rules. Axiora's architecture combines independent intelligence layers before an execution decision is authorized.` CTA Explore Architecture. Right: phone dashboard concept ($12,481.42, +$184.22, 3 active, BTC LONG +$82.12, ETH SHORT +$41.92, sparkline; caption demo values).
5. **Calculator.** `Model Your Returns` / `Explore how deployment size and duration affect projected protocol outcomes.` Term 20–90d slider; capital $10–$100k slider + numeric; 4 tiles (daily/projected/net/total) + fee line + `[Start Deployment]`; microcopy: estimate only, server quote authoritative, no guarantees.
6. **Business Model.** `Transparent protocol economics` + `designed around transparent execution and clearly defined protocol fees.` Chips PROTOCOL/FEES/TRANSPARENCY; tiles NO DEPOSIT FEE 0% / 0% PLATFORM WITHDRAWAL fee / NO MANAGEMENT fee; `Protocol fee: 20% on profit only · admin-configurable`. Right: liquidity towers visual (CAPITAL/PERFORMANCE/EXECUTION).
7. **Three Steps.** `Three Steps. Four Agents.` 01 FUND `Connect your supported wallet and fund your Axiora account.` 02 DEPLOY `Choose your allocation and deployment parameters.` 03 EARN `Monitor protocol activity, performance and completed execution cycles.` Green pulse dot per card.
8. **Built for Consensus.** `Multi-agent intelligence. Risk-controlled execution. Transparent infrastructure.` Big card `CONSENSUS-DRIVEN EXECUTION` (Signal/Risk/Sentiment/Execution → CONSENSUS → EXECUTION mono block); RISK-FIRST ENGINE (dynamic sizing, correlation, exposure, drawdown). Metric tiles WIN RATE 63.42% / TRADES 48,213 / RETURN +15.8% / CURRENT VALUE $28.7M (DEMO). Security tiles AES-256 rest / TLS 1.3 transit / 2FA accounts / DDoS infra — each suffixed "claim only what is implemented".
9. **Referral.** Card: `Build Your Axiora Network` + `Share Axiora Protocol with your network and track referral activity from one dashboard.` YOU→L1×3→L2/L3 tree, animated lines; CTA Explore Referral Program. Economics live on /referrals (configurable; never copied).
10. **Blog.** `Blog Insights` + All articles. Cards: PROTOCOL/`Inside the Axiora Consensus Engine`; RISK/`Why Multi-Agent Trading Needs Risk Intelligence`; EDUCATION/`How Autonomous Crypto Execution Works` (gradient cover `AXIORA / {CAT}`, Read →).
11. **FAQ.** `Questions` accordion (10 Axiora-specific questions; `+`/`−`, answer links to /faq; FAQPage schema in prod).
12. **Footer.** `AXIORA / Autonomous intelligence for crypto markets.` PRODUCT (Protocol, Statistics, Calculator, Referrals), RESOURCES (Documentation, Research, Blog, FAQ), LEGAL (Terms, Privacy, Risk Disclosure). Bottom `© 2026 Axiora Protocol / Digital assets involve risk.`

## SEO

Title `Axiora Protocol — AI Consensus Trading Platform`; description: original interface for multi-agent consensus trading with statistics, calculator, deployment dashboard. OG/Twitter, canonical, Organization + WebSite + FAQPage JSON-LD, sitemap, robots. Semantic landmarks; single H1; alt/aria on visuals; keyboard-operable accordion.

## Responsive QA

375/390/768/1024/1280/1440/1920; hero stacks text→visual→CTA; convergence horizontal→vertical; steps 3col→1col; calculator controls→results→CTA; referral graph→simplified tree; tables→cards. Reduced-motion disables pulses/particles.
