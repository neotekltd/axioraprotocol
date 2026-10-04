// NOWPayments provider adapter. SERVER ONLY — never import from client
// components or browser code. All x-api-key traffic originates here.
//
// Contract (api.nowpayments.io, v1 — verified against live docs 2026):
//   POST /v1/payment {price_amount, price_currency, pay_currency,
//     order_id, order_description, ipn_callback_url}
//   GET  /v1/payment/{payment_id}
//   POST /v1/payout {ipn_callback_url, withdrawals: [{address, currency,
//     amount, ipn_callback_url}]}
//   GET  /v1/payout/{payout_id}
// Payout verification (2FA) happens in the NOWPayments dashboard by the
// operator; Axiora polls payout status and records the real TXID.
//
// Balance/crediting rule (documented in code, applied in the IPN route):
// credit the ledger ONLY when provider status reaches `finished`.
// `confirmed` is recorded and shown, never credited. `partially_paid`,
// over/under-payment and wrong-asset cases go to manual review.

import { runtimeEnv } from '@/lib/runtime-env';

const PROD_BASE = 'https://api.nowpayments.io';

export function providerBaseUrl(): string {
  // Sandbox override lives in NOWPAYMENTS_API_BASE; unset means production.
  const override = runtimeEnv('NOWPAYMENTS_API_BASE');
  return (override && override.trim()) || PROD_BASE;
}

function apiKey(): string {
  const key = runtimeEnv('NOWPAYMENTS_API_KEY');
  if (!key) throw new Error('Missing NOWPAYMENTS_API_KEY.');
  return key;
}

export function ipnSecret(): string {
  const secret = runtimeEnv('NOWPAYMENTS_IPN_SECRET');
  if (!secret) throw new Error('Missing NOWPAYMENTS_IPN_SECRET.');
  return secret;
}

export function providerEnabled(): boolean {
  return !!runtimeEnv('NOWPAYMENTS_API_KEY');
}

// Axiora asset id -> exact NOWPayments pay_currency (verified live via
// GET /v1/currencies). Keep this map as the ONLY place provider codes live.
export const PROVIDER_CURRENCY: Record<string, string> = {
  BTC: 'btc',
  BNB: 'bnbbsc',
  DOGE: 'doge',
  LTC: 'ltc',
  ETH: 'eth',
  TRX: 'trx',
  USDT_TRC20: 'usdttrc20',
  USDT_BEP20: 'usdtbsc',
  USDT_ERC20: 'usdterc20',
};

// Axiora deposit asset symbol credited for a provider currency. The ledger
// is USDT-based: stablecoin outcomes credit 1:1; volatile outcomes are
// credited at their fiat price_amount value (see creditDecision).
export function ledgerSymbolFor(payCurrency: string): string {
  const c = payCurrency.toLowerCase();
  if (c.startsWith('usdt')) return 'USDT';
  if (c === 'btc') return 'BTC';
  if (c === 'bnbbsc') return 'BNB';
  if (c === 'doge') return 'DOGE';
  if (c === 'ltc') return 'LTC';
  if (c === 'eth') return 'ETH';
  if (c === 'trx') return 'TRX';
  return 'USDT';
}

export interface NpPayment {
  payment_id: string;
  payment_status: string;
  pay_address: string;
  price_amount: number;
  price_currency: string;
  pay_amount: number;
  pay_currency: string;
  order_id: string;
  order_description?: string;
  ipn_callback_url?: string;
  created_at?: string;
  updated_at?: string;
  purchase_id?: string;
  amount_received?: number;
  payin_extra_id?: string | null;
  smart_contract?: string;
  network?: string;
  network_precision?: number;
  time_limit?: number;
  burning_percent?: number | null;
  expiration_estimate_date?: string;
  is_fixed_rate?: boolean;
  is_fee_paid_by_user?: boolean;
  valid_until?: string;
  type?: string;
}

export interface NpPayoutWithdrawal {
  id?: string;
  address: string;
  currency: string;
  amount: number;
  status?: string;
  hash?: string | null;
  error?: string;
}

