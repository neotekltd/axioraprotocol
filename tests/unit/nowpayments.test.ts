import { describe, expect, it } from 'vitest';
import {
  PROVIDER_CURRENCY,
  NpError,
  axioraDepositLabel,
  buildOrderId,
  creditDecision,
  ledgerSymbolFor,
  mapProviderError,
  sanitizeProviderBody,
  signIpn,
  sortPayload,
} from '@/lib/nowpayments';
import { ASSET_IDS } from '@/lib/deposits';

// No network in this file: pure business rules + WebCrypto signature math.

describe('provider currency map', () => {
  it('covers every Axiora deposit asset with verified codes', () => {
    for (const id of ASSET_IDS) {
      expect(PROVIDER_CURRENCY[id], id).toMatch(/^[a-z0-9]+$/);
    }
    expect(PROVIDER_CURRENCY).toMatchObject({
      BTC: 'btc',
      BNB: 'bnbbsc',
      DOGE: 'doge',
      LTC: 'ltc',
      ETH: 'eth',
      TRX: 'trx',
      USDT_TRC20: 'usdttrc20',
      USDT_BEP20: 'usdtbsc',
      USDT_ERC20: 'usdterc20',
    });
  });

  it('maps outcomes to ledger symbols without inventing assets', () => {
    expect(ledgerSymbolFor('usdttrc20')).toBe('USDT');
    expect(ledgerSymbolFor('btc')).toBe('BTC');
    expect(ledgerSymbolFor('bnbbsc')).toBe('BNB');
    expect(ledgerSymbolFor('something-new')).toBe('USDT');
  });
});

describe('IPN signature', () => {
  it('sorts nested keys before signing', () => {
    expect(sortPayload({ b: 1, a: { d: 1, c: 2 } })).toEqual({ a: { c: 2, d: 1 }, b: 1 });
  });

  it('matches the NOWPayments HMAC-SHA512 vector', async () => {
    const payload = { payment_status: 'finished', price_amount: 100, payment_id: 1234567890, order_id: 'AXD-ABC123' };
    const sig = await signIpn(payload, 'testsecret');
    expect(sig).toBe(
      '3825ed674e4340424449c03a37768f31495f442137ae6c3a068c6bdb96db0df5dd262d6f030d5420410ef6d45fb811d466e47ed7ed4547b84ff8981e860333e9'
    );
  });
});

describe('credit decision', () => {
  it('credits only finished payments that reconcile', () => {
    expect(
      creditDecision({ providerStatus: 'finished', expected: 100, actuallyPaidCrypto: null, outcomeAmount: 100, outcomeCurrency: 'usdt' })
    ).toMatchObject({ outcome: 'credit', creditAmount: 100 });
  });

  it('never credits waiting / confirming / confirmed / sending', () => {
    for (const s of ['waiting', 'confirming', 'confirmed', 'sending']) {
      const d = creditDecision({ providerStatus: s, expected: 100, actuallyPaidCrypto: null, outcomeAmount: null, outcomeCurrency: null });
      expect(d.outcome).toBe('record');
      expect(d.creditAmount).toBe(0);
    }
  });

  it('flags partial, deviating and foreign-currency outcomes for review', () => {
    expect(
      creditDecision({ providerStatus: 'partially_paid', expected: 100, actuallyPaidCrypto: 40, outcomeAmount: null, outcomeCurrency: null }).outcome
    ).toBe('review');
    expect(
      creditDecision({ providerStatus: 'finished', expected: 100, actuallyPaidCrypto: null, outcomeAmount: 50, outcomeCurrency: 'usdt' }).outcome
    ).toBe('review');
    expect(
      creditDecision({ providerStatus: 'finished', expected: 100, actuallyPaidCrypto: null, outcomeAmount: 0.002, outcomeCurrency: 'btc' }).outcome
    ).toBe('review');
  });

  it('closes failed / refunded / expired as terminal with zero credit', () => {
    for (const s of ['failed', 'refunded', 'expired']) {
      const d = creditDecision({ providerStatus: s, expected: 100, actuallyPaidCrypto: null, outcomeAmount: null, outcomeCurrency: null });
      expect(d.outcome).toBe('terminal');
      expect(d.creditAmount).toBe(0);
    }
  });
});

describe('provider error mapping (never mask upstream)', () => {
  it('maps auth failures to 503 without leaking the body', () => {
    for (const status of [401, 403]) {
      const mapped = mapProviderError(new NpError(status, '{"message":"Invalid API key"}', '/v1/payment'));
      expect(mapped.httpStatus).toBe(503);
      expect(mapped.code).toBe('PROVIDER_AUTH_FAILED');
    }
  });

  it('maps payload rejections to 422', () => {
    for (const status of [400, 422, 404]) {
      const mapped = mapProviderError(new NpError(status, '{"message":"Invalid pay_currency"}', '/v1/payment'));
      expect(mapped.httpStatus).toBe(422);
      expect(mapped.code).toBe('PROVIDER_REJECTED');
    }
  });

  it('maps rate-limit/outage/transport to 503', () => {
    for (const e of [new NpError(429, 'rate limit', '/v1/payment'), new NpError(500, 'oops', '/v1/payment'), new Error('down')]) {
      const mapped = mapProviderError(e);
      expect(mapped.httpStatus).toBe(503);
    }
  });

  it('sanitizes provider bodies without secrets', () => {
    expect(sanitizeProviderBody('{"code":"INVALID","message":"bad currency"}')).toContain('code=INVALID');
    expect(sanitizeProviderBody('not json at all')).toContain('body=not json');
  });
});

describe('labels and order ids', () => {
  it('maps every documented provider status to a plain Axiora label', () => {
    expect(axioraDepositLabel('waiting')).toBe('Awaiting payment');
    expect(axioraDepositLabel('finished')).toBe('Completed');
    expect(axioraDepositLabel('expired')).toBe('Expired');
    expect(axioraDepositLabel('weird_future_state')).toBe('Processing');
  });

  it('builds unique AXD order references (never emails, never TXIDs)', () => {
    const ids = new Set(Array.from({ length: 200 }, buildOrderId));
    expect(ids.size).toBe(200);
    ids.forEach((id) => {
      expect(id).toMatch(/^AXD-[A-Z1-9]{6}$/);
      expect(id).not.toContain('@');
      expect(id).not.toMatch(/^0x/);
    });
  });
});
