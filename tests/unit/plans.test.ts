import { describe, expect, it } from 'vitest';
import { quotePlan, planForAmount, getPlan, PLANS } from '@/lib/plans';

describe('plan engine (approved schedule)', () => {
  it('$100 Essential credits $1.00 per 6h', () => {
    const q = quotePlan('essential', 100);
    expect(q.creditPerPayout).toBe(1.0);
    expect(q.payoutsPerDay).toBe(4);
    expect(q.dailyTotal).toBe(4.0);
  });

  it('$1,000 Premium credits $15.00 per 6h', () => {
    const q = quotePlan('premium', 1000);
    expect(q.creditPerPayout).toBe(15.0);
    expect(q.dailyTotal).toBe(60.0);
  });

  it('$2,001 Exclusive credits $40.02 per 6h', () => {
    const q = quotePlan('exclusive', 2001);
    expect(q.creditPerPayout).toBe(40.02);
    expect(q.dailyTotal).toBe(160.08);
  });

  it('rejects below-minimum and unknown plans', () => {
    expect(() => quotePlan('essential', 5)).toThrow();
    expect(() => quotePlan('unknown', 100)).toThrow();
  });

  it('routes amounts to the correct module', () => {
    expect(planForAmount(10)?.key).toBe('essential');
    expect(planForAmount(600)?.key).toBe('essential');
    expect(planForAmount(601)?.key).toBe('premium');
    expect(planForAmount(2000)?.key).toBe('premium');
    expect(planForAmount(2001)?.key).toBe('exclusive');
    expect(planForAmount(50000)?.key).toBe('exclusive');
    expect(planForAmount(50001)).toBeNull();
  });

  it('exposes exactly three fixed modules, 6h cycle', () => {
    expect(PLANS).toHaveLength(3);
    for (const p of PLANS) {
      expect(p.cycleHours).toBe(6);
      expect(p.creditsPerDay).toBe(4);
    }
    expect(getPlan('essential')?.ratePerCredit).toBe(0.01);
    expect(getPlan('premium')?.ratePerCredit).toBe(0.015);
    expect(getPlan('exclusive')?.ratePerCredit).toBe(0.02);
  });
});
