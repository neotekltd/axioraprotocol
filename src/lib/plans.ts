// Axiora plan engine — SINGLE SOURCE OF TRUTH for plan economics.
// Three fixed modules crediting a flat rate per 6-hour period (4 credits
// per 24h), simple (non-compounding): credit = capital × ratePerCredit.
// Each module runs a fixed term (12/28/56 payouts over 3/7/14 days);
// principal returns at completion. Every surface (cards, calculators,
// quotes, ledger) derives from here.

export interface PlanDef {
  key: 'essential' | 'premium' | 'exclusive';
  code: string;
  name: string;
  ratePerCredit: number;
  min: number;
  max: number;
  cycleHours: 6;
  creditsPerDay: 4;
  payoutsPerTerm: number;
  termDays: number;
  exampleAmount: number;
}

export const PLANS: PlanDef[] = [
  { key: 'essential', code: 'MOD-01', name: 'Essential', ratePerCredit: 0.01, min: 10, max: 600, cycleHours: 6, creditsPerDay: 4, payoutsPerTerm: 12, termDays: 3, exampleAmount: 100 },
  { key: 'premium', code: 'MOD-02', name: 'Premium', ratePerCredit: 0.015, min: 601, max: 2000, cycleHours: 6, creditsPerDay: 4, payoutsPerTerm: 28, termDays: 7, exampleAmount: 1000 },
  { key: 'exclusive', code: 'MOD-03', name: 'Exclusive', ratePerCredit: 0.02, min: 2001, max: 50000, cycleHours: 6, creditsPerDay: 4, payoutsPerTerm: 56, termDays: 14, exampleAmount: 2001 },
];

// Representative preview amount for a plan, always inside its valid range.
// UI previews must use this — never one global sample for all plans.
export function examplePlanAmount(plan: PlanDef): number {
  return Math.max(plan.min, Math.min(plan.max, plan.exampleAmount ?? plan.min));
}

export type PlanKey = PlanDef['key'];

export function getPlan(key: string): PlanDef | null {
  return PLANS.find((p) => p.key === key) ?? null;
}

export function planForAmount(amount: number): PlanDef | null {
  return PLANS.find((p) => amount >= p.min && amount <= p.max) ?? null;
}

// Display label for a deployment: plan name for plan-based rows, legacy
// "<n>d" term for pre-plan rows, em-dash when neither exists. Pure — safe
// for client components (queries.ts re-exports it).
export function deploymentLabel(d: { plan?: string | null; termDays?: number }): string {
  if (d.plan) {
    const found = PLANS.find((p) => p.key === d.plan);
    if (found) return found.name;
  }
  if (d.termDays && d.termDays > 0) return `${d.termDays}d`;
  return '—';
}

export interface PlanQuote {
  plan: PlanKey;
  planName: string;
  amount: number;
  ratePerCredit: number;
  creditPerPayout: number;
  payoutsPerDay: number;
  dailyTotal: number;
  principal: number;
  totalWithPrincipal: number;
}

const r2 = (n: number) => Math.round(n * 100) / 100;

// Term-safe rounding: a tiny epsilon absorbs binary floating-point residue
// (e.g. 601 × 0.015) so published reference totals round exactly.
const r2e = (n: number) => Math.round((n + 1e-9) * 100) / 100;

// Server-authoritative quote. Pure function — mirrored nowhere else.
export function quotePlan(planKey: string, amount: number): PlanQuote {
  const plan = getPlan(planKey);
  if (!plan) throw new Error(`Unknown plan: ${planKey}`);
  const clamped = Math.min(Math.max(amount || 0, 0), plan.max);
  if (clamped < plan.min) throw new Error(`Amount below ${plan.name} minimum of $${plan.min}`);
  const creditPerPayout = r2(clamped * plan.ratePerCredit);
  const dailyTotal = r2(creditPerPayout * plan.creditsPerDay);
  return {
    plan: plan.key,
    planName: plan.name,
    amount: r2(clamped),
    ratePerCredit: plan.ratePerCredit,
    creditPerPayout,
    payoutsPerDay: plan.creditsPerDay,
    dailyTotal,
    principal: r2(clamped),
    totalWithPrincipal: r2(clamped + dailyTotal),
  };
}

export function formatPct(n: number, decimals = 2) {
  return `${n >= 0 ? '+' : ''}${n.toFixed(decimals)}%`;
}

// Canonical full-term simulation: profit = P × r × n (simple, no
// compounding), total = P + profit, principal returned at completion.
// Throws below minimum / above maximum — callers render invalid states.
// Reference checks: premium 601 → 853.42 / +252.42; exclusive 2001 →
// 4242.12 / +2241.12.
export interface PlanSimulation {
  plan: PlanKey;
  planName: string;
  amount: number;
  ratePerCredit: number;
  payoutAmount: number;
  payoutCount: number;
  intervalHours: number;
  termDays: number;
  dailyPct: number;
  totalProfit: number;
  principal: number;
  totalReturn: number;
}

export function simulatePlanTerm(planKey: string, amount: number): PlanSimulation {
  const plan = getPlan(planKey);
  if (!plan) throw new Error(`Unknown plan: ${planKey}`);
  if (!Number.isFinite(amount)) throw new Error('Amount must be a number');
  const principal = r2e(amount);
  if (principal < plan.min) throw new Error(`Amount below ${plan.name} minimum of $${plan.min}`);
  if (principal > plan.max) throw new Error(`Amount above ${plan.name} maximum of $${plan.max}`);
  const perPayoutExact = principal * plan.ratePerCredit;
  const totalProfit = r2e(perPayoutExact * plan.payoutsPerTerm);
  return {
    plan: plan.key,
    planName: plan.name,
    amount: principal,
    ratePerCredit: plan.ratePerCredit,
    payoutAmount: r2e(perPayoutExact),
    payoutCount: plan.payoutsPerTerm,
    intervalHours: plan.cycleHours,
    termDays: plan.termDays,
    dailyPct: plan.ratePerCredit * plan.creditsPerDay * 100,
    totalProfit,
    principal,
    totalReturn: r2e(principal + totalProfit),
  };
}

// Cumulative term series for charts: principal, then principal + k payouts
// for k = 1..n. Final point equals totalReturn by construction.
export function simulationSeries(sim: PlanSimulation): number[] {
  const perPayoutExact = sim.principal * sim.ratePerCredit;
  const pts: number[] = [sim.principal];
  for (let k = 1; k <= sim.payoutCount; k++) pts.push(r2e(sim.principal + perPayoutExact * k));
  return pts;
}

export function formatUSD(n: number, opts?: { sign?: boolean; decimals?: number }) {
  const d = opts?.decimals ?? 2;
  const v = n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
  if (opts?.sign) return `${n < 0 ? '−' : '+'}$${v.replace('-', '')}`;
  return `$${v}`;
}
