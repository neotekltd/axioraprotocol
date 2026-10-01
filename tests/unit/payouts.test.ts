import { describe, expect, it } from 'vitest';
import { quotePlan } from '@/lib/plans';
import { formatCountdown } from '@/components/ax/active-plan';

describe('payout engine contract', () => {
  it('$300 Essential credits $3.00 per 6h (reported user case)', () => {
    const q = quotePlan('essential', 300);
    expect(q.creditPerPayout).toBe(3.0);
    expect(q.dailyTotal).toBe(12.0);
  });

  it('one payout per six-hour period: 4 credits per day, non-compounding', () => {
    const q = quotePlan('premium', 1000);
    expect(q.payoutsPerDay).toBe(4);
    // Simple (non-compounding): daily total is exactly 4x one credit.
    expect(q.dailyTotal).toBe(q.creditPerPayout * 4);
  });

  it('formats countdown as HH:MM:SS', () => {
    expect(formatCountdown(6 * 3600 * 1000)).toBe('06:00:00');
    expect(formatCountdown((5 * 3600 + 43 * 60 + 12) * 1000)).toBe('05:43:12');
    expect(formatCountdown(9 * 60 * 1000 + 59 * 1000)).toBe('00:09:59');
  });

  it('clamps overdue countdowns at zero (never negative)', () => {
    expect(formatCountdown(-5000)).toBe('00:00:00');
    expect(formatCountdown(0)).toBe('00:00:00');
  });
});
