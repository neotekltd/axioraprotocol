'use client';
import { createBrowserClient } from '@supabase/ssr';
import { env } from '@/lib/env';

// Single canonical browser client. Publishable key only — never secrets.
export function createClient() {
  return createBrowserClient(env.supabaseUrl(), env.supabasePublishableKey());
}
