import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import {
  PROVIDER_CURRENCY,
  buildOrderId,
  createDepositPayment,
  getPaymentStatus,
  providerEnabled,
  axioraDepositLabel,
  NpError,
  type NpPayment,
} from '@/lib/nowpayments';
import { SITE_URL } from '@/lib/config';
import { ASSET_IDS } from '@/lib/deposits';

// NOTE: no `export const runtime = 'edge'` — see api/health/route.ts.
// Authenticated deposit intent: validates, stores a PENDING ledger row
// first, then creates the NOWPayments payment and links it. Nothing here
// credits a balance; credit happens only via verified IPN. This route
// never throws: every failure is a JSON response with a safe code, and
// provider diagnostics stay in server logs (never secrets, never the key).

const CreateSchema = z.object({
  assetId: z.enum(ASSET_IDS as unknown as [string, ...string[]]),
  amount: z.number().finite().min(10).max(50000),
});

function callbackUrl(): string {
  return `${SITE_URL.replace(/\/$/, '')}/api/payments/nowpayments/ipn`;
}

// Sanitized server log: HTTP status + provider code/message only.
function logProviderFailure(op: string, e: unknown, orderId: string) {
  if (e instanceof NpError) {
    let code = '';
    try {
      const parsed = JSON.parse(e.body) as { code?: unknown; message?: unknown };
      if (typeof parsed.code === 'string') code = ` code=${parsed.code}`;
      else if (typeof parsed.message === 'string') code = ` message=${parsed.message.slice(0, 120)}`;
    } catch {
      code = ` body=${e.body.slice(0, 120)}`;
    }
    console.error(`[NOWPayments] ${op} failed order=${orderId} status=${e.status}${code}`);
  } else {
    console.error(`[NOWPayments] ${op} failed order=${orderId} transport_error`);
  }
}

export async function POST(req: Request) {
  if (!providerEnabled()) {
    return NextResponse.json({ error: 'PROVIDER_DISABLED', code: 'PROVIDER_DISABLED' }, { status: 503 });
  }
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'UNAUTHENTICATED', code: 'UNAUTHENTICATED' }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'BAD_JSON', code: 'BAD_JSON' }, { status: 400 });
  }
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'VALIDATION_ERROR', code: 'VALIDATION_ERROR' }, { status: 400 });
  const { assetId, amount } = parsed.data;

  const payCurrency = PROVIDER_CURRENCY[assetId];
  if (!payCurrency) return NextResponse.json({ error: 'ASSET_NOT_SUPPORTED', code: 'ASSET_NOT_SUPPORTED' }, { status: 400 });

  let svc: ReturnType<typeof createServiceClient>;
  try {
    svc = createServiceClient();
  } catch {
    console.error('[NOWPayments] deposit intent failed: service database client unavailable');
    return NextResponse.json({ error: 'SERVICE_UNAVAILABLE', code: 'SERVICE_UNAVAILABLE' }, { status: 503 });
  }

  const rounded = Math.round(amount * 100) / 100;

  // Dedupe: reuse a fresh pending intent for the same asset+amount instead
  // of minting duplicate provider payments on double-clicks/retries.
  const since = new Date(Date.now() - 15 * 60 * 1000).toISOString();
  const { data: existing } = await svc
    .from('wallet_transactions')
    .select('id, provider_ref, amount, network, address, meta, created_at')
    .eq('user_id', user.id)
    .eq('type', 'deposit')
    .eq('status', 'pending')
    .eq('provider', 'nowpayments')
    .gte('created_at', since)
    .order('created_at', { ascending: false })
    .limit(20);
  const reuse = (existing ?? []).find(
    (r) => Number(r.amount) === rounded && (r.meta as { asset_id?: string } | null)?.asset_id === assetId
  );
  if (reuse?.provider_ref && !reuse.provider_ref.startsWith('AXD-')) {
    try {
      const fresh = await getPaymentStatus(reuse.provider_ref);
      await svc
        .from('wallet_transactions')
        .update({ meta: { ...((reuse.meta as object) ?? {}), provider_status: fresh.payment_status } })
        .eq('id', reuse.id);
      return NextResponse.json({ payment: toPublic(reuse.provider_ref, fresh), reused: true });
    } catch {
      // Provider unreachable — fall through and create a fresh payment.
    }
  }

  const orderId = buildOrderId();

  // 1) Axiora pending intent first (keyed by order id), so a provider
  // failure can never leave money movement without a local record — and
  // never a credit: only IPN completion moves rows to completed.
  const { data: intent, error: intentError } = await svc
    .from('wallet_transactions')
    .insert({
      user_id: user.id,
      type: 'deposit',
      asset: assetId.startsWith('USDT') ? 'USDT' : assetId,
      amount: rounded.toFixed(2),
      status: 'pending',
      network: assetId,
      address: '',
      provider: 'nowpayments',
      provider_ref: orderId,
      meta: { asset_id: assetId, order_id: orderId, provider_status: 'creating' },
    })
    .select('id')
    .single();
  if (intentError || !intent) {
    console.error(`[NOWPayments] intent store failed order=${orderId} code=${intentError?.code ?? 'unknown'}`);
    return NextResponse.json({ error: 'SERVICE_UNAVAILABLE', code: 'INTENT_STORE_FAILED' }, { status: 500 });
  }

  // 2) Provider payment. Currency codes are the API's own canonical
  // identifiers (verified live via GET /v1/currencies), lowercase as the
  // API returns them — never a bare network-less code.
  let payment: NpPayment;
  try {
    payment = await createDepositPayment({
      priceAmount: rounded,
      priceCurrency: 'USD',
      payCurrency,
      orderId,
      orderDescription: `Axiora deposit ${orderId}`,
      ipnCallbackUrl: callbackUrl(),
    });
  } catch (e) {
    logProviderFailure('create payment', e, orderId);
    await svc
      .from('wallet_transactions')
      .update({ meta: { asset_id: assetId, order_id: orderId, provider_status: 'provider_error' } })
      .eq('id', (intent as { id: string }).id);
    const status = e instanceof NpError && e.status >= 400 && e.status < 500 ? 502 : 502;
    return NextResponse.json(
      { error: 'We could not create your deposit payment right now. Please try again.', code: 'PAYMENT_PROVIDER_ERROR' },
      { status }
    );
  }

  // 3) Link the intent to the provider payment.
  const { error: linkError } = await svc
    .from('wallet_transactions')
    .update({
      address: payment.pay_address,
      provider_ref: String(payment.payment_id),
      meta: {
        asset_id: assetId,
        order_id: orderId,
        provider_status: payment.payment_status,
        pay_currency: payment.pay_currency,
        pay_amount: payment.pay_amount,
      },
    })
    .eq('id', (intent as { id: string }).id);
  if (linkError) {
    console.error(`[NOWPayments] intent link failed order=${orderId} payment=${payment.payment_id}`);
    return NextResponse.json(
      { error: 'We could not create your deposit payment right now. Please try again.', code: 'INTENT_LINK_FAILED' },
      { status: 500 }
    );
  }
  return NextResponse.json({ payment: toPublic(payment.payment_id, payment), reused: false }, { status: 201 });
}

