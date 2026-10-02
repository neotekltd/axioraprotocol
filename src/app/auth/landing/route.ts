import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { claimReferral } from '@/lib/actions';
import { isSoleAdminEmail, resolveDestination } from '@/lib/admin-email';

// Post-login landing: decides the destination SERVER-SIDE from the verified
// session and redirects. Sole admin -> /admin with no dashboard flash;
// everyone else -> requested in-app path or dashboard. Used instead of a
// client-side destination lookup so the decision never depends on browser
// state or RPC transport.
//
// Also the single claim point for first-touch referral attribution: a new
// user arriving via /r/CODE lands here after login/verification, and
// claimReferral() attaches them server-side (idempotent no-op for everyone
// else — existing relationships are never touched).
export async function GET(request: Request) {
  const url = new URL(request.url);
  const next = url.searchParams.get('next');
  try {
    const supabase = createClient();
    const { data } = await supabase.auth.getUser();
    const email = data.user?.email ?? null;
    if (data.user) {
      try {
        await claimReferral();
      } catch {
        // Attribution is best-effort; routing must never break.
      }
    }
    return NextResponse.redirect(new URL(resolveDestination(isSoleAdminEmail(email), next), url.origin));
  } catch {
    return NextResponse.redirect(new URL('/app/dashboard', url.origin));
  }
}
