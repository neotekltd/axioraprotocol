import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Next.js SSR path (marketing + dashboard server components).
export function createSupabaseServer() {
  const store = cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (toSet: { name: string; value: string; options?: object }[]) => {
        try {
          toSet.forEach(({ name, value, options }) => store.set(name, value, options as never));
        } catch {
          /* Server Component read-only context */
        }
      },
    },
  });
}
