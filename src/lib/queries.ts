// Server-side Supabase read layer for the authenticated app.
// Every query is defensive: any failure (unreachable project, migration 0004
// not yet applied, RLS denial) resolves to an empty state — pages must never
// crash and must never invent data. Money arrives as NUMERIC strings; parsed
// here for display only. Mutations live in actions.ts.

import { createClient } from '@/lib/supabase/server';
import { activityMode, aimexActivityFeed, demoActivityFeed } from '@/lib/activity-shared';
import type { FeedRow, HomepageFeed } from '@/lib/activity-shared';

export interface SessionUser {
  id: string;
  email: string | null;
  username: string | null;
  emailConfirmed: boolean;
  createdAt: string | null;
}

export async function getSessionUser(): Promise<SessionUser | null> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) return null;
    const metaUsername = (data.user.user_metadata as { username?: unknown } | null)?.username;
    return {
      id: data.user.id,
      email: data.user.email ?? null,
      username: typeof metaUsername === 'string' && metaUsername.trim() ? metaUsername.trim() : null,
      emailConfirmed: Boolean(data.user.email_confirmed_at),
      createdAt: data.user.created_at ?? null,
    };
  } catch {
    return null;
  }
}

export interface Profile {
  id: string;
  email: string;
  referralCode: string;
  displayName: string | null;
  createdAt: string;
}

export async function getProfile(): Promise<Profile | null> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('profiles')
      .select('id,email,referral_code,display_name,created_at')
      .maybeSingle();
    if (error || !data) return null;
    return {
      id: (data as { id: string }).id,
      email: (data as { email: string }).email,
      referralCode: (data as { referral_code: string }).referral_code,
      displayName: (data as { display_name: string | null }).display_name ?? null,
      createdAt: (data as { created_at: string }).created_at,
    };
  } catch {
    return null;
  }
}

const num = (v: unknown): number => {
  const n = typeof v === 'string' ? Number(v) : typeof v === 'number' ? v : 0;
  return Number.isFinite(n) ? n : 0;
};

// Display label for a deployment: plan name for plan-based rows, legacy
// "<n>d" term for pre-plan rows, em-dash when neither exists.
export { deploymentLabel } from '@/lib/plans';

export interface Deployment {
  id: string;
  ref: string;
  amount: number;
  termDays: number;
  plan: string | null;
  asset: string;
  status: string;
  profit: number;
  startedAt: string | null;
  maturesAt: string | null;
  createdAt: string;
}

export async function getDeployments(): Promise<Deployment[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('deployments')
      .select('id,ref,amount,term_days,plan,asset,status,profit,started_at,matures_at,created_at')
      .order('created_at', { ascending: false })
      .limit(100);
    if (error || !data) return [];
    return (data as Record<string, unknown>[]).map((d) => ({
      id: String(d.id),
      ref: String(d.ref ?? ''),
      amount: num(d.amount),
      termDays: Number(d.term_days ?? 0),
      plan: (d.plan as string | null) ?? null,
      asset: String(d.asset ?? 'USDT'),
      status: String(d.status ?? 'pending'),
      profit: num(d.profit),
      startedAt: (d.started_at as string | null) ?? null,
      maturesAt: (d.matures_at as string | null) ?? null,
      createdAt: String(d.created_at ?? ''),
    }));
  } catch {
    return [];
  }
}

export async function getDeploymentByRef(ref: string): Promise<Deployment | null> {
  try {
    const supabase = createClient();
    // Accept with or without the AX- prefix in the URL.
    const needle = ref.toUpperCase().startsWith('AX-') ? ref.toUpperCase() : `AX-${ref.toUpperCase()}`;
    const { data, error } = await supabase
      .from('deployments')
      .select('id,ref,amount,term_days,plan,asset,status,profit,started_at,matures_at,created_at')
      .eq('ref', needle)
      .maybeSingle();
    if (error || !data) return null;
    const d = data as Record<string, unknown>;
    return {
      id: String(d.id),
      ref: String(d.ref ?? ''),
      amount: num(d.amount),
      termDays: Number(d.term_days ?? 0),
      plan: (d.plan as string | null) ?? null,
      asset: String(d.asset ?? 'USDT'),
      status: String(d.status ?? 'pending'),
      profit: num(d.profit),
      startedAt: (d.started_at as string | null) ?? null,
      maturesAt: (d.matures_at as string | null) ?? null,
      createdAt: String(d.created_at ?? ''),
    };
  } catch {
    return null;
  }
}

