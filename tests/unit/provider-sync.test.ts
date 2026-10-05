import { describe, expect, it } from 'vitest';
import { isSyncableRef, shouldReconcile } from '@/lib/provider-sync';
import { creditDecision } from '@/lib/nowpayments';

// Provider-authoritative sync rules. Pure logic only — no network, no DB.
// Financial safety: only `finished` credits; terminals never credit;
// transport failures must retain state (handled by callers via error).

describe('syncable refs', () => {
  it('syncs only numeric provider payment ids', () => {
    expect(isSyncableRef('12345678')).toBe(true);
    expect(isSyncableRef(null)).toBe(false);
    expect(isSyncableRef('')).toBe(false);
    // Local intents whose provider payment was never created are skipped.
    expect(isSyncableRef('AXD-ABC123')).toBe(false);
    expect(isSyncableRef('creating')).toBe(false);
  });
});

describe('reconcile throttle', () => {
  it('reconciles rows never checked or checked long ago', () => {
    const now = Date.now();
    expect(shouldReconcile({}, 300000, now)).toBe(true);
    expect(shouldReconcile({ last_provider_check: 'not-a-date' }, 300000, now)).toBe(true);
    expect(
      shouldReconcile({ last_provider_check: new Date(now - 10 * 60 * 1000).toISOString() }, 300000, now)
    ).toBe(true);
  });

  it('skips rows checked recently', () => {
    const now = Date.now();
    expect(
      shouldReconcile({ last_provider_check: new Date(now - 60 * 1000).toISOString() }, 300000, now)
    ).toBe(false);
  });
});

describe('provider state mapping', () => {
  it('credits only finished stablecoin payments within tolerance', () => {
    const d = creditDecision({
      providerStatus: 'finished',
      expected: 100,
      actuallyPaidCrypto: null,
      outcomeAmount: 100,
      outcomeCurrency: 'usdtbsc',
    });
    expect(d.outcome).toBe('credit');
    expect(d.creditAmount).toBe(100);
  });

  it('never credits waiting / confirming / confirmed / sending', () => {
    for (const s of ['waiting', 'confirming', 'confirmed', 'sending']) {
      const d = creditDecision({
        providerStatus: s,
        expected: 100,
        actuallyPaidCrypto: null,
        outcomeAmount: null,
        outcomeCurrency: null,
      });
      expect(d.outcome).toBe('record');
      expect(d.creditAmount).toBe(0);
    }
  });

  it('routes terminal states to terminal (never credit)', () => {
    for (const s of ['failed', 'refunded', 'expired']) {
      const d = creditDecision({
        providerStatus: s,
        expected: 100,
        actuallyPaidCrypto: null,
        outcomeAmount: null,
        outcomeCurrency: null,
      });
      expect(d.outcome).toBe('terminal');
      expect(d.creditAmount).toBe(0);
    }
  });

  it('routes partial and volatile-finished payments to review', () => {
    const partial = creditDecision({
      providerStatus: 'partially_paid',
      expected: 100,
      actuallyPaidCrypto: 40,
      outcomeAmount: null,
      outcomeCurrency: 'usdtbsc',
    });
    expect(partial.outcome).toBe('review');
    const volatile = creditDecision({
      providerStatus: 'finished',
      expected: 100,
      actuallyPaidCrypto: null,
      outcomeAmount: 0.05,
      outcomeCurrency: 'btc',
    });
    expect(volatile.outcome).toBe('review');
  });
});
