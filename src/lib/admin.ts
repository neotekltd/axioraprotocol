// Admin read layer (server only). Every query is defensive and scoped:
// admin tables enforce RLS via is_admin(); the gate below rejects
// non-admins before any data loads. No secrets here — the server client
// uses the session cookie + RLS, never the service key.
import { createClient } from '@/lib/supabase/server';
import { getSessionUser } from '@/lib/queries';
import { isSoleAdminEmail } from '@/lib/admin-email';

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
}

export async function getAdminMetrics(): Promise<AdminMetrics> {
  const zero = { users: 0, pendingDeposits: 0, pendingDepositsTotal: 0, pendingWithdrawals: 0, pendingWithdrawalsTotal: 0, activeInvested: 0 };
  try {
    const supabase = createClient();
    const num = (v: unknown) => (typeof v === 'string' ? Number(v) : typeof v === 'number' ? v : 0);
    const [{ count: users }, { data: dep }, { data: wd }, { data: inv }] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('wallet_transactions').select('amount').eq('type', 'deposit').eq('status', 'pending'),
      supabase.from('wallet_transactions').select('amount').eq('type', 'withdrawal').eq('status', 'pending'),
      supabase.from('deployments').select('amount').eq('status', 'active'),
    ]);
    const sum = (rows: { amount: unknown }[] | null) =>
      (rows ?? []).reduce((a, r) => a + (Number.isFinite(num(r.amount)) ? num(r.amount) : 0), 0);
    return {
      users: users ?? 0,
      pendingDeposits: (dep ?? []).length,
      pendingDepositsTotal: sum(dep as { amount: unknown }[] | null),
      pendingWithdrawals: (wd ?? []).length,
      pendingWithdrawalsTotal: sum(wd as { amount: unknown }[] | null),
      activeInvested: sum(inv as { amount: unknown }[] | null),
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

export async function getAdminDeposits(status: string | null): Promise<AdminTxn[]> {
  try {
    const supabase = createClient();
    let q = supabase
      .from('wallet_transactions')
      .select('id,user_id,type,asset,amount,status,network,address,tx_hash,created_at,meta')
      .eq('type', 'deposit')
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
      type: 'deposit',
      asset: String(r.asset ?? ''),
      amount: num(r.amount),
      status: String(r.status ?? ''),
      network: (r.network as string | null) ?? null,
      address: (r.address as string | null) ?? null,
      txHash: (r.tx_hash as string | null) ?? null,
      createdAt: String(r.created_at ?? ''),
      meta: ((r.meta as Record<string, unknown> | null) ?? {}),
    }));
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