export interface NpPayout {
  id: string;
  status?: string;
  withdrawals?: NpPayoutWithdrawal[];
}

export class NpError extends Error {
  status: number;
  body: string;
  endpoint: string;
  constructor(status: number, body: string, endpoint = '') {
    super(`NOWPayments request failed (HTTP ${status})`);
    this.status = status;
    this.body = body;
    this.endpoint = endpoint;
  }
}

// Sanitized provider-body summary for server logs ONLY (never the key,
// never secrets). Returns a short `code=…` / `message=…` fragment.
export function sanitizeProviderBody(body: string): string {
  try {
    const parsed = JSON.parse(body) as { code?: unknown; message?: unknown; msg?: unknown };
    if (typeof parsed.code === 'string') return `code=${parsed.code.slice(0, 80)}`;
    const msg =
      typeof parsed.message === 'string'
        ? parsed.message
        : typeof parsed.msg === 'string'
          ? parsed.msg
          : null;
    if (msg) return `message=${msg.slice(0, 120)}`;
  } catch {
    // Not JSON — fall through to raw truncation.
  }
  const flat = body.replace(/\s+/g, ' ').trim();
  return flat ? `body=${flat.slice(0, 120)}` : 'empty_body';
}

// Maps a provider failure to an Axiora HTTP response. Deposit creation
// uses x-api-key ONLY — payout JWT auth must never leak into this path.
export function mapProviderError(e: unknown): { httpStatus: number; code: string; message: string } {
  if (e instanceof NpError) {
    if (e.status === 401 || e.status === 403) {
      return {
        httpStatus: 503,
        code: 'PROVIDER_AUTH_FAILED',
        message: 'Automatic deposits are temporarily unavailable.',
      };
    }
    if (e.status === 400 || e.status === 422) {
      return {
        httpStatus: 422,
        code: 'PROVIDER_REJECTED',
        message: 'This network is temporarily unavailable.',
      };
    }
    if (e.status === 429 || e.status >= 500) {
      return {
        httpStatus: 503,
        code: 'PROVIDER_UNAVAILABLE',
        message: 'Automatic deposits are temporarily unavailable. Please try again shortly.',
      };
    }
    if (e.status >= 400 && e.status < 500) {
      return {
        httpStatus: 422,
        code: 'PROVIDER_REJECTED',
        message: 'This network is temporarily unavailable.',
      };
    }
    return {
      httpStatus: 503,
      code: 'PROVIDER_UNAVAILABLE',
      message: 'Automatic deposits are temporarily unavailable. Please try again shortly.',
    };
  }
  return {
    httpStatus: 503,
    code: 'PROVIDER_UNAVAILABLE',
    message: 'Automatic deposits are temporarily unavailable. Please try again shortly.',
  };
}

async function npFetch<T>(path: string, init?: { method?: string; body?: unknown }): Promise<T> {
  // Deposit auth = x-api-key header ONLY. Payout JWT (Authorization Bearer)
  // is a separate payout-only flow and must never be sent here.
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 20000);
  try {
    const res = await fetch(`${providerBaseUrl()}${path}`, {
      method: init?.method ?? 'GET',
      headers: {
        'x-api-key': apiKey(),
        'Content-Type': 'application/json',
      },
      body: init?.body === undefined ? undefined : JSON.stringify(init.body),
      signal: ctrl.signal,
    });
    const text = await res.text();
    if (!res.ok) throw new NpError(res.status, text.slice(0, 500), path);
    return JSON.parse(text) as T;
  } finally {
    clearTimeout(timer);
  }
}

// --- Server-side diagnostics (never expose the key) --------------------------
// Safe auth preflight: GET /v1/currencies isolates an API-key/config
// problem from a payment-payload problem. Call before POST /v1/payment
// when diagnosing, and STOP on auth failure.
export async function listProviderCurrencies(): Promise<string[]> {
  const data = await npFetch<{ currencies?: unknown } | string[]>('/v1/currencies');
  if (Array.isArray(data)) return data.filter((c): c is string => typeof c === 'string');
  if (data && typeof data === 'object' && Array.isArray((data as { currencies?: unknown }).currencies)) {
    return ((data as { currencies: unknown[] }).currencies).filter((c): c is string => typeof c === 'string');
  }
  return [];
}

