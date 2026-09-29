// Content layer: blog articles and FAQs are real product content.
// Financial fixtures were removed: production pages read the Supabase ledger
// and render empty states when there is no data. Nothing here may be
// presented as a real balance, trade, or protocol statistic.

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
    body: 'Full article body (original educational content). Explains demo vs audited data and what to demand from any protocol.',
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
  { q: 'What is Axiora Protocol?', a: 'Axiora is an original demo interface for an AI consensus trading protocol: four independent agents (signal, risk, execution, sentiment) must agree before any order is routed. Nothing here is affiliated with any other protocol.' },
  { q: 'How does automated trading work?', a: 'Market data flows through signal, risk, execution, and sentiment analysis into a consensus gate. Only passing decisions go to risk validation, balance checks, and execution. Frontend requests can never execute exchange orders directly.' },
  { q: 'What assets are supported?', a: 'Demo supports USDT-denominated deployments with BTC, ETH, BNB (and others) as monitored trading venues. Supported assets are configurable in admin.' },
  { q: 'What is the minimum deployment?', a: 'The demo minimum is $10 with terms from 20 to 90 days. Production limits are set server-side.' },
  { q: 'How are fees calculated?', a: 'No deposit fee, no management fee, 0% platform withdrawal fee in this demo configuration. A configurable performance fee applies to profitable results; blockchain network fees apply to withdrawals.' },
  { q: 'Can I withdraw at any time?', a: 'Withdrawals come from available (non-deployed) balance and are processed in a configurable daily window plus 2FA confirmation. This demo does not move real funds.' },
  { q: 'How are profits calculated?', a: 'Frontend estimates are instant only. Deployment confirmation must recalculate server-side; see /api/calculator. Production P&L must be ledger-backed and auditable.' },
  { q: 'How does the referral system work?', a: 'Five configurable levels pay an instant bonus on referral deployments plus a daily share of positive protocol results. Percentages are admin-configurable, never hardcoded in production.' },
  { q: 'What happens during losing periods?', a: 'Risk guards reduce size or halt deployment; losses reduce position value and are shown transparently. No yield is guaranteed.' },
  { q: 'What security controls exist?', a: 'This scaffold demonstrates the UI for AES-256-at-rest, TLS 1.3, 2FA withdrawal protection, rate limiting, secure cookies, and audit logs. Only claim controls you have actually implemented and audited.' },
  { q: 'Is identity verification required?', a: 'KYC/AML policy is jurisdiction-dependent and configurable. This demo requires email verification only.' },
  { q: 'Which jurisdictions are supported?', a: 'Restricted jurisdictions must be configured with legal counsel before launch. KYC/AML checks and automated chain execution are not yet activated in this build.' },
];
