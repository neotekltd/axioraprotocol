import { describe, expect, it } from 'vitest';
import { DEMO_TELEMETRY, demoSeries, launchLabel, telemetryMode } from '@/lib/telemetry-shared';
import { seriesPath, seriesPoints } from '@/components/landing/telemetry';

describe('telemetry modes', () => {
  it('defaults to production (demo never leaks without explicit env)', () => {
    expect(telemetryMode()).toBe('production');
  });

  it('demo constants are internally consistent illustrative values', () => {
    expect(DEMO_TELEMETRY.deposited).toBe(184720);
    expect(DEMO_TELEMETRY.withdrawn).toBe(91340);
    expect(DEMO_TELEMETRY.accounts).toBe(1284);
    expect(DEMO_TELEMETRY.payouts).toBe(3764);
    expect(DEMO_TELEMETRY.daysOperating).toBe(42);
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
