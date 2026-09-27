// Demo data layer. In production every number here MUST come from the backend
// and be auditable. The UI labels demo data explicitly via DemoBadge.

export const DEMO_PROTOCOL_STATS = {
  capital: 24_816_402,
  verifiedTrades: 48_213,
  totalPnl: 3_912_558,
  winRate: 63.42,
  activePositions: 37,
  currentValue: 28_728_960,
  updatedAt: new Date().toISOString(),
  isDemo: true,
};

export const DEMO_TICKER = [
  { pair: 'BTC/USDT', side: 'LONG' as const, entry: 67210.4, price: 68164.9, pnlPct: 1.42, status: 'OPEN' },
  { pair: 'ETH/USDT', side: 'SHORT' as const, entry: 3521.8, price: 3491.1, pnlPct: 0.87, status: 'OPEN' },
  { pair: 'BNB/USDT', side: 'LONG' as const, entry: 598.2, price: 610.8, pnlPct: 2.11, status: 'OPEN' },
  { pair: 'SOL/USDT', side: 'SHORT' as const, entry: 171.4, price: 169.9, pnlPct: 0.88, status: 'CLOSED' },
  { pair: 'ARB/USDT', side: 'LONG' as const, entry: 1.421, price: 1.449, pnlPct: 1.97, status: 'OPEN' },
];

export const DEMO_DEPLOYMENTS = [
  { id: '#AX-1042', amount: 5000, term: 60, started: '2026-08-18', maturity: '2026-10-17', profit: 421.18, status: 'Active' },
  { id: '#AX-1038', amount: 2500, term: 30, started: '2026-08-29', maturity: '2026-09-28', profit: 188.4, status: 'Active' },
  { id: '#AX-1019', amount: 1700, term: 20, started: '2026-07-12', maturity: '2026-08-01', profit: 96.12, status: 'Matured' },
];

export const DEMO_TRADES = [
  { asset: 'BTC/USDT', side: 'LONG', entry: 67210.4, exit: 68164.9, size: 0.42, pnl: 400.78, status: 'Closed', time: '2026-09-26 14:02 UTC' },
  { asset: 'ETH/USDT', side: 'SHORT', entry: 3521.8, exit: 3491.1, size: 4.1, pnl: 125.87, status: 'Closed', time: '2026-09-26 11:47 UTC' },
  { asset: 'BNB/USDT', side: 'LONG', entry: 598.2, exit: 610.8, size: 12.0, pnl: 151.2, status: 'Open', time: '2026-09-27 02:15 UTC' },
  { asset: 'SOL/USDT', side: 'SHORT', entry: 171.4, exit: 169.9, size: 88.0, pnl: 132.0, status: 'Closed', time: '2026-09-25 19:33 UTC' },
];

export const DEMO_TRANSACTIONS = [
  { id: 'TX-88121', type: 'Deployment', amount: 5000, asset: 'USDT', status: 'Completed', time: '2026-08-18' },
  { id: 'TX-88002', type: 'Deposit', amount: 3200, asset: 'USDT', status: 'Completed', time: '2026-08-16' },
  { id: 'TX-87954', type: 'Profit', amount: 184.21, asset: 'USDT', status: 'Completed', time: '2026-09-27' },
  { id: 'TX-87901', type: 'Referral Reward', amount: 38.42, asset: 'USDT', status: 'Completed', time: '2026-09-26' },
  { id: 'TX-87833', type: 'Withdrawal', amount: 1200, asset: 'USDT', status: 'Processing', time: '2026-09-27' },
];

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
  { q: 'Which jurisdictions are supported?', a: 'Restricted jurisdictions must be configured with legal counsel before launch. This demo blocks no one and handles no real funds.' },
];
