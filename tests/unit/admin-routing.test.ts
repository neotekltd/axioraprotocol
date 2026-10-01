import { describe, expect, it } from 'vitest';
import { isSoleAdminEmail, resolveDestination, SOLE_ADMIN_EMAIL } from '@/lib/admin-email';

describe('single-admin routing', () => {
  it('pins exactly one administrator identity', () => {
    expect(SOLE_ADMIN_EMAIL).toBe('jaidanem6@gmail.com');
    expect(isSoleAdminEmail('jaidanem6@gmail.com')).toBe(true);
    expect(isSoleAdminEmail('  JAIDANEM6@GMAIL.COM ')).toBe(true);
    expect(isSoleAdminEmail('admin@axioraprotocol.com')).toBe(false);
    expect(isSoleAdminEmail('')).toBe(false);
    expect(isSoleAdminEmail(null)).toBe(false);
    expect(isSoleAdminEmail(undefined)).toBe(false);
  });

  it('routes admin to /admin regardless of next', () => {
    expect(resolveDestination(true, null)).toBe('/admin');
    expect(resolveDestination(true, '/app/deposit')).toBe('/admin');
    expect(resolveDestination(true, '/admin')).toBe('/admin');
  });

  it('routes normal users to next or dashboard, never /admin', () => {
    expect(resolveDestination(false, null)).toBe('/app/dashboard');
    expect(resolveDestination(false, '/app/deposit')).toBe('/app/deposit');
    expect(resolveDestination(false, '/admin')).toBe('/app/dashboard');
    expect(resolveDestination(false, 'https://evil.example')).toBe('/app/dashboard');
    expect(resolveDestination(false, '')).toBe('/app/dashboard');
  });
});
