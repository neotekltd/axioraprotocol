// Admin read layer (server only). Every query is defensive and scoped:
// admin tables enforce RLS via is_admin(); the gate below rejects
// non-admins before any data loads. No secrets here — the server client
// uses the session cookie + RLS, never the service key.
import { createClient } from '@/lib/supabase/server';
import { getSessionUser } from '@/lib/queries';
import { isSoleAdminEmail } from '@/lib/admin-email';
import { providerEnabled } from '@/lib/nowpayments';
import { runtimeEnv } from '@/lib/runtime-env';
import { reconcileStaleAutomatics } from '@/lib/provider-sync';

// Single-admin gate: the ONLY administrator is the sole admin email,
// verified server-side from the authenticated session on every call.
// Nothing else (no table row, no client flag) can grant admin access.
export async function isAdmin(): Promise<boolean> {
  try {
    const user = await getSessionUser();
    return isSoleAdminEmail(user?.email ?? null);
  } catch {
    return false;
  }
}

export async function requireAdminId(): Promise<string | null> {
  const user = await getSessionUser();
  if (!user) return null;
  return (await isAdmin()) ? user.id : null;
}

export interface AdminMetrics {
  users: number;
  pendingDeposits: number;
  pendingDepositsTotal: number;
  pendingWithdrawals: number;
  pendingWithdrawalsTotal: number;
  activeInvested: number;
  // Operational split: manual deposits need admin review; automatic
  // (NOWPayments) deposits credit themselves — only exceptions surface.
  pendingManual: number;
  pendingManualTotal: number;
  autoPending: number;
  autoFinished: number;
  needsAttention: number;
  providerApiConfigured: boolean;
  providerIpnConfigured: boolean;
  providerLastActivity: string | null;
  // Provider reconciliation health: null when the last sync round was clean
  // (or nothing needed syncing), otherwise a safe code (never secrets).
  providerSyncError: string | null;
  dbOk: boolean;
}

const EXCEPTION_PROVIDER_STATUSES = new Set(['partially_paid', 'failed', 'expired', 'refunded']);

export function isAutomaticDeposit(provider: string | null): boolean {
  return provider === 'nowpayments';
}

export function depositNeedsReview(meta: Record<string, unknown>, providerStatus: string | null): boolean {
  if ((meta as { needs_review?: unknown }).needs_review === true) return true;
  if (providerStatus && EXCEPTION_PROVIDER_STATUSES.has(providerStatus)) return true;
  return false;
}

export function providerStatusOf(meta: Record<string, unknown>): string | null {
  const s = (meta as { provider_status?: unknown }).provider_status;
  return typeof s === 'string' && s.length > 0 ? s : null;
}

