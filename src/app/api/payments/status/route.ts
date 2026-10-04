import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { providerEnabled } from '@/lib/nowpayments';
import { runtimeEnv } from '@/lib/runtime-env';

// Authenticated rail readiness probe. Booleans ONLY — never values, never
// keys, never row data. Lets an operator distinguish "provider not
// configured" from "database not migrated" without touching secrets.
export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'UNAUTHENTICATED', code: 'UNAUTHENTICATED' }, { status: 401 });

  const provider = providerEnabled();
  const ipn = !!runtimeEnv('NOWPAYMENTS_IPN_SECRET');

  let db = false;
  try {
    const svc = createServiceClient();
    const { error } = await svc.from('wallet_transactions').select('provider_ref').limit(0);
    db = !error;
  } catch {
    db = false;
  }

  return NextResponse.json({ provider, ipn, db });
}
