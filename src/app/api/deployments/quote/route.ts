import { NextResponse } from 'next/server';
import { CalculatorQuerySchema } from '@/lib/validation';
import { quotePlan } from '@/lib/plans';

// NOTE: no `export const runtime = 'edge'` — see api/health/route.ts.
// Server-authoritative plan quote. Frontend estimate must never be trusted.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const parsed = CalculatorQuerySchema.safeParse({
    amount: url.searchParams.get('amount'),
    plan: url.searchParams.get('plan'),
  });
  if (!parsed.success) return NextResponse.json({ error: 'VALIDATION_ERROR', issues: parsed.error.issues }, { status: 400 });
  try {
    return NextResponse.json({
      quote: quotePlan(parsed.data.plan, parsed.data.amount),
      note: 'Server-side quote. Final confirmation must re-run inside a DB transaction with snapshotted rates.',
    });
  } catch {
    return NextResponse.json({ error: 'QUOTE_ERROR', message: 'Amount outside the selected plan range.' }, { status: 400 });
  }
}