export async function getAdminMetrics(): Promise<AdminMetrics> {
  const zero: AdminMetrics = {
    users: 0, pendingDeposits: 0, pendingDepositsTotal: 0, pendingWithdrawals: 0,
    pendingWithdrawalsTotal: 0, activeInvested: 0, pendingManual: 0, pendingManualTotal: 0,
    autoPending: 0, autoFinished: 0, needsAttention: 0,
    providerApiConfigured: false, providerIpnConfigured: false, providerLastActivity: null,
    providerSyncError: null,
    dbOk: false,
  };
  try {
    // Reconcile BEFORE counting so "in flight" reflects provider truth, not
    // stale pending rows. Bounded + throttled; failures never break metrics.
    let syncError: string | null = null;
    try {
      const report = await reconcileStaleAutomatics();
      syncError = report.syncError;
    } catch {
      syncError = 'reconcile_failed';
    }
    const supabase = createClient();
    const num = (v: unknown) => (typeof v === 'string' ? Number(v) : typeof v === 'number' ? v : 0);
    const [{ count: users }, { data: dep }, { data: wd }, { data: inv }, { count: autoFinished }, { data: lastAct }] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('wallet_transactions').select('amount,provider,meta').eq('type', 'deposit').eq('status', 'pending'),
      supabase.from('wallet_transactions').select('amount').eq('type', 'withdrawal').eq('status', 'pending'),
      supabase.from('deployments').select('amount').eq('status', 'active'),
      supabase.from('wallet_transactions').select('id', { count: 'exact', head: true }).eq('type', 'deposit').eq('status', 'completed').eq('provider', 'nowpayments'),
      supabase.from('wallet_transactions').select('created_at').eq('provider', 'nowpayments').order('created_at', { ascending: false }).limit(1),
    ]);
    const sum = (rows: { amount: unknown }[] | null) =>
      (rows ?? []).reduce((a, r) => a + (Number.isFinite(num(r.amount)) ? num(r.amount) : 0), 0);
    let pendingManual = 0;
    let pendingManualTotal = 0;
    let autoPending = 0;
    let flagged = 0;
    for (const r of ((dep ?? []) as Record<string, unknown>[])) {
      const provider = typeof r.provider === 'string' ? r.provider : null;
      const meta = ((r.meta as Record<string, unknown> | null) ?? {});
      if (isAutomaticDeposit(provider)) {
        autoPending += 1;
      } else {
        pendingManual += 1;
        const a = num(r.amount);
        if (Number.isFinite(a)) pendingManualTotal += a;
      }
      if (depositNeedsReview(meta, providerStatusOf(meta))) flagged += 1;
    }
    // Provider health uses only local truth: key presence + latest provider
    // activity. Never claims "Operational" without evidence.
    const lastRows = ((lastAct ?? []) as Record<string, unknown>[]);
    return {
      users: users ?? 0,
      pendingDeposits: (dep ?? []).length,
      pendingDepositsTotal: sum(dep as { amount: unknown }[] | null),
      pendingWithdrawals: (wd ?? []).length,
      pendingWithdrawalsTotal: sum(wd as { amount: unknown }[] | null),
      activeInvested: sum(inv as { amount: unknown }[] | null),
      pendingManual,
      pendingManualTotal,
      autoPending,
      autoFinished: autoFinished ?? 0,
      needsAttention: pendingManual + flagged,
      providerApiConfigured: (() => { try { return providerEnabled(); } catch { return false; } })(),
      providerIpnConfigured: (() => { try { return !!runtimeEnv('NOWPAYMENTS_IPN_SECRET'); } catch { return false; } })(),
      providerLastActivity: lastRows.length > 0 ? String(lastRows[0].created_at ?? '') || null : null,
      providerSyncError: syncError,
      dbOk: true,
    };
  } catch {
    return zero;
  }
}

export interface AdminAsset {
  id: string;
  symbol: string;
  name: string;
  isActive: boolean;
  networks: AdminNetwork[];
}

export interface AdminNetwork {
  id: string;
  assetId: string;
  code: string;
  name: string;
  display: string;
  address: string;
  contract: string | null;
  memoRequired: boolean;
  memoLabel: string | null;
  confirmations: number;
  minimum: number;
  depositEnabled: boolean;
  withdrawalEnabled: boolean;
}

export async function getAdminAssets(): Promise<AdminAsset[]> {
  try {
    const supabase = createClient();
    const [{ data: assets }, { data: nets }] = await Promise.all([
      supabase.from('crypto_assets').select('id,symbol,name,is_active').order('id'),
      supabase.from('crypto_networks').select('*').order('id'),
    ]);
    const byAsset = new Map<string, AdminNetwork[]>();
    for (const r of ((nets ?? []) as Record<string, unknown>[])) {
      const aid = String(r.asset_id ?? '');
      const list = byAsset.get(aid) ?? [];
      list.push({
        id: String(r.id ?? ''),
        assetId: aid,
        code: String(r.network_code ?? ''),
        name: String(r.network_name ?? ''),
        display: String(r.display_name ?? ''),
        address: String(r.deposit_address ?? ''),
        contract: (r.token_contract_address as string | null) ?? null,
        memoRequired: Boolean(r.memo_required),
        memoLabel: (r.memo_label as string | null) ?? null,
        confirmations: Number(r.confirmations_required ?? 0),
        minimum: Number(r.minimum_deposit ?? 0),
        depositEnabled: Boolean(r.deposit_enabled),
        withdrawalEnabled: Boolean(r.withdrawal_enabled),
      });
      byAsset.set(aid, list);
    }
    return (((assets ?? []) as Record<string, unknown>[]).map((a) => ({
      id: String(a.id ?? ''),
      symbol: String(a.symbol ?? ''),
      name: String(a.name ?? ''),
      isActive: Boolean(a.is_active),
      networks: byAsset.get(String(a.id ?? '')) ?? [],
    })));
  } catch {
    return [];
  }
}

