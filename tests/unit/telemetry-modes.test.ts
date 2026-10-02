import { describe, expect, it } from 'vitest';
import { DEMO_TELEMETRY, demoSeries, launchLabel, telemetryMode } from '@/lib/telemetry-shared';
import { seriesPath, seriesPoints } from '@/components/landing/telemetry';

describe('telemetry modes', () => {
  it('defaults to production (demo never leaks without explicit env)', () => {
    expect(telemetryMode()).toBe('production');
  });

  it('reference snapshot carries the requested $7,696 deposited figure', () => {
    expect(DEMO_TELEMETRY.deposited).toBe(7696);
    expect(DEMO_TELEMETRY.withdrawn).toBeLessThan(DEMO_TELEMETRY.deposited);
    expect(DEMO_TELEMETRY.accounts).toBeGreaterThan(0);
    expect(DEMO_TELEMETRY.payouts).toBeGreaterThan(0);
  });

  it('TELEMETRY_SOURCE=reference selects demo mode; =axiora selects production', () => {
    const prev = process.env.TELEMETRY_SOURCE;
    try {
      process.env.TELEMETRY_SOURCE = 'reference';
      expect(telemetryMode()).toBe('demo');
      process.env.TELEMETRY_SOURCE = 'axiora';
      expect(telemetryMode()).toBe('production');
    } finally {
      if (prev === undefined) delete process.env.TELEMETRY_SOURCE;
      else process.env.TELEMETRY_SOURCE = prev;
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
