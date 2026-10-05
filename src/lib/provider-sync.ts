// Provider-authoritative automatic-deposit synchronization. SERVER ONLY —
// never import from client components or browser code (uses the service
// key + the NOWPayments API key).
//
// Problem it fixes: automatic deposits stayed `pending` forever when an IPN
// never arrived (missed callback, expired payment window). The Axiora row
// is NEVER the source of truth for automatic deposits — NOWPayments is.
//
// Rules (mirror the IPN route exactly; both paths share applyProviderState):
// - finished            -> credit exactly once (idempotent RPC), completed
// - failed / refunded   -> failed
// - expired             -> expired (migration 0021)
// - partially_paid etc. -> pending + needs_review flag (exception queue)
// - waiting / confirming / confirmed / sending -> pending, meta updated
// - provider unreachable -> change NOTHING, report error (retain state)

import { createServiceClient } from '@/lib/supabase/service';
import {
  creditDecision,
  getPaymentStatus,
  providerEnabled,
} from '@/lib/nowpayments';

export interface ProviderRow {
  id: string;
  userId: string;
  asset: string;
  amount: number;
  status: string;
  network: string | null;
  meta: Record<string, unknown>;
  paymentRef: string;
}

export type SyncOutcome =
  | 'credited'
  | 'already_credited'
  | 'recorded'
  | 'terminal'
  | 'review'
  | 'unchanged';

export interface SyncResult {
  result: SyncOutcome | 'error' | 'not_found' | 'skipped';
  providerStatus: string | null;
  error?: string;
}

const TERMINAL_INTERNAL: Record<string, 'failed' | 'expired'> = {
  failed: 'failed',
  refunded: 'failed',
  expired: 'expired',
};

// Numeric refs are real NOWPayments payment_ids. AXD-* refs are local
// intents whose provider payment was never created — nothing to sync.
export function isSyncableRef(ref: string | null): boolean {
  return !!ref && /^\d+$/.test(ref);
}

// Throttle: do not hammer the provider for rows checked recently.
export function shouldReconcile(meta: Record<string, unknown>, maxAgeMs: number, now = Date.now()): boolean {
  const last = meta.last_provider_check;
  if (typeof last !== 'string') return true;
  const t = Date.parse(last);
  if (!Number.isFinite(t)) return true;
  return now - t > maxAgeMs;
}

const str = (v: unknown): string | null => (typeof v === 'string' && v.length > 0 ? v : null);
const num = (v: unknown): number | null => (typeof v === 'number' && Number.isFinite(v) ? v : null);

export async function fetchRowByPaymentRef(
  svc: ReturnType<typeof createServiceClient>,
  paymentRef: string
): Promise<ProviderRow | null> {
  const { data: row } = await svc
    .from('wallet_transactions')
    .select('id, user_id, asset, amount, status, network, meta, provider_ref')
    .eq('provider', 'nowpayments')
    .eq('provider_ref', paymentRef)
    .maybeSingle();
  if (!row) return null;
  const r = row as Record<string, unknown>;
  return {
    id: String(r.id ?? ''),
    userId: String(r.user_id ?? ''),
    asset: String(r.asset ?? ''),
    amount: Number(r.amount ?? 0),
    status: String(r.status ?? ''),
    network: (r.network as string | null) ?? null,
    meta: ((r.meta as Record<string, unknown> | null) ?? {}),
    paymentRef: String(r.provider_ref ?? paymentRef),
  };
}

export interface FreshProviderState {
  status: string;
  payAddress: string | null;
  payCurrency: string | null;
  actuallyPaidCrypto: number | null;
  outcomeAmount: number | null;
  outcomeCurrency: string | null;
  orderId: string | null;
}

