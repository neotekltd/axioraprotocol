import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';
import { verifyIpnSignature, creditDecision } from '@/lib/nowpayments';

// Public NOWPayments IPN endpoint:
//   https://axioraprotocol.com/api/payments/nowpayments/ipn
// Configure this URL (plus the IPN secret) in the NOWPayments dashboard
// Store Settings. Every callback is HMAC-authenticated, mapped to a known
// Axiora ledger row, and applied idempotently — retries can never credit
// twice. Always answers 2xx for accepted/ignored callbacks so the provider
// stops retrying; 401 only for bad signatures, 400 for malformed bodies.

interface IpnPayload {
  payment_id?: unknown;
  payment_status?: unknown;
  order_id?: unknown;
  pay_currency?: unknown;
  price_amount?: unknown;
  price_currency?: unknown;
  actually_paid?: unknown;
  outcome_amount?: unknown;
  outcome_currency?: unknown;
  pay_address?: unknown;
  purchase_id?: unknown;
}

const num = (v: unknown): number | null => (typeof v === 'number' && Number.isFinite(v) ? v : null);
const str = (v: unknown): string | null => (typeof v === 'string' && v.length > 0 ? v : null);

export async function POST(req: Request) {
  const raw = await req.text();
  const signature = req.headers.get('x-nowpayments-sig');
  let ok = false;
  try {
    ok = await verifyIpnSignature(raw, signature);
  } catch {
    ok = false;
  }
  if (!ok) return NextResponse.json({ error: 'BAD_SIGNATURE' }, { status: 401 });

  let payload: IpnPayload;
  try {
    payload = JSON.parse(raw) as IpnPayload;
  } catch {
    return NextResponse.json({ error: 'BAD_JSON' }, { status: 400 });
  }

  // payment_id is numeric in real NOWPayments callbacks — accept both.
  const rawId: unknown = payload.payment_id;
  const paymentId =
    str(rawId) ?? (typeof rawId === 'number' && Number.isFinite(rawId) ? String(rawId) : null);
  const providerStatus = str(payload.payment_status);
  if (!paymentId || !providerStatus) {
    return NextResponse.json({ error: 'BAD_SHAPE' }, { status: 400 });
  }

  const svc = createServiceClient();
  const { data: row } = await svc
    .from('wallet_transactions')
    .select('id, user_id, asset, amount, status, network, meta')
    .eq('provider', 'nowpayments')
    .eq('provider_ref', paymentId)
    .maybeSingle();

  // Unknown payment: acknowledge without action (stops provider retries;
  // operator can reconcile from the provider dashboard).
  if (!row) {
    console.warn(`[ipn] unknown payment ${paymentId} status=${providerStatus}`);
    return NextResponse.json({ result: 'ignored_unknown_payment' });
  }

  const meta = (row.meta as Record<string, unknown>) ?? {};
  const orderId = str(payload.order_id);
  const storedOrder = typeof meta.order_id === 'string' ? meta.order_id : null;
  if (storedOrder && orderId && storedOrder !== orderId) {
    await svc
      .from('wallet_transactions')
      .update({ meta: { ...meta, needs_review: true, order_mismatch: orderId } })
      .eq('id', row.id)
      .eq('status', 'pending');
    console.warn(`[ipn] order mismatch payment=${paymentId}`);
    return NextResponse.json({ result: 'recorded_order_mismatch' });
  }

  const expected = Number(row.amount);
  const decision = creditDecision({
    providerStatus,
    expected: Number.isFinite(expected) ? expected : 0,
    actuallyPaidCrypto: num(payload.actually_paid),
    outcomeAmount: num(payload.outcome_amount),
    outcomeCurrency: str(payload.outcome_currency),
  });
  // Note: deposit callbacks carry no user-facing blockchain hash
  // (purchase_id is an internal provider reference, not a TXID), so the
  // ledger tx_hash stays empty — provider state is authoritative here.
  const { data, error } = await svc.rpc('apply_provider_credit', {
    p_provider: 'nowpayments',
    p_payment_id: paymentId,
    p_order_id: orderId ?? storedOrder ?? '',
    p_user_id: row.user_id,
    p_asset: row.asset,
    p_network: row.network ?? '',
    p_pay_address: str(payload.pay_address) ?? '',
    p_expected: Number.isFinite(expected) ? expected : 0,
    p_credit_amount: decision.creditAmount,
    p_mark_completed: decision.outcome === 'credit',
    p_provider_status: providerStatus,
    p_tx_hash: '',
    p_payload: payload as Record<string, unknown>,
  });
  if (error) {
    console.error(`[ipn] credit apply failed payment=${paymentId} code=${error.code}`);
    return NextResponse.json({ error: 'APPLY_FAILED' }, { status: 500 });
  }

  if (data === 'credited') {
    console.info(`[ipn] credited payment=${paymentId} amount=${decision.creditAmount}`);
  }

  // Terminal provider states close a still-pending ledger row as failed;
  // review states flag it without touching the balance.
  if (decision.outcome === 'terminal') {
    await svc
      .from('wallet_transactions')
      .update({ status: 'failed' })
      .eq('id', row.id)
      .eq('status', 'pending');
  } else if (decision.outcome === 'review') {
    await svc
      .from('wallet_transactions')
      .update({ meta: { ...meta, needs_review: true, review_reason: decision.reason } })
      .eq('id', row.id)
      .eq('status', 'pending');
  }

  return NextResponse.json({ result: data ?? decision.outcome });
}

export async function GET() {
  return NextResponse.json({ error: 'METHOD_NOT_ALLOWED' }, { status: 405 });
}
