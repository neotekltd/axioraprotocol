// Provider payout actions (server only). Approval-first withdrawals:
// admin approves -> Axiora creates the NOWPayments payout batch ->
// operator verifies the batch in the NOWPayments dashboard (2FA) ->
// Axiora polls payout status and records the real blockchain TXID.
// Every step is idempotent and audited. Financial debits happen ONLY by
// moving the same withdrawal ledger row pending -> processing -> completed.
'use server';

import { revalidatePath } from 'next/cache';
import { createServiceClient } from '@/lib/supabase/service';
import { requireAdminId } from '@/lib/admin';
import { createPayout, getPayoutStatus, providerEnabled, payoutCurrencyFor, NpError } from '@/lib/nowpayments';
import { SITE_URL } from '@/lib/config';
import type { AdminResult } from '@/lib/admin-actions';

async function audit(
  svc: ReturnType<typeof createServiceClient>,
  adminId: string,
  action: string,
  entityId: string,
  meta?: Record<string, unknown>
): Promise<void> {
  try {
    await svc.from('audit_logs').insert({
      actor_id: adminId,
      action,
      entity: 'withdrawal',
      entity_id: entityId,
      meta: meta ?? {},
    });
  } catch {
    // Audit is best-effort; the primary mutation result stands.
  }
}

// Raw (unfloored) available balance for the safety re-check. Mirrors
// getPortfolioSummary math exactly; negative means inconsistent state.
async function rawAvailable(svc: ReturnType<typeof createServiceClient>, userId: string): Promise<number> {
  try {
    await svc.rpc('process_due_payouts');
  } catch {
    // Settlement is best-effort here; the check below stays conservative.
  }
  const [{ data: txns }, { data: deps }, { data: earnings }] = await Promise.all([
    svc.from('wallet_transactions').select('type,amount,status').eq('user_id', userId).limit(1000),
    svc.from('deployments').select('amount,profit,status').eq('user_id', userId),
    svc.from('referral_earnings').select('amount,status').eq('user_id', userId),
  ]);
  const sum = (rows: { amount: number | string }[] | null) =>
    (rows ?? []).reduce((a, r) => a + Number(r.amount), 0);
  const t = (txns ?? []) as { type: string; amount: string; status: string }[];
  const completed = t.filter((r) => r.status === 'completed');
  const deposited = sum(completed.filter((r) => r.type === 'deposit'));
  const withdrawn = sum(completed.filter((r) => r.type === 'withdrawal'));
  const reserved = sum(t.filter((r) => r.type === 'withdrawal' && (r.status === 'pending' || r.status === 'processing')));
  const d = (deps ?? []) as { amount: string; profit: string; status: string }[];
  const deployedActive = sum(d.filter((r) => r.status === 'pending' || r.status === 'active'));
  const profitCredited = sum(completed.filter((r) => r.type === 'profit'));
  const e = (earnings ?? []) as { amount: string; status: string }[];
  const referralCredited = sum(e.filter((r) => r.status === 'available'));
  return deposited - withdrawn - reserved - deployedActive + profitCredited + referralCredited;
}

export async function approveWithdrawalPayout(id: string): Promise<AdminResult> {
  const adminId = await requireAdminId();
  if (!adminId) return { ok: false, message: 'Unauthorized.' };
  if (!providerEnabled()) {
    return { ok: false, message: 'Provider disabled — NOWPayments API key is not configured.' };
  }
  const svc = createServiceClient();
  try {
    const { data: row } = await svc
      .from('wallet_transactions')
      .select('id,status,type,asset,network,address,amount,user_id,meta')
      .eq('id', id)
      .maybeSingle();
    const r = row as {
      id: string; status: string; type: string; asset: string;
      network: string | null; address: string | null; amount: string; user_id: string;
      meta: Record<string, unknown> | null;
    } | null;
    if (!r || r.type !== 'withdrawal') return { ok: false, message: 'Withdrawal not found.' };
    if (r.status !== 'pending') return { ok: false, message: `Only pending withdrawals can be approved (now ${r.status}).` };
    if (!r.address) return { ok: false, message: 'No destination address on this request.' };

    // Idempotency: a payout row already means approval happened.
    const { data: prior } = await svc
      .from('provider_payouts')
      .select('id,batch_id,status')
      .eq('withdrawal_tx_id', id)
      .maybeSingle();
    if (prior) {
      return { ok: true, message: `Payout already created (batch ${prior.batch_id ?? 'pending'}). No duplicate created.` };
    }

    // Safety re-check on live state, never on request-time values.
    const raw = await rawAvailable(svc, r.user_id);
    if (raw < 0) return { ok: false, message: 'Ledger inconsistent — approval refused. Investigate before retrying.' };

    const currency = payoutCurrencyFor(r.asset, r.network ?? '');
    if (!currency) return { ok: false, message: `Unsupported payout route ${r.asset}/${r.network ?? '?'}.` };

    let batch;
    try {
      batch = await createPayout({
        address: r.address,
        currency,
        amount: Number(r.amount),
        ipnCallbackUrl: `${SITE_URL.replace(/\/$/, '')}/api/payments/nowpayments/ipn`,
      });
    } catch (e) {
      const detail = e instanceof NpError ? ` Provider said HTTP ${e.status}.` : '';
      return { ok: false, message: `Provider payout creation failed.${detail} Request left pending — safe to retry.` };
    }

    const { error: payoutError } = await svc.from('provider_payouts').insert({
      withdrawal_tx_id: id,
      user_id: r.user_id,
      provider: 'nowpayments',
      batch_id: String(batch.id),
      asset: r.asset,
      network: r.network ?? '',
      destination: r.address,
      amount: Number(r.amount).toFixed(2),
      status: 'pending_verification',
      provider_status: batch.status ?? 'created',
      payload: batch,
    });
    if (payoutError) {
      // Unique violation means a concurrent approval won: converge, never duplicate.
      const { data: raced } = await svc
        .from('provider_payouts')
        .select('batch_id')
        .eq('withdrawal_tx_id', id)
        .maybeSingle();
      if (raced) return { ok: true, message: 'Payout already created by a concurrent approval. No duplicate created.' };
      return { ok: false, message: 'Could not record the payout. Provider batch may exist — check before retrying.' };
    }

    const { error: txError } = await svc
      .from('wallet_transactions')
      .update({
        status: 'processing',
        meta: { ...(r.meta ?? {}), provider_batch_id: String(batch.id), approved_via: 'nowpayments' },
      })
      .eq('id', id)
      .eq('status', 'pending');
    if (txError) throw txError;

    await audit(svc, adminId, 'WITHDRAWAL_PAYOUT_CREATED', id, {
      batchId: String(batch.id),
      amount: r.amount,
      asset: r.asset,
      network: r.network,
      destination: r.address,
    });
    revalidatePath('/admin');
    return {
      ok: true,
      message: `Provider payout ${String(batch.id)} created. Verify it in the NOWPayments dashboard (2FA), then Sync status.`,
    };
  } catch {
    return { ok: false, message: 'Could not approve the withdrawal.' };
  }
}