export interface AdminTxn {
  id: string;
  userId: string;
  userEmail: string | null;
  type: string;
  asset: string;
  amount: number;
  status: string;
  network: string | null;
  address: string | null;
  txHash: string | null;
  createdAt: string;
  meta: Record<string, unknown>;
  // Deposit rail: 'nowpayments' for automatic provider deposits, null for
  // manual TXID deposits. Drives AUTOMATIC/MANUAL badges + review routing.
  provider: string | null;
  // Provider-issued payment reference (NOWPayments payment_id). Never shown
  // to users; admin reconciliation only.
  providerRef: string | null;
}

async function userEmails(supabase: ReturnType<typeof createClient>, ids: string[]): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  if (ids.length === 0) return map;
  const { data } = await supabase.from('profiles').select('id,email').in('id', Array.from(new Set(ids)));
  for (const p of ((data ?? []) as Record<string, unknown>[])) {
    map.set(String(p.id), String(p.email ?? ''));
  }
  return map;
}

export type DepositKind = 'all' | 'manual' | 'automatic' | 'review';

export async function getAdminDeposits(status: string | null, kind: DepositKind = 'all'): Promise<AdminTxn[]> {
  try {
    // Reconcile BEFORE listing so terminal provider states (expired/failed/
    // finished) are reflected instead of stale pending rows. Bounded +
    // throttled; failures never break the listing.
    try {
      await reconcileStaleAutomatics();
    } catch {
      // Fall through to the stored rows.
    }
    const supabase = createClient();
    let q = supabase
      .from('wallet_transactions')
      .select('id,user_id,type,asset,amount,status,network,address,tx_hash,created_at,meta,provider,provider_ref')
      .eq('type', 'deposit')
      .order('created_at', { ascending: false })
      .limit(200);
    if (status && status !== 'all') q = q.eq('status', status);
    const { data } = await q;
    const rows = ((data ?? []) as Record<string, unknown>[]);
    const emails = await userEmails(supabase, rows.map((r) => String(r.user_id ?? '')));
    const num = (v: unknown) => (typeof v === 'string' ? Number(v) : typeof v === 'number' ? v : 0);
    const all = rows.map((r) => {
      const meta = ((r.meta as Record<string, unknown> | null) ?? {});
      const provider = typeof r.provider === 'string' ? r.provider : null;
      return {
        id: String(r.id ?? ''),
        userId: String(r.user_id ?? ''),
        userEmail: emails.get(String(r.user_id ?? '')) ?? null,
        type: 'deposit',
        asset: String(r.asset ?? ''),
        amount: num(r.amount),
        status: String(r.status ?? ''),
        network: (r.network as string | null) ?? null,
        address: (r.address as string | null) ?? null,
        txHash: (r.tx_hash as string | null) ?? null,
        createdAt: String(r.created_at ?? ''),
        meta,
        provider,
        providerRef: typeof r.provider_ref === 'string' && r.provider_ref.length > 0 ? r.provider_ref : null,
      };
    });
    if (kind === 'manual') return all.filter((d) => !isAutomaticDeposit(d.provider));
    if (kind === 'automatic') return all.filter((d) => isAutomaticDeposit(d.provider));
    if (kind === 'review') {
      return all.filter((d) => {
        if (d.status !== 'pending') return false;
        if (!isAutomaticDeposit(d.provider)) return true;
        return depositNeedsReview(d.meta, providerStatusOf(d.meta));
      });
    }
    return all;
  } catch {
    return [];
  }
}

