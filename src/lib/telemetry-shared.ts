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

// Deterministic illustrative values for UI previews. Stable across renders
// (no Math.random anywhere); clearly fake-scale, never presented as real.
export const DEMO_TELEMETRY: Omit<ProtocolTelemetry, 'mode'> = {
  deposited: 184720,
  withdrawn: 91340,
  accounts: 1284,
  payouts: 3764,
  daysOperating: 42,
  depositedSeries: demoSeries(11, 3),
  withdrawnSeries: demoSeries(29, 2),
  accountsSeries: demoSeries(47, 1),
  payoutsSeries: demoSeries(63, 4),
  launchDate: null,
};

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
