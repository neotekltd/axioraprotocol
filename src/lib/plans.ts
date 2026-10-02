// Axiora plan engine — SINGLE SOURCE OF TRUTH for plan economics.
// Three fixed modules crediting a flat rate per 6-hour period (4 credits
// per 24h), simple (non-compounding): credit = capital × ratePerCredit.
// Every surface (cards, calculators, quotes, ledger) derives from here.

export interface PlanDef {
  key: 'essential' | 'premium' | 'exclusive';
  code: string;
  name: string;
  ratePerCredit: number;
  min: number;
  max: number;
  cycleHours: 6;
  creditsPerDay: 4;
  exampleAmount: number;
}

export const PLANS: PlanDef[] = [
  { key: 'essential', code: 'MOD-01', name: 'Essential', ratePerCredit: 0.01, min: 10, max: 600, cycleHours: 6, creditsPerDay: 4, exampleAmount: 100 },
  { key: 'premium', code: 'MOD-02', name: 'Premium', ratePerCredit: 0.015, min: 601, max: 2000, cycleHours: 6, creditsPerDay: 4, exampleAmount: 1000 },
  { key: 'exclusive', code: 'MOD-03', name: 'Exclusive', ratePerCredit: 0.02, min: 2001, max: 50000, cycleHours: 6, creditsPerDay: 4, exampleAmount: 2001 },
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

export function formatUSD(n: number, opts?: { sign?: boolean; decimals?: number }) {
  const d = opts?.decimals ?? 2;
  const v = n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
  if (opts?.sign) return `${n < 0 ? '−' : '+'}$${v.replace('-', '')}`;
  return `$${v}`;
}
