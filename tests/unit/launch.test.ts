import { describe, expect, it } from 'vitest';
import { formatElapsed, formatLaunchUtc, launchTimestampMs } from '@/lib/launch';

describe('formatElapsed', () => {
  const T0 = Date.parse('2026-10-04T09:29:17Z');
  it.each([
    [0, '00:00:00'],
    [1, '00:00:01'],
    [9, '00:00:09'],
    [59, '00:00:59'],
    [60, '00:01:00'],
    [3599, '00:59:59'],
    [3600, '01:00:00'],
    [86399, '23:59:59'],
    [86400, '24:00:00'],
    [90061, '25:01:01'],
    [360000, '100:00:00'],
  ])('%i sec -> %s', (secs, expected) => {
    expect(formatElapsed(T0, T0 + secs * 1000)).toBe(expected);
  });

  it('clamps pre-launch time to zero, never negative/NaN', () => {
    expect(formatElapsed(T0, T0 - 60000)).toBe('00:00:00');
    expect(formatElapsed(NaN, Date.now())).toBe('00:00:00');
  });
});

describe('launchTimestampMs', () => {
  it('parses the configured UTC timestamp', () => {
    expect(launchTimestampMs()).toBe(Date.parse('2026-10-04T09:29:17Z'));
  });

  it('formats the public UTC stamp', () => {
    expect(formatLaunchUtc(Date.parse('2026-10-04T09:29:17Z'))).toBe('2026-10-04 09:29:17 UTC');
  });
});
