// Service-role Supabase client. SERVER ONLY — never import from client
// components or browser code. Used by webhook/IPN handlers and other
// sessionless server paths that must bypass RLS deliberately.
import { createClient as createJsClient } from '@supabase/supabase-js';

export function createServiceClient() {
  // Static access on purpose (see lib/env.ts). Server runtime only.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL.');
  if (!key) throw new Error('Missing SUPABASE_SECRET_KEY.');
  return createJsClient(url, key, { auth: { persistSession: false } });
}
