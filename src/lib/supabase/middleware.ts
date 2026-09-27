import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { env } from '@/lib/env';

// Refreshes the Supabase session on every request so server code always sees
// a current user. Also gates /app/* behind authentication.
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const supabase = createServerClient(env.supabaseUrl(), env.supabasePublishableKey(), {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet: { name: string; value: string; options?: object }[]) => {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && request.nextUrl.pathname.startsWith('/app')) {
    const login = request.nextUrl.clone();
    login.pathname = '/login';
    login.searchParams.set('next', request.nextUrl.pathname);
    return NextResponse.redirect(login);
  }
  // Defense in depth: a session without a confirmed email never enters /app.
  if (user && !user.email_confirmed_at && request.nextUrl.pathname.startsWith('/app')) {
    const verify = request.nextUrl.clone();
    verify.pathname = '/verify-email';
    verify.searchParams.set('email', user.email ?? '');
    return NextResponse.redirect(verify);
  }
  if (user && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/register')) {
    const app = request.nextUrl.clone();
    app.pathname = '/app/dashboard';
    return NextResponse.redirect(app);
  }
  return response;
}
