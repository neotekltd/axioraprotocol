// Client-safe telemetry helpers (no server imports — safe for 'use client'
// bundles). Server data fetching lives in src/lib/telemetry.ts.

export type TelemetryMode = 'production' | 'demo';

export interface ProtocolTelemetry {
  deposited: number;
  withdrawn: number;
  accounts: number;
  payouts: number;
  daysOperating: number;
  depositedSeries: number[];
  withdrawnSeries: number[];
  accountsSeries: number[];
  payoutsSeries: number[];
  launchDate: string | null;
  mode: TelemetryMode;
}

// Homepage reference snapshot: displayed (not ledger) figures for the
// current presentation. `deposited` is the requested reference value; the
// rest are coherent illustrative companions. NEVER presented as real ledger
// totals — the UI always badges this mode DEMO DATA, and no value here is
// ever written to the financial ledger.
const REFERENCE_SNAPSHOT: Omit<ProtocolTelemetry, 'mode'> = {
  deposited: 7696,
  withdrawn: 2410,
  accounts: 132,
  payouts: 418,
  daysOperating: 42,
  depositedSeries: demoSeries(11, 3),
  withdrawnSeries: demoSeries(29, 2),
  accountsSeries: demoSeries(47, 1),
  payoutsSeries: demoSeries(63, 4),
  launchDate: null,
};

// Legacy alias kept for continuity; TELEMETRY_SOURCE is the canonical switch.
export const DEMO_TELEMETRY: Omit<ProtocolTelemetry, 'mode'> = REFERENCE_SNAPSHOT;

// Deterministic pseudo-series: seeded integer walk, stable across renders.
export function demoSeries(seed: number, stride: number): number[] {
  const out: number[] = [];
  let v = 20 + (seed % 13);
  for (let i = 0; i < 30; i++) {
    v += ((seed * (i + stride)) % 17) - 8;
    v = Math.max(4, Math.min(96, v));
    out.push(v);
  }
  return out;
}

export function telemetryMode(): TelemetryMode {
  // Canonical switch: TELEMETRY_SOURCE=reference shows the labeled homepage
  // reference snapshot; =axiora (or unset) reads the real ledger.
  // AXIORA_TELEMETRY_MODE=demo is a legacy alias for reference mode.
  if (process.env.TELEMETRY_SOURCE === 'reference') return 'demo';
  if (process.env.TELEMETRY_SOURCE === 'axiora') return 'production';
  return process.env.AXIORA_TELEMETRY_MODE === 'demo' ? 'demo' : 'production';
}

// Short launch label from the real operational start, e.g. "24 Sept".
// Null when unknown — the UI then omits the date instead of inventing one.
export function launchLabel(launchDate: string | null): string | null {
  if (!launchDate) return null;
  const d = new Date(launchDate);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });
}
