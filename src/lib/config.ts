// Central protocol configuration — admin-configurable in production.
// All fees, limits and referral levels MUST be read from backend/admin in prod.
// These defaults are for demo UI only and clearly labeled as such.

// Canonical public URL (sharing, referral links, metadata, sitemap).
// Overridable via NEXT_PUBLIC_SITE_URL; static access so Next inlines it
// into client bundles. Canonical production domain is axioraprotocol.com;
// the workers.dev address remains only as deployment origin, never as
// public/canonical URL.
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.NEXT_PUBLIC_APP_URL ??
  'https://axioraprotocol.com';

// Canonical Axiora Telegram destination (public username @axioraprotocol).
// Every Telegram contact button across the app must use this constant —
// never a different username, share URL, or placeholder.
export const AXIORA_TELEGRAM_URL = 'https://t.me/axioraprotocol';

export const PROTOCOL_CONFIG = {
  brand: 'Axiora',
  minDeployment: 10,
  maxDeployment: 100_000,
  minTermDays: 20,
  maxTermDays: 90,
  termOptions: [20, 30, 60, 90],
  // Base daily yield model (demo only — backend is source of truth in prod)
  baseDailyRate: 0.0042, // 0.42%/day baseline
  termBonusPerDay: 0.00002, // longer terms slightly higher
  performanceFeeRate: 0.2, // 20% on profit (configurable)
  depositFee: 0,
  withdrawalFeeRate: 0,
  withdrawalWindowNote: 'Withdrawals are processed during a configurable daily window (set in admin).',
  supportedAssets: ['USDT', 'BTC', 'ETH', 'BNB'] as const,
  referralLevels: [
    { level: 1, instantPct: 5.0, dailySharePct: 3.0 },
    { level: 2, instantPct: 2.5, dailySharePct: 1.5 },
    { level: 3, instantPct: 1.2, dailySharePct: 0.8 },
    { level: 4, instantPct: 0.6, dailySharePct: 0.4 },
    { level: 5, instantPct: 0.3, dailySharePct: 0.2 },
  ],
  isDemoData: true,
} as const;

export type ReferralLevel = (typeof PROTOCOL_CONFIG.referralLevels)[number];
