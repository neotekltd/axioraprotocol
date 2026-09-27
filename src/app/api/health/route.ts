import { NextResponse } from 'next/server';

// NOTE: no `export const runtime = 'edge'` — the Cloudflare adapter (OpenNext)
// bundles edge-runtime route handlers separately and fails the worker build.
// Default Node runtime runs on Workers via nodejs_compat. Deployment fix only.
export async function GET() {
  return NextResponse.json({ status: 'ok', service: 'axiora' });
}