export async function getAdminWithdrawals(status: string | null): Promise<AdminTxn[]> {
  try {
    const supabase = createClient();
    let q = supabase
      .from('wallet_transactions')
      .select('id,user_id,type,asset,amount,status,network,address,tx_hash,created_at,meta')
      .eq('type', 'withdrawal')
      .order('created_at', { ascending: false })
      .limit(200);
    if (status && status !== 'all') q = q.eq('status', status);
    const { data } = await q;
    const rows = ((data ?? []) as Record<string, unknown>[]);
    const emails = await userEmails(supabase, rows.map((r) => String(r.user_id ?? '')));
    const num = (v: unknown) => (typeof v === 'string' ? Number(v) : typeof v === 'number' ? v : 0);
    return rows.map((r) => ({
      id: String(r.id ?? ''),
      userId: String(r.user_id ?? ''),
      userEmail: emails.get(String(r.user_id ?? '')) ?? null,
      type: 'withdrawal',
      asset: String(r.asset ?? ''),
      amount: num(r.amount),
      status: String(r.status ?? ''),
      network: (r.network as string | null) ?? null,
      address: (r.address as string | null) ?? null,
      txHash: (r.tx_hash as string | null) ?? null,
      createdAt: String(r.created_at ?? ''),
      meta: ((r.meta as Record<string, unknown> | null) ?? {}),
      provider: null,
      providerRef: null,
    }));
  } catch {
    return [];
  }
}

export interface AdminUser {
  id: string;
  email: string;
  username: string | null;
  referralCode: string;
  createdAt: string;
}

export async function getAdminUsers(search: string): Promise<AdminUser[]> {
  try {
    const supabase = createClient();
    let q = supabase
      .from('profiles')
      .select('id,email,username,referral_code,created_at')
      .order('created_at', { ascending: false })
      .limit(100);
    const s = search.trim();
    if (s) q = q.or(`email.ilike.%${s}%,username.ilike.%${s}%`);
    const { data } = await q;
    return (((data ?? []) as Record<string, unknown>[]).map((p) => ({
      id: String(p.id ?? ''),
      email: String(p.email ?? ''),
      username: (p.username as string | null) ?? null,
      referralCode: String(p.referral_code ?? ''),
      createdAt: String(p.created_at ?? ''),
    })));
  } catch {
    return [];
  }
}

export interface AuditRow {
  id: string;
  actor: string | null;
  action: string;
  entity: string | null;
  entityId: string | null;
  createdAt: string;
}

export async function getAuditLog(): Promise<AuditRow[]> {
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from('audit_logs')
      .select('id,actor_id,action,entity,entity_id,created_at')
      .order('created_at', { ascending: false })
      .limit(200);
    return (((data ?? []) as Record<string, unknown>[]).map((r) => ({
      id: String(r.id ?? ''),
      actor: (r.actor_id as string | null) ?? null,
      action: String(r.action ?? ''),
      entity: (r.entity as string | null) ?? null,
      entityId: (r.entity_id as string | null) ?? null,
      createdAt: String(r.created_at ?? ''),
    })));
  } catch {
    return [];
  }
}

export interface TicketMessage {
  id: string;
  sender: 'user' | 'admin';
  body: string;
  internal: boolean;
  createdAt: string;
}

export interface AdminTicket {
  id: string;
  userId: string | null;
  userEmail: string | null;
  username: string | null;
  subject: string;
  opener: string;
  category: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  messages: TicketMessage[];
  unread: boolean;
}

// Unread = latest non-internal user activity is newer than the latest admin
// reply (the opener counts as user activity, so brand-new tickets are new).
export function ticketUnread(createdAt: string, messages: { sender: string; internal: boolean; createdAt: string }[]): boolean {
  let lastUser = Date.parse(createdAt);
  let lastAdmin = Number.NEGATIVE_INFINITY;
  for (const m of messages) {
    if (m.internal) continue;
    const t = Date.parse(m.createdAt);
    if (!Number.isFinite(t)) continue;
    if (m.sender === 'admin') lastAdmin = Math.max(lastAdmin, t);
    else lastUser = Math.max(lastUser, t);
  }
  if (!Number.isFinite(lastUser)) return false;
  return lastUser > lastAdmin;
}

