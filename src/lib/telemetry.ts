// Unified protocol telemetry (server-only).
// Single data interface for the homepage telemetry section with two explicit
// modes:
//
// * production (default): figures from the REAL Supabase ledger/database.
//   Nothing is ever invented; empty ledgers render as honest zeros.
// * demo: in-memory illustrative constants for pre-launch/staging previews,
//   clearly labeled DEMO DATA in the UI. Demo values NEVER touch the
//   financial ledger (no wallet/deposit/withdrawal/payout rows are written).
//
// Demo is active ONLY when the server env AXIORA_TELEMETRY_MODE=demo.
// Production can never show demo values unless explicitly configured.

import { createClient } from '@/lib/supabase/server';
import { DEMO_TELEMETRY, telemetryMode } from '@/lib/telemetry-shared';
import type { ProtocolTelemetry } from '@/lib/telemetry-shared';

export type { ProtocolTelemetry, TelemetryMode } from '@/lib/telemetry-shared';

const tnum = (v: unknown): number => {
  const n = typeof v === 'string' ? Number(v) : typeof v === 'number' ? v : 0;
  return Number.isFinite(n) ? n : 0;
};

const numArray = (v: unknown): number[] => {
  if (!Array.isArray(v)) return [];
  return v.map(tnum).slice(0, 30);
};

async function productionTelemetry(): Promise<Omit<ProtocolTelemetry, 'mode'> | null> {
  try {
    const supabase = createClient();
    const [{ data: agg, error: aggErr }, { data: series, error: seriesErr }] = await Promise.all([
      supabase.rpc('homepage_telemetry'),
      supabase.rpc('homepage_series'),
    ]);
    if (aggErr || !agg) return null;
    const a = agg as Record<string, unknown>;
    const s = (series ?? {}) as Record<string, unknown>;
    if (seriesErr) {
      // Aggregates available but series missing (migration not applied yet):
      // honest empty series rather than invented shapes.
      return {
        deposited: tnum(a.depositedToDate),
        withdrawn: tnum(a.withdrawnByMembers),
        accounts: Math.max(0, Math.floor(tnum(a.accounts))),
        payouts: Math.max(0, Math.floor(tnum(a.payoutsMade))),
        daysOperating: Math.max(0, Math.floor(tnum(a.daysInOperation))),
        depositedSeries: [], withdrawnSeries: [], accountsSeries: [], payoutsSeries: [],
        launchDate: null,
      };
    }
    return {
      deposited: tnum(a.depositedToDate),
      withdrawn: tnum(a.withdrawnByMembers),
      accounts: Math.max(0, Math.floor(tnum(a.accounts))),
      payouts: Math.max(0, Math.floor(tnum(a.payoutsMade))),
      daysOperating: Math.max(0, Math.floor(tnum(a.daysInOperation))),
      depositedSeries: numArray(s.depositedSeries),
      withdrawnSeries: numArray(s.withdrawnSeries),
      accountsSeries: numArray(s.accountsSeries),
      payoutsSeries: numArray(s.payoutsSeries),
      launchDate: typeof s.launchDate === 'string' ? s.launchDate : null,
    };
  } catch {
    return null;
  }
}

export async function getProtocolTelemetry(): Promise<ProtocolTelemetry | null> {
  if (telemetryMode() === 'demo') return { ...DEMO_TELEMETRY, mode: 'demo' };
  const prod = await productionTelemetry();
  if (!prod) return null;
  return { ...prod, mode: 'production' };
}
