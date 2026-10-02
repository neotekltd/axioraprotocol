import { describe, it, expect } from 'vitest';
import { formatUSD, formatPct } from '@/lib/finance';

describe('format helpers', () => {
  it('formats USD with sign handling', () => {
    expect(formatUSD(12.5)).toBe('$12.50');
    expect(formatUSD(-3)).toBe('$-3.00');
    expect(formatUSD(5, { sign: true })).toBe('+$5.00');
  });

  it('formats percentages', () => {
    expect(formatPct(1)).toBe('+1.00%');
    expect(formatPct(0.015 * 100)).toBe('+1.50%');
  });

  it('formats compact telemetry headlines without cents', () => {
    expect(formatUSD(0, { decimals: 0 })).toBe('$0');
    expect(formatUSD(7696, { decimals: 0 })).toBe('$7,696');
    expect(formatUSD(1250000, { decimals: 0 })).toBe('$1,250,000');
  });

  it('retains cents on transaction rows', () => {
    expect(formatUSD(50)).toBe('$50.00');
    expect(formatUSD(8.86)).toBe('$8.86');
  });
});