export async function GET(req: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'UNAUTHENTICATED', code: 'UNAUTHENTICATED' }, { status: 401 });

  const paymentId = new URL(req.url).searchParams.get('paymentId');
  if (!paymentId) return NextResponse.json({ error: 'MISSING_PAYMENT_ID', code: 'MISSING_PAYMENT_ID' }, { status: 400 });

  let svc: ReturnType<typeof createServiceClient>;
  try {
    svc = createServiceClient();
  } catch {
    return NextResponse.json({ error: 'SERVICE_UNAVAILABLE', code: 'SERVICE_UNAVAILABLE' }, { status: 503 });
  }
  const { data: row } = await svc
    .from('wallet_transactions')
    .select('id, asset, amount, status, network, address, provider_ref, tx_hash, meta, created_at, completed_at')
    .eq('user_id', user.id)
    .eq('provider', 'nowpayments')
    .eq('provider_ref', paymentId)
    .maybeSingle();
  if (!row) return NextResponse.json({ error: 'NOT_FOUND', code: 'NOT_FOUND' }, { status: 404 });

  // Throttled server-side refresh (≥60s) so reopening a pending payment
  // shows authoritative state without hammering the provider.
  const meta = (row.meta as Record<string, unknown>) ?? {};
  const last = typeof meta.last_provider_check === 'string' ? Date.parse(meta.last_provider_check) : 0;
  if (providerEnabled() && row.status === 'pending' && Date.now() - last > 60000) {
    try {
      const fresh = await getPaymentStatus(paymentId);
      await svc
        .from('wallet_transactions')
        .update({
          meta: { ...meta, provider_status: fresh.payment_status, last_provider_check: new Date().toISOString() },
        })
        .eq('id', row.id);
      meta.provider_status = fresh.payment_status;
    } catch {
      // Provider hiccup: serve the stored record instead of failing.
    }
  }
  const providerStatus = typeof meta.provider_status === 'string' ? meta.provider_status : 'waiting';
  return NextResponse.json({
    payment: {
      paymentId,
      asset: row.asset,
      network: row.network,
      amount: row.amount,
      payAddress: row.address,
      payAmount: meta.pay_amount ?? null,
      payCurrency: meta.pay_currency ?? null,
      status: providerStatus,
      label: axioraDepositLabel(providerStatus),
      ledgerStatus: row.status,
      txHash: row.tx_hash,
      createdAt: row.created_at,
      completedAt: row.completed_at,
    },
  });
}

function toPublic(paymentId: string | number, p: NpPayment) {
  const status = typeof p.payment_status === 'string' ? p.payment_status : 'waiting';
  return {
    paymentId: String(paymentId),
    payAddress: p.pay_address ?? null,
    payAmount: p.pay_amount ?? null,
    payCurrency: p.pay_currency ?? null,
    priceAmount: p.price_amount ?? null,
    priceCurrency: p.price_currency ?? 'USD',
    orderId: p.order_id ?? null,
    status,
    label: axioraDepositLabel(status),
  };
}
