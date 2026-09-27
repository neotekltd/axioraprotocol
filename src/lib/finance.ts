import { PROTOCOL_CONFIG } from './config';

export interface CalculatorInput {
  amount: number;
  termDays: number;
}

export interface CalculatorResult {
  amount: number;
  termDays: number;
  dailyRate: number;
  dailyYield: number;
  monthlyEstimate: number;
  grossProfit: number;
  protocolFee: number;
  netProfit: number;
  totalValue: number;
  effectiveReturnPct: number;
}

// Pure function — mirrored server-side in /api/calculator for deployment confirmation.
export function calculateDeployment({ amount, termDays }: CalculatorInput): CalculatorResult {
  const cfg = PROTOCOL_CONFIG;
  const clampedAmount = Math.min(Math.max(amount || 0, 0), cfg.maxDeployment);
  const clampedTerm = Math.min(Math.max(Math.round(termDays || 0), cfg.minTermDays), cfg.maxTermDays);
  const dailyRate = cfg.baseDailyRate + clampedTerm * cfg.termBonusPerDay;
  const dailyYield = clampedAmount * dailyRate;
  const grossProfit = dailyYield * clampedTerm;
  const protocolFee = grossProfit * cfg.performanceFeeRate;
  const netProfit = grossProfit - protocolFee;
  const totalValue = clampedAmount + netProfit;
  const monthlyEstimate = dailyYield * 30 * (1 - cfg.performanceFeeRate);
  const effectiveReturnPct = clampedAmount > 0 ? (netProfit / clampedAmount) * 100 : 0;

  const r2 = (n: number) => Math.round(n * 100) / 100;
  return {
    amount: r2(clampedAmount),
    termDays: clampedTerm,
    dailyRate,
    dailyYield: r2(dailyYield),
    monthlyEstimate: r2(monthlyEstimate),
    grossProfit: r2(grossProfit),
    protocolFee: r2(protocolFee),
    netProfit: r2(netProfit),
    totalValue: r2(totalValue),
    effectiveReturnPct: r2(effectiveReturnPct),
  };
}

export function formatUSD(n: number, opts?: { sign?: boolean; decimals?: number }) {
  const d = opts?.decimals ?? 2;
  const v = n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
  if (opts?.sign) return `${n < 0 ? '−' : '+'}$${v.replace('-', '')}`;
  return `$${v}`;
}

export function formatPct(n: number, decimals = 2) {
  return `${n >= 0 ? '+' : ''}${n.toFixed(decimals)}%`;
}
