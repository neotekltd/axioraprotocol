// Homepage activity feed: deterministic demo/reference records OR the real
// confirmed ledger — never mixed, never fabricated rows in the database.
//
// * demo: in-memory reference rows (below) for the pre-production homepage.
//   Always labeled DEMO ACTIVITY. No Supabase writes, no fake hashes, no fake
//   users, no timers manufacturing new events. Fully deterministic.
// * real: confirmed deposits (incoming) + completed withdrawals (outgoing)
//   from the Axiora ledger, with masked identifiers only.
//
// Mode is server configuration: HOME_ACTIVITY_MODE=demo shows reference rows;
// =real (or unset) reads the ledger. Client-safe types + demo dataset live
// here; the server resolver lives in src/lib/queries.ts (getHomepageFeed).

export type ActivityMode = 'demo' | 'real';

export function activityMode(): ActivityMode {
  return process.env.HOME_ACTIVITY_MODE === 'demo' ? 'demo' : 'real';
}

export interface FeedRow {
  key: string;
  // Static display age for demo rows (e.g. "18m"); real rows tick client-side.
  age: string;
  occurredAt: string | null;
  asset: string;
  middle: string;
  action: string;
  amount: number;
  incoming: boolean;
}

export interface HomepageFeed {
  mode: ActivityMode;
  incoming: FeedRow[];
  outgoing: FeedRow[];
}

interface DemoSeed {
  id: string;
  asset: string;
  maskedAccount: string;
  action: string;
  amount: number;
  ageMin: number;
}

const DEMO_INCOMING: DemoSeed[] = [
  { id: 'di-1', asset: 'USDT', maskedAccount: 'mal•••is', action: 'Deposit confirmed', amount: 50, ageMin: 18 },
  { id: 'di-2', asset: 'USDT', maskedAccount: 'vra•••82', action: 'Deposit confirmed', amount: 125, ageMin: 27 },
  { id: 'di-3', asset: 'LTC', maskedAccount: 'roc•••67', action: 'Deposit confirmed', amount: 10, ageMin: 41 },
  { id: 'di-4', asset: 'USDT', maskedAccount: 'ysr•••81', action: 'Deposit confirmed', amount: 110, ageMin: 60 },
  { id: 'di-5', asset: 'USDT', maskedAccount: 'hec•••or', action: 'Deposit confirmed', amount: 20, ageMin: 120 },
];

const DEMO_OUTGOING: DemoSeed[] = [
  { id: 'do-1', asset: 'USDT', maskedAccount: 'jos•••09', action: 'Withdrawal sent', amount: 8.86, ageMin: 12 },
  { id: 'do-2', asset: 'USDT', maskedAccount: 'sqm•••or', action: 'Withdrawal sent', amount: 9.49, ageMin: 36 },
  { id: 'do-3', asset: 'USDT', maskedAccount: 'sv2•••06', action: 'Withdrawal sent', amount: 2, ageMin: 60 },
  { id: 'do-4', asset: 'USDT', maskedAccount: 'yva•••ev', action: 'Withdrawal sent', amount: 11.2, ageMin: 120 },
  { id: 'do-5', asset: 'USDT', maskedAccount: 'qwe•••41', action: 'Withdrawal sent', amount: 25, ageMin: 180 },
];

export function demoAgeLabel(ageMin: number): string {
  if (ageMin < 60) return `${ageMin}m`;
  const h = Math.floor(ageMin / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

function toFeedRow(s: DemoSeed, incoming: boolean): FeedRow {
  return {
    key: s.id,
    age: demoAgeLabel(s.ageMin),
    occurredAt: null,
    asset: s.asset,
    middle: s.maskedAccount,
    action: s.action,
    amount: s.amount,
    incoming,
  };
}

export function demoActivityFeed(): HomepageFeed {
  return {
    mode: 'demo',
    incoming: DEMO_INCOMING.map((s) => toFeedRow(s, true)),
    outgoing: DEMO_OUTGOING.map((s) => toFeedRow(s, false)),
  };
}

// Local coin-mark file for an asset symbol (public/assets/crypto). Null when
// no bundled mark exists — the UI then shows the symbol text only.
export function coinIconSrc(asset: string): string | null {
  const map: Record<string, string> = {
    USDT: 'usdt', BTC: 'btc', ETH: 'eth', BNB: 'bnb', LTC: 'ltc', DOGE: 'doge', TRX: 'trx',
  };
  const file = map[asset.toUpperCase()];
  return file ? `/assets/crypto/${file}.svg` : null;
}