// Settle-on-read: run the server-authoritative payout processor for the
// caller's own rows before deriving balances. Best-effort — a processor
// failure must never break reads. pg_cron covers background settlement;
// this covers freshness on every page view.
export async function settleDuePayouts(): Promise<number> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.rpc('process_due_payouts');
    if (error || typeof data !== 'number') return 0;
    return data;
  } catch {
    return 0;
  }
}

export interface ActivePlan {
  id: string;
  ref: string;
  plan: string;
  planName: string;
  amount: number;
  ratePerCredit: number;
  cycleHours: number;
  earnedTotal: number;
  nextCredit: number;
  payoutsCompleted: number;
  payoutsTotal: number | null;
  nextPayoutAt: string | null;
  lastPayoutAt: string | null;
  status: string;
  startedAt: string | null;
}

const PLAN_NAMES: Record<string, string> = { essential: 'Essential', premium: 'Premium', exclusive: 'Exclusive' };

export async function getActivePlans(): Promise<ActivePlan[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('deployments')
      .select('id,ref,plan,amount,rate_per_credit,cycle_hours,earned_total,payouts_completed,payouts_total,next_payout_at,last_payout_at,status,started_at')
      .in('status', ['pending', 'active'])
      .order('created_at', { ascending: false })
      .limit(50);
    if (error || !data) return [];
    return (data as Record<string, unknown>[]).map((d) => {
      const amount = num(d.amount);
      const rate = typeof d.rate_per_credit === 'string' ? Number(d.rate_per_credit) : Number(d.rate_per_credit ?? NaN);
      const ratePerCredit = Number.isFinite(rate) ? rate : 0;
      return {
        id: String(d.id),
        ref: String(d.ref ?? ''),
        plan: String(d.plan ?? ''),
        planName: PLAN_NAMES[String(d.plan ?? '')] ?? String(d.plan ?? '—'),
        amount,
        ratePerCredit,
        cycleHours: Number(d.cycle_hours ?? 6),
        earnedTotal: num(d.earned_total),
        nextCredit: Math.round(amount * ratePerCredit * 100) / 100,
        payoutsCompleted: Number(d.payouts_completed ?? 0),
        payoutsTotal: d.payouts_total == null ? null : Number(d.payouts_total),
        nextPayoutAt: (d.next_payout_at as string | null) ?? null,
        lastPayoutAt: (d.last_payout_at as string | null) ?? null,
        status: String(d.status ?? 'active'),
        startedAt: (d.started_at as string | null) ?? null,
      };
    });
  } catch {
    return [];
  }
}

export interface PayoutRecord {
  id: string;
  deploymentRef: string | null;
  plan: string;
  planName: string;
  payoutNumber: number;
  amount: number;
  scheduledFor: string;
  creditedAt: string | null;
  status: string;
}

export async function getPayoutHistory(limit = 50): Promise<PayoutRecord[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('plan_payouts')
      .select('id,plan,payout_number,amount,scheduled_for,credited_at,status,deployments(ref)')
      .order('scheduled_for', { ascending: false })
      .limit(limit);
    if (error || !data) return [];
    return (data as Record<string, unknown>[]).map((p) => {
      const dep = p.deployments as { ref?: string } | null;
      const plan = String(p.plan ?? '');
      return {
        id: String(p.id),
        deploymentRef: dep?.ref ?? null,
        plan,
        planName: PLAN_NAMES[plan] ?? plan,
        payoutNumber: Number(p.payout_number ?? 0),
        amount: num(p.amount),
        scheduledFor: String(p.scheduled_for ?? ''),
        creditedAt: (p.credited_at as string | null) ?? null,
        status: String(p.status ?? ''),
      };
    });
  } catch {
    return [];
  }
}