// Applies one authoritative provider state to one ledger row. Idempotent:
// repeated calls converge (completed stays completed, terminal stays
// terminal, flags stay flagged). Never throws — callers decide.
export async function applyProviderState(
  svc: ReturnType<typeof createServiceClient>,
  row: ProviderRow,
  fresh: FreshProviderState
): Promise<SyncResult> {
  const meta = row.meta ?? {};
  const stamp = new Date().toISOString();
  try {
    // Terminated locally already: only refresh the recorded status, never
    // move money or reopen.
    if (row.status !== 'pending') {
      await svc
        .from('wallet_transactions')
        .update({ meta: { ...meta, provider_status: fresh.status, last_provider_check: stamp } })
        .eq('id', row.id);
      return { result: 'unchanged', providerStatus: fresh.status };
    }

    const decision = creditDecision({
      providerStatus: fresh.status,
      expected: Number.isFinite(row.amount) ? row.amount : 0,
      actuallyPaidCrypto: fresh.actuallyPaidCrypto,
      outcomeAmount: fresh.outcomeAmount,
      outcomeCurrency: fresh.outcomeCurrency,
    });

    if (decision.outcome === 'credit') {
      const res = await svc.rpc('apply_provider_credit', {
        p_provider: 'nowpayments',
        p_payment_id: row.paymentRef,
        p_order_id: str(meta.order_id) ?? '',
        p_user_id: row.userId,
        p_asset: row.asset,
        p_network: row.network ?? '',
        p_pay_address: fresh.payAddress ?? '',
        p_expected: Number.isFinite(row.amount) ? row.amount : 0,
        p_credit_amount: decision.creditAmount,
        p_mark_completed: true,
        p_provider_status: fresh.status,
        p_tx_hash: '',
        p_payload: { reconciled: true, at: stamp },
      });
      if (res.error) throw res.error;
      await svc
        .from('wallet_transactions')
        .update({ meta: { ...meta, provider_status: fresh.status, last_provider_check: stamp } })
        .eq('id', row.id);
      return { result: res.data === 'already_credited' ? 'already_credited' : 'credited', providerStatus: fresh.status };
    }

    if (decision.outcome === 'terminal') {
      const internal = TERMINAL_INTERNAL[fresh.status] ?? 'failed';
      await svc
        .from('wallet_transactions')
        .update({
          status: internal,
          meta: { ...meta, provider_status: fresh.status, last_provider_check: stamp },
        })
        .eq('id', row.id)
        .eq('status', 'pending');
      return { result: 'terminal', providerStatus: fresh.status };
    }

    if (decision.outcome === 'review') {
      await svc
        .from('wallet_transactions')
        .update({ meta: { ...meta, provider_status: fresh.status, last_provider_check: stamp, needs_review: true, review_reason: decision.reason } })
        .eq('id', row.id)
        .eq('status', 'pending');
      return { result: 'review', providerStatus: fresh.status };
    }

    // Active intermediate state (waiting/confirming/confirmed/sending):
    // record provider truth, keep pending.
    await svc
      .from('wallet_transactions')
      .update({ meta: { ...meta, provider_status: fresh.status, last_provider_check: stamp } })
      .eq('id', row.id);
    return { result: 'recorded', providerStatus: fresh.status };
  } catch (e) {
    return { result: 'error', providerStatus: fresh.status, error: e instanceof Error ? e.message : 'apply_failed' };
  }
}

