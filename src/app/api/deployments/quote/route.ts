import { NextResponse } from 'next/server';
import { CalculatorQuerySchema } from '@/lib/validation';
import { calculateDeployment } from '@/lib/finance';

export const runtime = 'edge';

// Server-authoritative quote. Frontend estimate must never be trusted for confirmation.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const parsed = CalculatorQuerySchema.safeParse({
    amount: url.searchParams.get('amount'),
    termDays: url.searchParams.get('termDays'),
  });
  if (!parsed.success) return NextResponse.json({ error: 'VALIDATION_ERROR', issues: parsed.error.issues }, { status: 400 });
  return NextResponse.json({
    quote: calculateDeployment({ amount: parsed.data.amount, termDays: parsed.data.termDays }),
    note: 'Server-side quote. Final confirmation must re-run inside a DB transaction with snapshotted rates.',
  });
}