export interface WalletTxn {
  id: string;
  type: string;
  asset: string;
  amount: number;
  status: string;
  network: string | null;
  address: string | null;
  txHash: string | null;
  createdAt: string;
  completedAt: string | null;
}

export async function getTransactions(limit = 100): Promise<WalletTxn[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('wallet_transactions')
      .select('id,type,asset,amount,status,network,address,tx_hash,created_at,completed_at')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error || !data) return [];
    return (data as Record<string, unknown>[]).map((t) => ({
      id: String(t.id),
      type: String(t.type ?? ''),
      asset: String(t.asset ?? 'USDT'),
      amount: num(t.amount),
      status: String(t.status ?? 'pending'),
      network: (t.network as string | null) ?? null,
      address: (t.address as string | null) ?? null,
      txHash: (t.tx_hash as string | null) ?? null,
      createdAt: String(t.created_at ?? ''),
      completedAt: (t.completed_at as string | null) ?? null,
    }));
  } catch {
    return [];
  }
}

export interface PortfolioSummary {
  deposited: number;
  withdrawn: number;
  reservedWithdrawals: number;
  deployedActive: number;
  profitCredited: number;
  referralCredited: number;
  available: number;
  totalValue: number;
  totalProfit: number;
}

export async function getPortfolioSummary(): Promise<PortfolioSummary> {
  const zero: PortfolioSummary = {
    deposited: 0, withdrawn: 0, reservedWithdrawals: 0, deployedActive: 0, profitCredited: 0,
    referralCredited: 0, available: 0, totalValue: 0, totalProfit: 0,
  };
  try {
    // Settle any due payouts first so balances below always reflect the
    // latest authoritative ledger state (server-side, idempotent).
    await settleDuePayouts();
    const [txns, deployments, earnings] = await Promise.all([
      getTransactions(500),
      getDeployments(),
      getReferralEarnings(),
    ]);
    const sum = (rows: { amount: number }[]) => rows.reduce((a, r) => a + r.amount, 0);
    const completed = txns.filter((t) => t.status === 'completed');
    const deposited = sum(completed.filter((t) => t.type === 'deposit'));
    const withdrawn = sum(completed.filter((t) => t.type === 'withdrawal'));
    // Reservation: pending/processing withdrawals lock funds immediately so
    // the same balance cannot be withdrawn or deployed twice while a request
    // awaits backend execution. Released only by terminal states.
    const reservedWithdrawals = sum(
      txns.filter((t) => t.type === 'withdrawal' && (t.status === 'pending' || t.status === 'processing'))
    );
    const profitCredited = sum(completed.filter((t) => t.type === 'profit'));
    const deployedActive = deployments
      .filter((d) => d.status === 'pending' || d.status === 'active')
      .reduce((a, d) => a + d.amount, 0);
    const referralCredited = earnings
      .filter((e) => e.status === 'available')
      .reduce((a, e) => a + e.amount, 0);
    const settledProfit = deployments
      .filter((d) => d.status === 'matured')
      .reduce((a, d) => a + d.profit, 0);
    const totalProfit = profitCredited + settledProfit;
    const available = Math.max(0, deposited - withdrawn - reservedWithdrawals - deployedActive + profitCredited + referralCredited);
    const totalValue = available + deployedActive;
    return { deposited, withdrawn, reservedWithdrawals, deployedActive, profitCredited, referralCredited, available, totalValue, totalProfit };
  } catch {
    return zero;
  }
}

export interface Trade {
  id: string;
  pair: string;
  side: string;
  entry: number;
  exit: number | null;
  size: number;
  pnl: number;
  status: string;
  openedAt: string;
  closedAt: string | null;
}

export async function getTrades(): Promise<Trade[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('trades')
      .select('id,pair,side,entry,exit,size,pnl,status,opened_at,closed_at')
      .order('opened_at', { ascending: false })
      .limit(100);
    if (error || !data) return [];
    return (data as Record<string, unknown>[]).map((t) => ({
      id: String(t.id),
      pair: String(t.pair ?? ''),
      side: String(t.side ?? ''),
      entry: num(t.entry),
      exit: t.exit == null ? null : num(t.exit),
      size: num(t.size),
      pnl: num(t.pnl),
      status: String(t.status ?? 'open'),
      openedAt: String(t.opened_at ?? ''),
      closedAt: (t.closed_at as string | null) ?? null,
    }));
  } catch {
    return [];
  }
}

