import { describe, expect, it } from 'vitest';
import {
  activityMode, aimexActivityFeed, coinIconSrc, demoActivityFeed, demoAgeLabel,
} from '@/lib/activity-shared';

describe('homepage activity feed', () => {
  it('defaults to real mode (demo never leaks without explicit env)', () => {
    expect(activityMode()).toBe('real');
  });

  it('HOMEPAGE_DATA_SOURCE=aimex selects aimex; =axiora selects real', () => {
    const prev = process.env.HOMEPAGE_DATA_SOURCE;
    const prevLegacy = process.env.HOME_ACTIVITY_MODE;
    try {
      delete process.env.HOME_ACTIVITY_MODE;
      process.env.HOMEPAGE_DATA_SOURCE = 'aimex';
      expect(activityMode()).toBe('aimex');
      process.env.HOMEPAGE_DATA_SOURCE = 'axiora';
      expect(activityMode()).toBe('real');
    } finally {
      if (prev === undefined) delete process.env.HOMEPAGE_DATA_SOURCE;
      else process.env.HOMEPAGE_DATA_SOURCE = prev;
      if (prevLegacy === undefined) delete process.env.HOME_ACTIVITY_MODE;
      else process.env.HOME_ACTIVITY_MODE = prevLegacy;
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

  it('aimex feed carries the operator-supplied source rows, deterministic', () => {
    const a = aimexActivityFeed();
    expect(a).toEqual(aimexActivityFeed());
    expect(a.mode).toBe('aimex');
    expect(a.incoming).toHaveLength(5);
    expect(a.outgoing).toHaveLength(5);
    expect(a.incoming[0]).toMatchObject({ asset: 'USDT', amount: 50, age: '21m' });
    expect(a.outgoing[0]).toMatchObject({ asset: 'USDT', amount: 8.86, age: '1h' });
    const keys = [...a.incoming, ...a.outgoing].map((r) => r.key);
    expect(new Set(keys).size).toBe(keys.length);
    for (const r of [...a.incoming, ...a.outgoing]) {
      expect(r.middle).toContain('•••');
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
