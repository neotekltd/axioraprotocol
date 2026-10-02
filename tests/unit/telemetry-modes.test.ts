import { describe, expect, it } from 'vitest';
import { AIMEX_TELEMETRY, DEMO_TELEMETRY, demoSeries, launchLabel, telemetryMode } from '@/lib/telemetry-shared';
import { seriesPath, seriesPoints } from '@/components/landing/telemetry';

describe('telemetry modes', () => {
  it('defaults to production (demo never leaks without explicit env)', () => {
    expect(telemetryMode()).toBe('production');
  });

  it('aimex snapshot carries the operator-supplied source figures', () => {
    expect(AIMEX_TELEMETRY.deposited).toBe(2839);
    expect(AIMEX_TELEMETRY.withdrawn).toBe(627);
    expect(AIMEX_TELEMETRY.accounts).toBe(190);
    expect(AIMEX_TELEMETRY.payouts).toBe(425);
    expect(AIMEX_TELEMETRY.daysOperating).toBe(5);
  });

  it('reference snapshot carries the requested $7,696 deposited figure', () => {
    expect(DEMO_TELEMETRY.deposited).toBe(7696);
    expect(DEMO_TELEMETRY.withdrawn).toBeLessThan(DEMO_TELEMETRY.deposited);
    expect(DEMO_TELEMETRY.accounts).toBeGreaterThan(0);
    expect(DEMO_TELEMETRY.payouts).toBeGreaterThan(0);
  });

  it('HOMEPAGE_DATA_SOURCE selects the provider (aimex/axiora/reference)', () => {
    const prev = process.env.HOMEPAGE_DATA_SOURCE;
    const prevLegacy = process.env.TELEMETRY_SOURCE;
    try {
      delete process.env.TELEMETRY_SOURCE;
      process.env.HOMEPAGE_DATA_SOURCE = 'aimex';
      expect(telemetryMode()).toBe('aimex');
      process.env.HOMEPAGE_DATA_SOURCE = 'axiora';
      expect(telemetryMode()).toBe('production');
      process.env.HOMEPAGE_DATA_SOURCE = 'reference';
      expect(telemetryMode()).toBe('demo');
    } finally {
      if (prev === undefined) delete process.env.HOMEPAGE_DATA_SOURCE;
      else process.env.HOMEPAGE_DATA_SOURCE = prev;
      if (prevLegacy === undefined) delete process.env.TELEMETRY_SOURCE;
      else process.env.TELEMETRY_SOURCE = prevLegacy;
    }
  });

  it('demo series are deterministic across renders (no Math.random)', () => {
    expect(demoSeries(11, 3)).toEqual(demoSeries(11, 3));
    expect(demoSeries(11, 3)).toHaveLength(30);
    expect(demoSeries(11, 3)).not.toEqual(demoSeries(29, 2));
  });

  it('launch label uses the real date, null when unknown', () => {
    expect(launchLabel(null)).toBeNull();
    expect(launchLabel('not-a-date')).toBeNull();
    expect(launchLabel('2026-09-24T12:00:00+00:00')).toBe('24 Sept');
  });
});

describe('series charts', () => {
  it('empty/all-zero series render an honest flat baseline', () => {
    for (const s of [[], [0, 0, 0], [0]]) {
      const ys = seriesPoints(s).map(([, y]) => y);
      expect(ys.length).toBeGreaterThanOrEqual(2);
      expect(new Set(ys).size).toBe(1);
    }
  });

  it('non-zero series scale to the viewBox maximum', () => {
    const pts = seriesPoints([0, 50, 100]);
    const ys = pts.map(([, y]) => y);
    expect(Math.min(...ys)).toBeLessThan(Math.max(...ys));
    // Peak maps to the top padding line.
    expect(Math.min(...ys)).toBeCloseTo(4, 0);
  });

  it('path is a valid SVG polyline', () => {
    const d = seriesPath([10, 20, 15]);
    expect(d.startsWith('M')).toBe(true);
    expect((d.match(/L/g) ?? []).length).toBe(2);
  });
});