export interface ReferralRow {
  id: string;
  level: number;
  createdAt: string;
}

export async function getReferrals(): Promise<ReferralRow[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('referrals')
      .select('id,level,created_at')
      .order('created_at', { ascending: false })
      .limit(200);
    if (error || !data) return [];
    return (data as Record<string, unknown>[]).map((r) => ({
      id: String(r.id),
      level: Number(r.level ?? 1),
      createdAt: String(r.created_at ?? ''),
    }));
  } catch {
    return [];
  }
}

export interface ReferralEarning {
  id: string;
  kind: string;
  level: number;
  amount: number;
  status: string;
  createdAt: string;
}

export async function getReferralEarnings(): Promise<ReferralEarning[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('referral_earnings')
      .select('id,kind,level,amount,status,created_at')
      .order('created_at', { ascending: false })
      .limit(200);
    if (error || !data) return [];
    return (data as Record<string, unknown>[]).map((e) => ({
      id: String(e.id),
      kind: String(e.kind ?? ''),
      level: Number(e.level ?? 1),
      amount: num(e.amount),
      status: String(e.status ?? ''),
      createdAt: String(e.created_at ?? ''),
    }));
  } catch {
    return [];
  }
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  body: string | null;
  read: boolean;
  createdAt: string;
}

export async function getNotifications(): Promise<Notification[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('notifications')
      .select('id,type,title,body,read,created_at')
      .order('created_at', { ascending: false })
      .limit(50);
    if (error || !data) return [];
    return (data as Record<string, unknown>[]).map((n) => ({
      id: String(n.id),
      type: String(n.type ?? 'system'),
      title: String(n.title ?? ''),
      body: (n.body as string | null) ?? null,
      read: Boolean(n.read),
      createdAt: String(n.created_at ?? ''),
    }));
  } catch {
    return [];
  }
}

export interface SavedWallet {
  id: string;
  asset: string;
  network: string;
  address: string;
  label: string | null;
  verified: boolean;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  subject: string;
  message: string;
  category: string;
  status: string;
  createdAt: string;
}

export async function getSupportTickets(): Promise<SupportTicket[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('support_tickets')
      .select('id,subject,message,category,status,created_at')
      .order('created_at', { ascending: false })
      .limit(50);
    if (error || !data) return [];
    return (data as Record<string, unknown>[]).map((t) => ({
      id: String(t.id),
      subject: String(t.subject ?? ''),
      message: String(t.message ?? ''),
      category: String(t.category ?? 'general'),
      status: String(t.status ?? 'open'),
      createdAt: String(t.created_at ?? ''),
    }));
  } catch {
    return [];
  }
}

export async function getWallets(): Promise<SavedWallet[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('wallets')
      .select('id,asset,network,address,label,verified,created_at')
      .order('created_at', { ascending: false });
    if (error || !data) return [];
    return (data as Record<string, unknown>[]).map((w) => ({
      id: String(w.id),
      asset: String(w.asset ?? ''),
      network: String(w.network ?? ''),
      address: String(w.address ?? ''),
      label: (w.label as string | null) ?? null,
      verified: Boolean(w.verified),
      createdAt: String(w.created_at ?? ''),
    }));
  } catch {
    return [];
  }
}

export interface ProtocolStats {  capital: number;
  verifiedTrades: number;
  totalPnl: number;
  winRate: number;
  activePositions: number;
  currentValue: number;
  deposited: number;
  withdrawn: number;
  accounts: number;
  payouts: number;
  daysOperation: number;
  updatedAt: string;
}

