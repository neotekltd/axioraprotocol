// Canonical signup-verification resend helper (client-safe, no secrets).
// Single implementation used by signup recovery, login-unverified routing,
// and the verification page — never duplicated per screen.
import { logAuthError } from '@/lib/auth-errors';
import { normalizeAuthEmail } from '@/lib/auth-identifiers';
import type { Dictionary } from '@/lib/i18n-dict';

export type ResendResult =
  | { ok: true }
  | { ok: false; code: 'RATE_LIMIT' | 'FAILED' | 'CONFIG' };

interface ResendCapable {
  auth: {
    resend(args: {
      type: 'signup';
      email: string;
      options?: { emailRedirectTo?: string };
    }): Promise<{ error: { message: string; status?: number } | null }>;
  };
}

function classify(message: string, status?: number): ResendResult {
  const m = message.toLowerCase();
  if (status === 429 || m.includes('rate limit') || m.includes('too many') || m.includes('over_email')) {
    return { ok: false, code: 'RATE_LIMIT' };
  }
  return { ok: false, code: 'FAILED' };
}

export async function resendSignupVerification(
  supabase: ResendCapable,
  rawEmail: string,
  redirectTo?: string
): Promise<ResendResult> {
  const email = normalizeAuthEmail(rawEmail);
  if (!email || !email.includes('@')) return { ok: false, code: 'FAILED' };
  try {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      ...(redirectTo ? { options: { emailRedirectTo: redirectTo } } : {}),
    });
    if (!error) return { ok: true };
    const kind = logAuthError('verify:resend', error);
    if (kind === 'CONFIG') return { ok: false, code: 'CONFIG' };
    return classify(
      error.message,
      (error as { status?: number }).status
    );
  } catch (err) {
    const kind = logAuthError('verify:resend:exception', err);
    if (kind === 'CONFIG') return { ok: false, code: 'CONFIG' };
    return { ok: false, code: 'FAILED' };
  }
}

export function resendUserMessage(code: 'RATE_LIMIT' | 'FAILED' | 'CONFIG', t?: Dictionary['auth']): string {
  if (t) {
    if (code === 'RATE_LIMIT') return t.rateLimit;
    if (code === 'CONFIG') return t.configError;
    return t.resendEmailFailed;
  }
  if (code === 'RATE_LIMIT') return 'Too many attempts. Wait a moment and try again.';
  if (code === 'CONFIG') return 'Authentication is misconfigured. Please try again later.';
  return 'Could not send the verification email right now. Wait a moment and try again.';
}
