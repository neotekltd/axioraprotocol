import { describe, expect, it } from 'vitest';
import { ageLabel } from '@/components/landing/live-activity-utils';

const NOW = Date.UTC(2026, 9, 1, 12, 0, 0);

describe('activity age labels', () => {
  it('formats minutes, hours, days', () => {
    expect(ageLabel(new Date(NOW - 21 * 60000).toISOString(), NOW)).toBe('21m');
    expect(ageLabel(new Date(NOW - 2 * 3600000).toISOString(), NOW)).toBe('2h');
    expect(ageLabel(new Date(NOW - 3 * 86400000).toISOString(), NOW)).toBe('3d');
    expect(ageLabel(new Date(NOW - 10000).toISOString(), NOW)).toBe('now');
  });

  it('never invents a timestamp for bad input', () => {
    expect(ageLabel('', NOW)).toBe('—');
    expect(ageLabel('not-a-date', NOW)).toBe('—');
  });

  it('clamps future times to now', () => {
    expect(ageLabel(new Date(NOW + 60000).toISOString(), NOW)).toBe('now');
  });
});