export async function listFullCurrencies(): Promise<unknown> {
  return npFetch<unknown>('/v1/full-currencies');
}

export async function listMerchantCoins(): Promise<unknown> {
  return npFetch<unknown>('/v1/merchant/coins');
}

export interface ProviderDiagnosis {
  ok: boolean;
  stage: 'currencies';
  httpStatus: number;
  detail: string;
  count: number;
}

// Runs GET /v1/currencies with the configured key and returns a sanitized
// summary (status + safe message + count). Never includes secrets.
export async function diagnoseProvider(): Promise<ProviderDiagnosis> {
  try {
    const currencies = await listProviderCurrencies();
    return { ok: true, stage: 'currencies', httpStatus: 200, detail: 'authenticated', count: currencies.length };
  } catch (e) {
    if (e instanceof NpError) {
      return { ok: false, stage: 'currencies', httpStatus: e.status, detail: sanitizeProviderBody(e.body), count: 0 };
    }
    return { ok: false, stage: 'currencies', httpStatus: 0, detail: 'transport_error', count: 0 };
  }
}

export interface CreateDepositInput {
  priceAmount: number;
  priceCurrency: string;
  payCurrency: string;
  orderId: string;
  orderDescription: string;
  ipnCallbackUrl: string;
}

export function createDepositPayment(input: CreateDepositInput): Promise<NpPayment> {
  return npFetch<NpPayment>('/v1/payment', {
    method: 'POST',
    body: {
      price_amount: input.priceAmount,
      // NOWPayments canonical codes are lowercase (usd, btc, usdttrc20…).
      price_currency: input.priceCurrency.toLowerCase(),
      pay_currency: input.payCurrency.toLowerCase(),
      order_id: input.orderId,
      order_description: input.orderDescription,
      ipn_callback_url: input.ipnCallbackUrl,
    },
  });
}

export function getPaymentStatus(paymentId: string): Promise<NpPayment> {
  return npFetch<NpPayment>(`/v1/payment/${encodeURIComponent(paymentId)}`);
}

export interface CreatePayoutInput {
  address: string;
  currency: string;
  amount: number;
  ipnCallbackUrl: string;
}

export function createPayout(input: CreatePayoutInput): Promise<NpPayout> {
  return npFetch<NpPayout>('/v1/payout', {
    method: 'POST',
    body: {
      ipn_callback_url: input.ipnCallbackUrl,
      withdrawals: [
        {
          address: input.address,
          currency: input.currency,
          amount: input.amount,
          ipn_callback_url: input.ipnCallbackUrl,
        },
      ],
    },
  });
}

export function getPayoutStatus(payoutId: string): Promise<NpPayout> {
  return npFetch<NpPayout>(`/v1/payout/${encodeURIComponent(payoutId)}`);
}

// --- IPN authentication ----------------------------------------------------
// NOWPayments signs callbacks in `x-nowpayments-sig`: HMAC-SHA512 hex over
// JSON.stringify(payload) with the payload's keys sorted alphabetically,
// keyed with the IPN secret. Constant-time comparison, WebCrypto only
// (Cloudflare Workers compatible).
export function sortPayload(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortPayload);
  if (value !== null && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const k of Object.keys(value as Record<string, unknown>).sort()) {
      out[k] = sortPayload((value as Record<string, unknown>)[k]);
    }
    return out;
  }
  return value;
}

export async function signIpn(payload: unknown, secret: string): Promise<string> {
  const data = new TextEncoder().encode(JSON.stringify(sortPayload(payload)));
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-512' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, data);
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function verifyIpnSignature(rawBody: string, signature: string | null): Promise<boolean> {
  if (!signature) return false;
  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return false;
  }
  const expected = await signIpn(payload, ipnSecret());
  return constantTimeEqual(expected, signature.trim().toLowerCase());
}

