import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// NOTE: no `export const runtime = 'edge'` — see api/health/route.ts.
// Minimal safe connection test: reports configuration + reachability only.
// Never prints keys, secrets, or row data.
export async function GET() {
  const configured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) && Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  if (!configured) {
    return NextResponse.json({ configured: false, reachable: false, hint: 'Add Supabase vars to .env.local (see .env.example).' });
  }
  try {
    const supabase = createClient();
    // Anonymous session check proves the project URL + key route correctly.
    const { error } = await supabase.auth.getSession();
    if (error) throw error;
    return NextResponse.json({ configured: true, reachable: true, service: 'axiora-supabase' });
  } catch {
    return NextResponse.json({ configured: true, reachable: false, hint: 'Check project URL, key, and network.' }, { status: 502 });
  }
}
