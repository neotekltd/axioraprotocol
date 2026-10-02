// Content layer: blog articles and FAQs are real product content.
// Financial fixtures were removed: production pages read the Supabase ledger
// and render empty states when there is no data. Nothing here may be
// presented as a real balance, trade, or protocol statistic.
//
// Plan-derived answers below are computed from src/lib/plans.ts — the same
// authoritative production configuration used by the calculator, the
// deployment UI, and the server-side quote/activation path. There is exactly
// one source of truth for plan economics.

import { PLANS, formatPct, formatUSD } from './plans';

const planRanges = PLANS.map(
  (p) => `${p.name} ${formatUSD(p.min, { decimals: 0 })}–${formatUSD(p.max, { decimals: 0 })} at ${formatPct(p.ratePerCredit * 100)} every ${p.cycleHours}h`
).join('; ');
const globalMin = Math.min(...PLANS.map((p) => p.min));

export const BLOG_POSTS = [
  {
    slug: 'why-consensus-matters',
    date: 'Sep 23, 2026',
    category: 'Protocol',
    title: 'Why AI Consensus Matters More Than Any Single Signal',
    excerpt: 'One model can be wrong. Four independent agents forced to agree before execution changes the risk profile entirely.',
    body: 'Full article body (original educational content). In production this is managed from the admin CMS with SEO fields, scheduling, and publish state.',
  },
  {
    slug: 'risk-engine-explained',
    date: 'Sep 14, 2026',
    category: 'Trading',
    title: 'Inside the Risk Engine: Position Limits and Drawdown Guards',
    excerpt: 'How exposure caps, stop-loss enforcement, and correlation monitoring gate every consensus decision.',
    body: 'Full article body (original educational content). Covers position sizing, volatility scaling, and auditability.',
  },
  {
    slug: 'reading-protocol-stats',
    date: 'Sep 02, 2026',
    category: 'Education',
    title: 'How to Read Protocol Statistics Without Fooling Yourself',
    excerpt: 'Win rate, P&L, and capital are meaningless without timestamps, audit trails, and backend sources.',
    body: 'Full article body (original educational content). Explains reference figures vs audited ledger data and what to demand from any protocol.',
  },
  {
    slug: 'referral-design',
    date: 'Aug 24, 2026',
    category: 'Updates',
    title: 'Referral Rewards That Do Not Inflate Returns',
    excerpt: 'Separating referral payouts from trading P&L keeps performance numbers honest.',
    body: 'Full article body (original educational content).',
  },
];

export const FAQS = [
  { q: 'What is Axiora Protocol?', a: 'Axiora Protocol is a live AI consensus trading platform: four independent agents (signal, risk, execution, sentiment) must agree before any order is routed. Nothing here is affiliated with any other protocol.' },
  { q: 'How does automated trading work?', a: 'Market data flows through signal, risk, execution, and sentiment analysis into a consensus gate. Only passing decisions go to risk validation, balance checks, and execution. Frontend requests can never execute exchange orders directly.' },
  { q: 'What assets are supported?', a: 'Axiora supports USDT-denominated deployments with BTC, ETH, BNB (and others) as monitored trading venues. Supported assets are configurable in admin.' },
  { q: 'What is the minimum deployment?', a: `Production deployment limits are configured and enforced server-side. The minimum deployment is ${formatUSD(globalMin, { decimals: 0 })} on the Essential module. Current module ranges: ${planRanges}. The amounts and terms shown in the app always reflect the active production configuration.` },
  { q: 'How are fees calculated?', a: 'No deposit fee, no management fee, 0% platform withdrawal fee in the current production configuration. A configurable performance fee applies to profitable results; blockchain network fees apply to withdrawals.' },
  { q: 'Can I withdraw at any time?', a: 'Withdrawals come from available (non-deployed) balance and are processed in a configurable daily window plus confirmation.' },
  { q: 'How are profits calculated?', a: 'Quotes are computed server-side from the active production configuration. Credited payouts are ledger-backed and auditable; frontend figures are estimates, not promises.' },
  { q: 'How does the referral system work?', a: 'Five configurable levels pay an instant bonus on referral deployments plus a daily share of positive protocol results. Percentages are admin-configurable, never hardcoded in production.' },
  { q: 'What happens during losing periods?', a: 'Risk guards reduce size or halt deployment; losses reduce position value and are shown transparently. No yield is guaranteed.' },
  { q: 'What security controls exist?', a: 'Account security includes email verification, secure HTTP-only session cookies, rate-limited authentication, and append-only audit logs. Withdrawals additionally require confirmation.' },
  { q: 'Is identity verification required?', a: 'Axiora requires email verification. KYC/AML policy is jurisdiction-dependent and configurable.' },
  { q: 'Which jurisdictions are supported?', a: 'Restricted jurisdictions are configured with legal counsel. On-chain deposit processing and automated withdrawal broadcasting are not yet activated.' },
];
