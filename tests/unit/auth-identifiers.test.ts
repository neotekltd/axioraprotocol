import { describe, expect, it } from 'vitest';
import { isEmailLike, isResolvableUsername, normalizeAuthEmail, normalizeUsername } from '@/lib/auth-identifiers';

describe('login identifiers', () => {
  it('detects email-like input', () => {
    expect(isEmailLike('jaidanem6@example.com')).toBe(true);
    expect(isEmailLike('  JAIDANEM6@Example.COM ')).toBe(true);
    expect(isEmailLike('jaidanem6')).toBe(false);
    expect(isEmailLike('jaidanem6@')).toBe(false);
    expect(isEmailLike('')).toBe(false);
  });

  it('normalizes email for sign-in', () => {
    expect(normalizeAuthEmail('  JAIDANEM6@Example.COM ')).toBe('jaidanem6@example.com');
  });

  it('normalizes usernames for lookup', () => {
    expect(normalizeUsername('  JAIDANEM6 ')).toBe('jaidanem6');
    expect(normalizeUsername('User_Name99')).toBe('user_name99');
  });

  it('gates resolver shape without existence signals', () => {
    expect(isResolvableUsername('jaidanem6')).toBe(true);
    expect(isResolvableUsername('JAIDANEM6')).toBe(true);
    expect(isResolvableUsername('ab')).toBe(false);
    expect(isResolvableUsername('has space')).toBe(false);
    expect(isResolvableUsername('user@example.com')).toBe(false);
    expect(isResolvableUsername('')).toBe(false);
  });
});