export async function getProtocolStats(): Promise<ProtocolStats | null> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('protocol_stats')
      .select('capital,verified_trades,total_pnl,win_rate,active_positions,current_value,deposited,withdrawn,accounts,payouts,days_operation,updated_at')
      .eq('id', 1)
      .maybeSingle();
    if (error || !data) return null;
    const s = data as Record<string, unknown>;
    return {
      capital: num(s.capital),
      verifiedTrades: Number(s.verified_trades ?? 0),
      totalPnl: num(s.total_pnl),
      winRate: num(s.win_rate),
      activePositions: Number(s.active_positions ?? 0),
      currentValue: num(s.current_value),
      deposited: num(s.deposited),
      withdrawn: num(s.withdrawn),
      accounts: Number(s.accounts ?? 0),
      payouts: Number(s.payouts ?? 0),
      daysOperation: Number(s.days_operation ?? 0),
      updatedAt: String(s.updated_at ?? ''),
    };
  } catch {
    return null;
  }
}

// Public homepage telemetry: real ledger aggregates via the
// homepage_telemetry() definer function (granted to anon). Only completed
// records count; money totals are USDT-only (no invented FX). Null when the
// backend is unreachable — the UI then shows an unavailable state, never
// fabricated figures.
export interface HomepageTelemetry {
  depositedToDate: number;
  withdrawnByMembers: number;
  accounts: number;
  payoutsMade: number;
  daysInOperation: number;
  at: string;
}

const tnum = (v: unknown): number => (typeof v === 'number' && Number.isFinite(v) ? v : 0);

export async function getHomepageTelemetry(): Promise<HomepageTelemetry | null> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.rpc('homepage_telemetry');
    if (error || !data) return null;
    const d = data as Record<string, unknown>;
    return {
      depositedToDate: tnum(d.depositedToDate),
      withdrawnByMembers: tnum(d.withdrawnByMembers),
      accounts: Math.max(0, Math.floor(tnum(d.accounts))),
      payoutsMade: Math.max(0, Math.floor(tnum(d.payoutsMade))),
      daysInOperation: Math.max(0, Math.floor(tnum(d.daysInOperation))),
      at: String(d.at ?? ''),
    };
  } catch {
    return null;
  }
}

export interface ActivityRow {
  asset: string;
  amount: number;
  occurredAt: string;
  txShort: string | null;
}

export interface HomepageActivity {
  incoming: ActivityRow[];
  outgoing: ActivityRow[];
}

function cleanRows(v: unknown): ActivityRow[] {
  if (!Array.isArray(v)) return [];
  return v
    .filter((r): r is Record<string, unknown> => typeof r === 'object' && r !== null)
    .map((r) => ({
      asset: String(r.asset ?? ''),
      amount: tnum(r.amount),
      occurredAt: String(r.occurred_at ?? ''),
      txShort: typeof r.tx_short === 'string' && r.tx_short ? r.tx_short : null,
    }))
    .filter((r) => r.asset && r.occurredAt);
}

export async function getHomepageActivity(): Promise<HomepageActivity> {
  const empty = { incoming: [], outgoing: [] };
  try {
    const supabase = createClient();
    const { data, error } = await supabase.rpc('homepage_live_activity');
    if (error || !data) return empty;
    const d = data as Record<string, unknown>;
    return { incoming: cleanRows(d.incoming), outgoing: cleanRows(d.outgoing) };
  } catch {
    return empty;
  }
}

// Homepage feed resolver: demo mode returns the deterministic reference
// dataset (no database reads, no writes); real mode maps confirmed ledger
// rows into display rows. Modes never mix.
export async function getHomepageFeed(): Promise<HomepageFeed> {
  const mode = activityMode();
  if (mode === 'aimex') return aimexActivityFeed();
  if (mode === 'demo') return demoActivityFeed();
  const activity = await getHomepageActivity();
  const mapRow = (r: ActivityRow, i: number, incoming: boolean): FeedRow => ({
    key: `${r.occurredAt}-${r.txShort ?? i}-${i}`,
    age: '',
    occurredAt: r.occurredAt,
    asset: r.asset,
    middle: r.txShort ?? '—',
    action: incoming ? 'Deposit confirmed' : 'Withdrawal sent',
    amount: r.amount,
    incoming,
  });
  return {
    mode: 'real',
    incoming: activity.incoming.map((r, i) => mapRow(r, i, true)),
    outgoing: activity.outgoing.map((r, i) => mapRow(r, i, false)),
  };
}
