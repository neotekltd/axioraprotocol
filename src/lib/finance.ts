// Finance helpers. Plan economics live in lib/plans.ts (single source of
// truth); this module re-exports formatting helpers for existing importers.

export { formatUSD, formatPct } from './plans';
export type { PlanDef, PlanKey, PlanQuote } from './plans';
