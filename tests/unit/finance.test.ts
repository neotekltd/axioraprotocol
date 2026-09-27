import { describe, it, expect } from 'vitest';
import { calculateDeployment } from '@/lib/finance';

describe('calculateDeployment', () => {
  it('computes net profit below gross by the protocol fee', () => {
    const r = calculateDeployment({ amount: 1000, termDays: 20 });
    expect(r.grossProfit).toBeGreaterThan(0);
    expect(r.protocolFee).toBeGreaterThan(0);
    expect(r.netProfit).toBeCloseTo(r.grossProfit - r.protocolFee, 2);
    expect(r.totalValue).toBeCloseTo(1000 + r.netProfit, 2);
  });

  it('clamps amount and term to configured bounds', () => {
    const r = calculateDeployment({ amount: 99999999, termDays: 5 });
    expect(r.amount).toBeLessThanOrEqual(100000);
    expect(r.termDays).toBeGreaterThanOrEqual(20);
  });

  it('rewards longer terms with a rate at least as high', () => {
    const short = calculateDeployment({ amount: 1000, termDays: 20 });
    const long = calculateDeployment({ amount: 1000, termDays: 90 });
    expect(long.dailyRate).toBeGreaterThanOrEqual(short.dailyRate);
  });
});