export async function syncPayoutStatus(id: string): Promise<AdminResult> {
  const adminId = await requireAdminId();
  if (!adminId) return { ok: false, message: 'Unauthorized.' };
  if (!providerEnabled()) {
    return { ok: false, message: 'Provider disabled — NOWPayments API key is not configured.' };
  }
  const svc = createServiceClient();
  try {
    const { data: payout } = await svc
      .from('provider_payouts')
      .select('id,withdrawal_tx_id,batch_id,status,user_id,amount')
      .eq('withdrawal_tx_id', id)
      .maybeSingle();
    const p = payout as {
      id: string; withdrawal_tx_id: string; batch_id: string | null;
      status: string; user_id: string; amount: string;
    } | null;
    if (!p || !p.batch_id) return { ok: false, message: 'No provider payout for this withdrawal yet.' };
    if (['finished', 'failed', 'cancelled'].includes(p.status)) {
      return { ok: true, message: `Payout already terminal (${p.status}).` };
    }

    let remote;
    try {
      remote = await getPayoutStatus(p.batch_id);
    } catch {
      return { ok: false, message: 'Provider unreachable — try again shortly.' };
    }

    const wd = (remote.withdrawals ?? [])[0];
    const providerStatus = (wd?.status ?? remote.status ?? '').toLowerCase();
    const hash = wd?.hash ? String(wd.hash).toLowerCase() : null;

    if (providerStatus === 'finished' || providerStatus === 'sent') {
      const { error } = await svc
        .from('wallet_transactions')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          ...(hash ? { tx_hash: hash } : {}),
        })
        .eq('id', p.withdrawal_tx_id)
        .eq('status', 'processing');
      if (error) throw error;
      await svc
        .from('provider_payouts')
        .update({
          status: 'finished',
          provider_status: providerStatus,
          tx_hash: hash,
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          payload: remote,
        })
        .eq('id', p.id);
      await audit(svc, adminId, 'WITHDRAWAL_COMPLETED', p.withdrawal_tx_id, {
        batchId: p.batch_id,
        txHash: hash,
      });
      revalidatePath('/admin');
      return { ok: true, message: hash ? `Completed on-chain. TXID ${hash.slice(0, 18)}… recorded.` : 'Marked completed (hash pending).' };
    }

    if (providerStatus === 'failed' || providerStatus === 'rejected') {
      await svc
        .from('wallet_transactions')
        .update({ status: 'failed' })
        .eq('id', p.withdrawal_tx_id)
        .eq('status', 'processing');
      await svc
        .from('provider_payouts')
        .update({ status: 'failed', provider_status: providerStatus, updated_at: new Date().toISOString(), payload: remote })
        .eq('id', p.id);
      await audit(svc, adminId, 'WITHDRAWAL_FAILED', p.withdrawal_tx_id, { batchId: p.batch_id });
      revalidatePath('/admin');
      return { ok: false, message: 'Provider reports failure. Funds released from reservation — review before retrying.' };
    }

    await svc
      .from('provider_payouts')
      .update({ provider_status: providerStatus, updated_at: new Date().toISOString(), payload: remote })
      .eq('id', p.id);
    await audit(svc, adminId, 'WITHDRAWAL_PAYOUT_SYNC', p.withdrawal_tx_id, { batchId: p.batch_id, providerStatus });
    revalidatePath('/admin');
    return { ok: true, message: `Provider status: ${providerStatus || 'unknown'}. Still in flight — sync again later.` };
  } catch {
    return { ok: false, message: 'Could not sync payout status.' };
  }
}
