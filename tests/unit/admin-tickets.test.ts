import { describe, expect, it } from 'vitest';
import {
  depositNeedsReview,
  isAutomaticDeposit,
  providerStatusOf,
  ticketUnread,
} from '@/lib/admin';

// Pure operational rules: rail split, exception routing, unread detection.
// No network, no database.

describe('deposit rail split', () => {
  it('classifies nowpayments rows as automatic, everything else as manual', () => {
    expect(isAutomaticDeposit('nowpayments')).toBe(true);
    expect(isAutomaticDeposit(null)).toBe(false);
    expect(isAutomaticDeposit('')).toBe(false);
    expect(isAutomaticDeposit('manual')).toBe(false);
  });

  it('reads provider status from ledger meta only', () => {
    expect(providerStatusOf({ provider_status: 'finished' })).toBe('finished');
    expect(providerStatusOf({})).toBe(null);
    expect(providerStatusOf({ provider_status: 42 })).toBe(null);
  });

  it('flags exceptions for review, never normal in-flight rows', () => {
    expect(depositNeedsReview({}, 'waiting')).toBe(false);
    expect(depositNeedsReview({}, 'confirming')).toBe(false);
    expect(depositNeedsReview({}, 'confirmed')).toBe(false);
    expect(depositNeedsReview({}, 'finished')).toBe(false);
    expect(depositNeedsReview({}, null)).toBe(false);
    expect(depositNeedsReview({ needs_review: true }, 'waiting')).toBe(true);
    for (const s of ['partially_paid', 'failed', 'expired', 'refunded']) {
      expect(depositNeedsReview({}, s)).toBe(true);
    }
  });
});

describe('ticket unread', () => {
  const T0 = '2026-10-01T10:00:00.000Z';
  const T1 = '2026-10-01T10:05:00.000Z';
  const T2 = '2026-10-01T10:10:00.000Z';

  it('marks brand-new tickets unread (opener is user activity)', () => {
    expect(ticketUnread(T0, [])).toBe(true);
  });

  it('clears when the latest activity is an admin reply', () => {
    expect(
      ticketUnread(T0, [{ sender: 'user', internal: false, createdAt: T1 }, { sender: 'admin', internal: false, createdAt: T2 }])
    ).toBe(false);
  });

  it('flags when the user wrote after the last admin reply', () => {
    expect(
      ticketUnread(T0, [{ sender: 'admin', internal: false, createdAt: T1 }, { sender: 'user', internal: false, createdAt: T2 }])
    ).toBe(true);
  });

  it('ignores internal notes for unread state', () => {
    expect(ticketUnread(T0, [{ sender: 'admin', internal: true, createdAt: T2 }])).toBe(true);
  });
});
