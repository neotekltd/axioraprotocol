// Service-role Supabase client. SERVER ONLY — never import from client
// components or browser code. Used by webhook/IPN handlers and other
// sessionless server paths that must bypass RLS deliberately.
import { createClient as createJsClient } from '@supabase/supabase-js';
import { runtimeEnv } from '@/lib/runtime-env';

export function createServiceClient() {
  // Worker secrets arrive as bindings (see lib/runtime-env); .env.local
  // covers local dev. Static NEXT_PUBLIC_* access stays direct (lib/env).
  const url = runtimeEnv('NEXT_PUBLIC_SUPABASE_URL');
  const key = runtimeEnv('SUPABASE_SECRET_KEY');
  if (!url) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL.');
  if (!key) throw new Error('Missing SUPABASE_SECRET_KEY.');
  return createJsClient(url, key, { auth: { persistSession: false } });
}