// Full reconcile of one automatic deposit against the provider. Returns
// error (changing nothing) when the provider is unreachable.
export async function syncAutomaticDepositByRef(paymentRef: string): Promise<SyncResult> {
  if (!isSyncableRef(paymentRef)) return { result: 'skipped', providerStatus: null };
  let svc: ReturnType<typeof createServiceClient>;
  try {
    svc = createServiceClient();
  } catch {
    return { result: 'error', providerStatus: null, error: 'no_service_client' };
  }
  if (!providerEnabled()) return { result: 'error', providerStatus: null, error: 'provider_disabled' };
  const row = await fetchRowByPaymentRef(svc, paymentRef);
  if (!row) return { result: 'not_found', providerStatus: null };
  if (row.status !== 'pending') return { result: 'unchanged', providerStatus: null };
  let fresh;
  try {
    fresh = await withTimeout(getPaymentStatus(paymentRef), 9000);
  } catch {
    return { result: 'error', providerStatus: null, error: 'provider_unreachable' };
  }
  const p = fresh as unknown as Record<string, unknown>;
  return applyProviderState(svc, row, {
    status: str(p.payment_status) ?? 'waiting',
    payAddress: str(p.pay_address),
    payCurrency: str(p.pay_currency),
    actuallyPaidCrypto: num((p as { actually_paid?: unknown }).actually_paid),
    outcomeAmount: num((p as { outcome_amount?: unknown }).outcome_amount),
    outcomeCurrency: str((p as { outcome_currency?: unknown }).outcome_currency),
    orderId: str(p.order_id),
  });
}

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const timeout = new Promise<T>((_, reject) => {
    timer = setTimeout(() => reject(new Error('provider_timeout')), ms);
  });
  return Promise.race([p, timeout]).then(
    (v) => {
      clearTimeout(timer);
      return v;
    },
    (e) => {
      clearTimeout(timer);
      throw e;
    }
  );
}

export interface ReconcileReport {
  checked: number;
  updated: number;
  failed: number;
  syncError: string | null;
}

// Reconciles stale non-terminal automatic deposits (throttled, bounded).
// Safe fallback: provider unreachable -> rows keep previous state, and the
// failure is reported (never marks anything failed/expired on transport
// errors). Never throws.
export async function reconcileStaleAutomatics(opts?: { maxRows?: number; maxAgeMs?: number }): Promise<ReconcileReport> {
  const maxRows = opts?.maxRows ?? 10;
  const maxAgeMs = opts?.maxAgeMs ?? 5 * 60 * 1000;
  const report: ReconcileReport = { checked: 0, updated: 0, failed: 0, syncError: null };
  let svc: ReturnType<typeof createServiceClient>;
  try {
    svc = createServiceClient();
  } catch {
    report.syncError = 'no_service_client';
    return report;
  }
  if (!providerEnabled()) {
    report.syncError = 'provider_disabled';
    return report;
  }
  let rows: Record<string, unknown>[];
  try {
    const { data, error } = await svc
      .from('wallet_transactions')
      .select('provider_ref, meta, created_at')
      .eq('type', 'deposit')
      .eq('status', 'pending')
      .eq('provider', 'nowpayments')
      .order('created_at', { ascending: true })
      .limit(50);
    if (error) throw error;
    rows = (data ?? []) as Record<string, unknown>[];
  } catch {
    report.syncError = 'db_unavailable';
    return report;
  }
  const due = rows
    .map((r) => String(r.provider_ref ?? ''))
    .filter((ref) => isSyncableRef(ref))
    .filter((ref, i, arr) => arr.indexOf(ref) === i);
  const metas = new Map(rows.map((r) => [String(r.provider_ref ?? ''), ((r.meta as Record<string, unknown> | null) ?? {})]));
  const targets = due.filter((ref) => shouldReconcile(metas.get(ref) ?? {}, maxAgeMs)).slice(0, maxRows);
  if (targets.length === 0) return report;
  const settled = await Promise.allSettled(targets.map((ref) => syncAutomaticDepositByRef(ref)));
  for (const s of settled) {
    report.checked += 1;
    if (s.status === 'fulfilled') {
      const r = s.value;
      if (r.result === 'error') {
        report.failed += 1;
        if (r.error === 'provider_unreachable' || r.error === 'provider_timeout') {
          report.syncError = 'provider_unreachable';
        }
      } else if (r.result !== 'unchanged' && r.result !== 'skipped' && r.result !== 'not_found') {
        report.updated += 1;
      }
    } else {
      report.failed += 1;
    }
  }
  // Transport-level failure across the board: surface degraded health.
  if (report.checked > 0 && report.updated === 0 && report.failed === report.checked) {
    report.syncError = report.syncError ?? 'provider_unreachable';
  }
  return report;
}
