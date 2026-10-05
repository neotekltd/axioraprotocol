import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';
import { verifyIpnSignature } from '@/lib/nowpayments';
import { applyProviderState, fetchRowByPaymentRef } from '@/lib/provider-sync';

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
  const row = await fetchRowByPaymentRef(svc, paymentId);

  // Unknown payment: acknowledge without action (stops provider retries;
  // operator can reconcile from the provider dashboard).
  if (!row) {
    console.warn(`[ipn] unknown payment ${paymentId} status=${providerStatus}`);
    return NextResponse.json({ result: 'ignored_unknown_payment' });
  }

  const meta = row.meta ?? {};
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

  // Note: deposit callbacks carry no user-facing blockchain hash
  // (purchase_id is an internal provider reference, not a TXID), so the
  // ledger tx_hash stays empty — provider state is authoritative here.
  // Shared with the reconciliation fallback: identical outcomes for the
  // same provider state, idempotent on retries.
  const applied = await applyProviderState(svc, row, {
    status: providerStatus,
    payAddress: str(payload.pay_address),
    payCurrency: null,
    actuallyPaidCrypto: num(payload.actually_paid),
    outcomeAmount: num(payload.outcome_amount),
    outcomeCurrency: str(payload.outcome_currency),
    orderId: orderId ?? storedOrder,
  });
  if (applied.result === 'error') {
    console.error(`[ipn] apply failed payment=${paymentId} reason=${applied.error ?? 'unknown'}`);
    return NextResponse.json({ error: 'APPLY_FAILED' }, { status: 500 });
  }
  if (applied.result === 'credited') {
    console.info(`[ipn] credited payment=${paymentId}`);
  }
  return NextResponse.json({ result: applied.result });
}

export async function GET() {
  return NextResponse.json({ error: 'METHOD_NOT_ALLOWED' }, { status: 405 });
}
