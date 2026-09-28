// Auth failure classification + safe logging.
//
// The UI shows friendly messages, but the real underlying error must always
// reach development logs with: status, error name/code, safe message, and
// request context. NEVER log passwords, tokens, or keys.

export type AuthFailureKind =
  | 'CONFIG' // Missing/invalid environment (e.g. NEXT_PUBLIC_SUPABASE_URL)
  | 'NETWORK' // fetch failed / Supabase unreachable
  | 'AUTH'; // Supabase rejected the request (bad creds, rate limit, ...)

function safeMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  try {
    return String(err);
  } catch {
    return 'unknown error';
  }
}

function safeStatus(err: unknown): number | undefined {
  if (typeof err === 'object' && err !== null && 'status' in err) {
    const s = (err as { status?: unknown }).status;
    if (typeof s === 'number') return s;
  }
  return undefined;
}

function safeCode(err: unknown): string | undefined {
  if (typeof err === 'object' && err !== null && 'code' in err) {
    const c = (err as { code?: unknown }).code;
    if (typeof c === 'string') return c;
  }
  if (err instanceof Error) return err.name;
  return undefined;
}

export function classifyAuthError(err: unknown): AuthFailureKind {
  const m = safeMessage(err).toLowerCase();
  if (m.startsWith('missing ') && m.includes('next_public')) return 'CONFIG';
  if (
    m.includes('network') ||
    m.includes('fetch') ||
    m.includes('load failed') ||
    m.includes('failed to fetch')
  )
    return 'NETWORK';
  return 'AUTH';
}

// Logs the real error (dev diagnostics) and returns its kind so callers can
// show the right friendly message. `scope` is e.g. 'signup' | 'login'.
export function logAuthError(scope: string, err: unknown): AuthFailureKind {
  const kind = classifyAuthError(err);
  console.error(`[auth:${scope}]`, {
    kind,
    status: safeStatus(err),
    code: safeCode(err),
    message: safeMessage(err),
  });
  return kind;
}
