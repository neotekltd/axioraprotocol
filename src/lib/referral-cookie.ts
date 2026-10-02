// First-touch referral transport. The cookie carries ONLY the public
// 8-char referral code (no secrets, no session) so attribution survives
// navigation, refresh, verification and cross-tab browsing. The database
// relationship (attach_referrer) is authoritative — the cookie is never
// trusted without server-side re-validation.

export const REFERRAL_COOKIE = 'axiora_ref';
export const REFERRAL_COOKIE_MAX_AGE = 60 * 60 * 24 * 90; // 90 days

// Same normalization as public.normalize_referral_code(): trim, uppercase,
// strip non-alphanumerics. Codes are server-generated hex, so this is safe.
export function normalizeReferralCode(raw: unknown): string {
  if (typeof raw !== 'string') return '';
  return raw.trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 32);
}

function readRawCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const parts = document.cookie.split(';');
  for (const part of parts) {
    const idx = part.indexOf('=');
    if (idx < 0) continue;
    if (part.slice(0, idx).trim() === name) {
      try {
        return decodeURIComponent(part.slice(idx + 1).trim());
      } catch {
        return null;
      }
    }
  }
  return null;
}

export function readReferralCookie(): string {
  return normalizeReferralCode(readRawCookie(REFERRAL_COOKIE));
}

// First-touch: writes ONLY when no attribution cookie exists yet, so a
// later /r/OTHER visit can never silently overwrite the original referrer.
export function writeReferralCookieIfAbsent(code: string): boolean {
  const clean = normalizeReferralCode(code);
  if (!clean || typeof document === 'undefined') return false;
  if (readReferralCookie() !== '') return false;
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie =
    `${REFERRAL_COOKIE}=${encodeURIComponent(clean)}` +
    `; Path=/; Max-Age=${REFERRAL_COOKIE_MAX_AGE}; SameSite=Lax${secure}`;
  return true;
}
