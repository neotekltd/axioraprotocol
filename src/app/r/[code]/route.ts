import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  REFERRAL_COOKIE,
  REFERRAL_COOKIE_MAX_AGE,
  normalizeReferralCode,
} from '@/lib/referral-cookie';

// Public referral entry: /r/CODE captures first-touch attribution in a
// first-party cookie, then leaves the URL (redirects home). A route handler
// (not a page) so the Set-Cookie header is attached to the redirect
// response deterministically. Invalid codes redirect home with no cookie
// and no error surface. Never throws.
export async function GET(request: Request, { params }: { params: { code: string } }) {
  const home = new URL('/', request.url);
  const host = new URL(request.url).hostname;
  const local = /^(localhost|127\.|0\.0\.0\.0)/.test(host);
  try {
    const code = normalizeReferralCode(params.code);
    const has = request.headers
      .get('cookie')
      ?.split(';')
      .some((p) => p.trim().startsWith(`${REFERRAL_COOKIE}=`));
    // First-touch locked: a later /r/OTHER never overwrites CODE_A.
    if (code !== '' && !has) {
      const supabase = createClient();
      const { data } = await supabase.rpc('referral_code_valid', { p_code: code });
      if (data === true) {
        const res = NextResponse.redirect(home);
        res.cookies.set(REFERRAL_COOKIE, code, {
          path: '/',
          maxAge: REFERRAL_COOKIE_MAX_AGE,
          sameSite: 'lax',
          secure: !local,
        });
        return res;
      }
    }
  } catch {
    // Attribution is best-effort; entry must never break.
  }
  return NextResponse.redirect(home);
}
