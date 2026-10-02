import { describe, expect, it } from 'vitest';
import { normalizeReferralCode } from '@/lib/referral-cookie';
import { BANNERS, bannerEmbed } from '@/lib/banners';

describe('referral code normalization (mirrors normalize_referral_code)', () => {
  it('uppercases, trims and strips non-alphanumerics', () => {
    expect(normalizeReferralCode('  jaidanem6 ')).toBe('JAIDANEM6');
    expect(normalizeReferralCode('ab-12_cd')).toBe('AB12CD');
    expect(normalizeReferralCode('/r/XYZ789/')).toBe('RXYZ789');
  });

  it('rejects non-strings and empties', () => {
    expect(normalizeReferralCode(null)).toBe('');
    expect(normalizeReferralCode(undefined)).toBe('');
    expect(normalizeReferralCode('')).toBe('');
    expect(normalizeReferralCode('---')).toBe('');
  });
});

describe('banner embeds (Axiora-native, user-scoped)', () => {
  it('points at the Axiora referral URL and Axiora assets, never AIMEX', () => {
    for (const b of BANNERS) {
      const code = bannerEmbed(b, 'https://axioraprotocol.com/r/ABC12345');
      expect(code).toContain('https://axioraprotocol.com/r/ABC12345');
      expect(code).toContain(`width="${b.width}"`);
      expect(code).toContain('alt="Axiora Protocol"');
      expect(code).toContain('rel="noopener noreferrer"');
      expect(code.toLowerCase()).not.toContain('aimex');
    }
  });

  it('strips attribute-breaking characters from the referral URL', () => {
    const code = bannerEmbed(BANNERS[0], 'https://axioraprotocol.com/r/AB"C<D>');
    expect(code).not.toContain('"C');
    expect(code).toContain('/r/ABC');
  });
});