// --- Business rules ---------------------------------------------------------
export type ProviderEvent =
  | 'waiting'
  | 'confirming'
  | 'confirmed'
  | 'sending'
  | 'partially_paid'
  | 'finished'
  | 'failed'
  | 'refunded'
  | 'expired';

export const CREDITABLE_STATUSES: ReadonlySet<string> = new Set(['finished']);

export function axioraDepositLabel(status: string): string {
  switch (status) {
    case 'waiting':
      return 'Awaiting payment';
    case 'confirming':
      return 'Confirming on blockchain';
    case 'confirmed':
      return 'Payment confirmed';
    case 'sending':
      return 'Processing settlement';
    case 'finished':
      return 'Completed';
    case 'partially_paid':
      return 'Partially paid — needs review';
    case 'failed':
      return 'Failed';
    case 'refunded':
      return 'Refunded';
    case 'expired':
      return 'Expired';
    default:
      return 'Processing';
  }
}

export interface CreditDecision {
  outcome: 'credit' | 'record' | 'review' | 'terminal';
  creditAmount: number;
  reason: string;
}

// Decides what an IPN means for the Axiora ledger. Only `finished`
// payments credit, and only when the received value reconciles with the
// expectation (5% tolerance, stablecoin 1:1). Everything else is recorded
// for visibility or flagged for manual review — never silently invented.
export function creditDecision(opts: {
  providerStatus: string;
  expected: number;
  actuallyPaidCrypto: number | null;
  outcomeAmount: number | null;
  outcomeCurrency: string | null;
}): CreditDecision {
  const { providerStatus, expected } = opts;
  if (providerStatus === 'finished') {
    const received = opts.outcomeAmount ?? opts.actuallyPaidCrypto ?? expected;
    const currency = (opts.outcomeCurrency ?? '').toLowerCase();
    const stable = currency === '' || currency.startsWith('usdt') || currency === 'usd';
    if (!stable) {
      return { outcome: 'review', creditAmount: 0, reason: `Outcome currency ${opts.outcomeCurrency} needs review` };
    }
    if (expected > 0 && Math.abs(received - expected) / expected > 0.05) {
      return { outcome: 'review', creditAmount: 0, reason: `Paid ${received} vs expected ${expected}` };
    }
    return { outcome: 'credit', creditAmount: Math.round(received * 100) / 100, reason: 'finished' };
  }
  if (providerStatus === 'partially_paid') {
    return { outcome: 'review', creditAmount: 0, reason: 'Partial payment — manual review' };
  }
  if (providerStatus === 'failed' || providerStatus === 'refunded' || providerStatus === 'expired') {
    return { outcome: 'terminal', creditAmount: 0, reason: providerStatus };
  }
  return { outcome: 'record', creditAmount: 0, reason: providerStatus };
}

// Withdrawal destination (asset + network label) -> provider payout code.
export function payoutCurrencyFor(asset: string, network: string): string | null {
  const a = asset.toUpperCase();
  const n = network.toUpperCase();
  if (a === 'USDT' && n.includes('TRC')) return 'usdttrc20';
  if (a === 'USDT' && n.includes('BEP')) return 'usdtbsc';
  if (a === 'USDT' && n.includes('ERC')) return 'usdterc20';
  if (a === 'BTC') return 'btc';
  if (a === 'BNB') return 'bnbbsc';
  if (a === 'DOGE') return 'doge';
  if (a === 'LTC') return 'ltc';
  if (a === 'ETH') return 'eth';
  if (a === 'TRX') return 'trx';
  return null;
}

// Unique Axiora order reference per provider payment. Never a user email,
// never a blockchain TXID.
export function buildOrderId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  const alphabet = 'ABCDEFGHJKMNPQRSTUVWXYZ234567891';
  const suffix = Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('');
  return `AXD-${suffix}`;
}
