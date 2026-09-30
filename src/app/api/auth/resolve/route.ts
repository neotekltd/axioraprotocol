import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isEmailLike, normalizeUsername } from '@/lib/auth-identifiers';

// NOTE: no `export const runtime = 'edge'` — see api/health/route.ts.
// Minimal login identifier resolver: username -> account email. Supabase
// password sign-in requires the email, so the client resolves first, then
// authenticates normally. The password is NEVER sent here.
//
// Anti-enumeration: always 200 with { email: string | null }; unknown,
// malformed, ambiguous, or throttled identifiers all look identical.
// Best-effort per-IP throttle (Workers isolates make this approximate;
// Supabase's own sign-in rate limits remain the real brute-force guard).
const WINDOW_MS = 60_000;
const LIMIT = 30;
const hits = new Map<string, number[]>();

function throttled(ip: string): boolean {
  const now = Date.now();
  const arr = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  arr.push(now);
  hits.set(ip, arr);
  if (hits.size > 2000) {
    const oldest = hits.keys().next();
    if (!oldest.done) hits.delete(oldest.value);
  }
  return arr.length > LIMIT;
}

export async function POST(req: Request) {
  const ip =
    req.headers.get('cf-connecting-ip') ??
    (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() ??
    'unknown';
  let identifier = '';
  try {
    const body = (await req.json()) as { identifier?: unknown };
    if (typeof body.identifier === 'string') identifier = body.identifier;
  } catch {
    return NextResponse.json({ email: null });
  }
  const username = normalizeUsername(identifier);
  // Shape gate + throttle both collapse to the same null response.
  if (!username || isEmailLike(identifier) || username.length > 64) {
    return NextResponse.json({ email: null });
  }
  if (throttled(ip || 'unknown')) {
    return NextResponse.json({ email: null });
  }
  try {
    const supabase = createClient();
    const { data } = await supabase.rpc('resolve_login_email', { p_username: username });
    const email = typeof data === 'string' && data.includes('@') ? data : null;
    return NextResponse.json({ email });
  } catch {
    return NextResponse.json({ email: null });
  }
}
