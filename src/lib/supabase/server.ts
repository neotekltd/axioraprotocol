import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { env } from '@/lib/env';

// Single canonical server client (Server Components, Route Handlers, Actions).
// Cookie-based session. Publishable key only; service-role never touches the browser.
export function createClient() {
  const store = cookies();
  return createServerClient(env.supabaseUrl(), env.supabasePublishableKey(), {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (toSet: { name: string; value: string; options?: object }[]) => {
        try {
          toSet.forEach(({ name, value, options }) => store.set(name, value, options as never));
        } catch {
          // Read-only Server Component context — middleware refreshes instead.
        }
      },
    },
  });
}