export type TicketStatusFilter = 'all' | 'open' | 'answered' | 'closed';

export async function getAdminTickets(status: TicketStatusFilter, search: string): Promise<AdminTicket[]> {
  try {
    const supabase = createClient();
    let q = supabase
      .from('support_tickets')
      .select('id,user_id,subject,message,category,status,created_at,updated_at')
      .order('updated_at', { ascending: false })
      .limit(100);
    if (status !== 'all') q = q.eq('status', status);
    const s = search.trim();
    if (s) q = q.or(`subject.ilike.%${s}%,message.ilike.%${s}%`);
    const { data } = await q;
    const rows = ((data ?? []) as Record<string, unknown>[]);
    if (rows.length === 0) return [];
    const ids = rows.map((r) => String(r.id ?? ''));
    const [{ data: msgs }, { data: profiles }] = await Promise.all([
      supabase.from('ticket_messages').select('id,ticket_id,sender,body,internal,created_at').in('ticket_id', ids).order('created_at', { ascending: true }).limit(2000),
      supabase.from('profiles').select('id,email,username,created_at').in('id', Array.from(new Set(rows.map((r) => String(r.user_id ?? ''))))),
    ]);
    const byTicket = new Map<string, TicketMessage[]>();
    for (const m of ((msgs ?? []) as Record<string, unknown>[])) {
      const tid = String(m.ticket_id ?? '');
      const list = byTicket.get(tid) ?? [];
      list.push({
        id: String(m.id ?? ''),
        sender: m.sender === 'admin' ? ('admin' as const) : ('user' as const),
        body: String(m.body ?? ''),
        internal: Boolean(m.internal),
        createdAt: String(m.created_at ?? ''),
      });
      byTicket.set(tid, list);
    }
    const people = new Map<string, { email: string; username: string | null; since: string }>();
    for (const p of ((profiles ?? []) as Record<string, unknown>[])) {
      people.set(String(p.id), {
        email: String(p.email ?? ''),
        username: (p.username as string | null) ?? null,
        since: String(p.created_at ?? ''),
      });
    }
    return rows.map((r) => {
      const id = String(r.id ?? '');
      const uid = typeof r.user_id === 'string' ? r.user_id : null;
      const person = uid ? people.get(uid) : undefined;
      const createdAt = String(r.created_at ?? '');
      const messages = byTicket.get(id) ?? [];
      return {
        id,
        userId: uid,
        userEmail: person?.email ?? null,
        username: person?.username ?? null,
        subject: String(r.subject ?? ''),
        opener: String(r.message ?? ''),
        category: String(r.category ?? 'general'),
        status: String(r.status ?? 'open'),
        createdAt,
        updatedAt: String((r.updated_at as string | null) ?? createdAt),
        messages,
        unread: ticketUnread(createdAt, messages),
      };
    });
  } catch {
    return [];
  }
}

