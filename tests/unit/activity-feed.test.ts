import { describe, expect, it } from 'vitest';
import {
  activityMode, coinIconSrc, demoActivityFeed, demoAgeLabel,
} from '@/lib/activity-shared';

describe('homepage activity feed', () => {
  it('defaults to real mode (demo never leaks without explicit env)', () => {
    expect(activityMode()).toBe('real');
  });

  it('HOME_ACTIVITY_MODE=demo selects demo; =real selects real', () => {
    const prev = process.env.HOME_ACTIVITY_MODE;
    try {
      process.env.HOME_ACTIVITY_MODE = 'demo';
      expect(activityMode()).toBe('demo');
      process.env.HOME_ACTIVITY_MODE = 'real';
      expect(activityMode()).toBe('real');
    } finally {
      if (prev === undefined) delete process.env.HOME_ACTIVITY_MODE;
      else process.env.HOME_ACTIVITY_MODE = prev;
    }
  });

  it('demo feed is deterministic with unique ids and complete rows', () => {
    const a = demoActivityFeed();
    const b = demoActivityFeed();
    expect(a).toEqual(b);
    expect(a.mode).toBe('demo');
    expect(a.incoming).toHaveLength(5);
    expect(a.outgoing).toHaveLength(5);
    const keys = [...a.incoming, ...a.outgoing].map((r) => r.key);
    expect(new Set(keys).size).toBe(keys.length);
    for (const r of [...a.incoming, ...a.outgoing]) {
      expect(r.asset).toMatch(/^[A-Z]{2,6}$/);
      expect(r.middle).toContain('•••');
      expect(r.action.length).toBeGreaterThan(0);
      expect(r.amount).toBeGreaterThan(0);
      expect(r.occurredAt).toBeNull();
    }
  });

  it('demo ages are stable labels without timers', () => {
    expect(demoAgeLabel(18)).toBe('18m');
    expect(demoAgeLabel(60)).toBe('1h');
    expect(demoAgeLabel(180)).toBe('3h');
  });

  it('coin icons resolve to bundled local assets only', () => {
    expect(coinIconSrc('USDT')).toBe('/assets/crypto/usdt.svg');
    expect(coinIconSrc('LTC')).toBe('/assets/crypto/ltc.svg');
    expect(coinIconSrc('DOGE')).toBe('/assets/crypto/doge.svg');
    expect(coinIconSrc('FAKE')).toBeNull();
    for (const src of ['USDT', 'BTC', 'ETH', 'BNB', 'LTC', 'DOGE'].map(coinIconSrc)) {
      expect(src?.startsWith('http')).toBe(false);
    }
  });
});
