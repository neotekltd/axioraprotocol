import { describe, expect, it } from 'vitest';
import { quotePlan, planForAmount, getPlan, PLANS, simulatePlanTerm, simulationSeries } from '@/lib/plans';

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

describe('term simulation (simulator reference states)', () => {
  it('Premium $601 → $853.42 total, +$252.42 earnings', () => {
    const s = simulatePlanTerm('premium', 601);
    expect(s.payoutCount).toBe(28);
    expect(s.termDays).toBe(7);
    expect(s.totalProfit).toBe(252.42);
    expect(s.principal).toBe(601);
    expect(s.totalReturn).toBe(853.42);
    expect(s.dailyPct).toBe(6);
  });

  it('Exclusive $2001 → $4,242.12 total, +$2,241.12 earnings', () => {
    const s = simulatePlanTerm('exclusive', 2001);
    expect(s.payoutCount).toBe(56);
    expect(s.termDays).toBe(14);
    expect(s.totalProfit).toBe(2241.12);
    expect(s.principal).toBe(2001);
    expect(s.totalReturn).toBe(4242.12);
    expect(s.dailyPct).toBe(8);
  });

  it('Essential $100 → $112 total, +$12 earnings, 12 payouts / 3 days', () => {
    const s = simulatePlanTerm('essential', 100);
    expect(s.payoutCount).toBe(12);
    expect(s.termDays).toBe(3);
    expect(s.totalProfit).toBe(12);
    expect(s.totalReturn).toBe(112);
    expect(s.dailyPct).toBe(4);
  });

  it('rejects out-of-band amounts and unknown plans', () => {
    expect(() => simulatePlanTerm('premium', 600)).toThrow();
    expect(() => simulatePlanTerm('premium', 2001)).toThrow();
    expect(() => simulatePlanTerm('exclusive', 2000)).toThrow();
    expect(() => simulatePlanTerm('essential', 601)).toThrow();
    expect(() => simulatePlanTerm('unknown', 100)).toThrow();
    expect(() => simulatePlanTerm('premium', NaN)).toThrow();
  });

  it('series starts at principal, ends exactly at total', () => {
    for (const [key, amount] of [['essential', 600], ['premium', 601], ['exclusive', 50000]] as const) {
      const s = simulatePlanTerm(key, amount);
      const series = simulationSeries(s);
      expect(series).toHaveLength(s.payoutCount + 1);
      expect(series[0]).toBe(s.principal);
      expect(series[series.length - 1]).toBe(s.totalReturn);
    }
  });
});