export async function getAdminTicket(id: string): Promise<AdminTicket | null> {
  try {
    const supabase = createClient();
    const { data: row } = await supabase
      .from('support_tickets')
      .select('id,user_id,subject,message,category,status,created_at,updated_at')
      .eq('id', id)
      .maybeSingle();
    const r = (row ?? {}) as Record<string, unknown>;
    if (!r.id) return null;
    const uid = typeof r.user_id === 'string' ? r.user_id : null;
    const [{ data: msgs }, { data: prof }] = await Promise.all([
      supabase.from('ticket_messages').select('id,sender,body,internal,created_at').eq('ticket_id', id).order('created_at', { ascending: true }).limit(500),
      uid
        ? supabase.from('profiles').select('id,email,username').eq('id', uid).maybeSingle()
        : Promise.resolve({ data: null } as { data: null }),
    ]);
    const messages: TicketMessage[] = (((msgs ?? []) as Record<string, unknown>[]).map((m) => ({
      id: String(m.id ?? ''),
      sender: m.sender === 'admin' ? ('admin' as const) : ('user' as const),
      body: String(m.body ?? ''),
      internal: Boolean(m.internal),
      createdAt: String(m.created_at ?? ''),
    })));
    const p = ((prof ?? {}) as Record<string, unknown>);
    const createdAt = String(r.created_at ?? '');
    return {
      id: String(r.id ?? ''),
      userId: uid,
      userEmail: typeof p.email === 'string' ? p.email : null,
      username: typeof p.username === 'string' ? p.username : null,
      subject: String(r.subject ?? ''),
      opener: String(r.message ?? ''),
      category: String(r.category ?? 'general'),
      status: String(r.status ?? 'open'),
      createdAt,
      updatedAt: String((r.updated_at as string | null) ?? createdAt),
      messages,
      unread: ticketUnread(createdAt, messages),
    };
  } catch {
    return null;
  }
}

export interface TicketUserContext {
  email: string | null;
  username: string | null;
  since: string | null;
  recentDeposits: { id: string; asset: string; amount: number; status: string; provider: string | null; createdAt: string }[];
  recentWithdrawals: { id: string; asset: string; amount: number; status: string; createdAt: string }[];
}

export async function getAdminTicketContext(userId: string | null): Promise<TicketUserContext> {
  const empty: TicketUserContext = { email: null, username: null, since: null, recentDeposits: [], recentWithdrawals: [] };
  if (!userId) return empty;
  try {
    const supabase = createClient();
    const [{ data: profile }, { data: dep }, { data: wd }] = await Promise.all([
      supabase.from('profiles').select('email,username,created_at').eq('id', userId).maybeSingle(),
      supabase.from('wallet_transactions').select('id,asset,amount,status,provider,created_at').eq('user_id', userId).eq('type', 'deposit').order('created_at', { ascending: false }).limit(5),
      supabase.from('wallet_transactions').select('id,asset,amount,status,created_at').eq('user_id', userId).eq('type', 'withdrawal').order('created_at', { ascending: false }).limit(5),
    ]);
    const p = (profile ?? {}) as Record<string, unknown>;
    const num = (v: unknown) => (typeof v === 'string' ? Number(v) : typeof v === 'number' ? v : 0);
    return {
      email: typeof p.email === 'string' ? p.email : null,
      username: typeof p.username === 'string' ? p.username : null,
      since: typeof p.created_at === 'string' ? (p.created_at as string).slice(0, 10) : null,
      recentDeposits: (((dep ?? []) as Record<string, unknown>[]).map((r) => ({
        id: String(r.id ?? ''), asset: String(r.asset ?? ''), amount: num(r.amount), status: String(r.status ?? ''),
        provider: typeof r.provider === 'string' ? r.provider : null, createdAt: String(r.created_at ?? ''),
      }))),
      recentWithdrawals: (((wd ?? []) as Record<string, unknown>[]).map((r) => ({
        id: String(r.id ?? ''), asset: String(r.asset ?? ''), amount: num(r.amount), status: String(r.status ?? ''),
        createdAt: String(r.created_at ?? ''),
      }))),
    };
  } catch {
    return empty;
  }
}

export async function getOpenTicketCount(): Promise<number> {
  try {
    const supabase = createClient();
    const { count } = await supabase.from('support_tickets').select('id', { count: 'exact', head: true }).in('status', ['open', 'answered']);
    return count ?? 0;
  } catch {
    return 0;
  }
}

export async function getSettings(): Promise<{ key: string; value: string }[]> {
  try {
    const supabase = createClient();
    const { data } = await supabase.from('platform_settings').select('key,value').order('key');
    return (((data ?? []) as Record<string, unknown>[]).map((r) => ({
      key: String(r.key ?? ''),
      value: String(r.value ?? ''),
    })));
  } catch {
    return [];
  }
}
