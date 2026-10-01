import { NextResponse } from 'next/server';
import { getHomepageActivity, getHomepageTelemetry } from '@/lib/queries';

// Public read-only telemetry snapshot (aggregates + latest activity only).
// Served by SECURITY DEFINER functions exposing no private data. No writes,
// no parameters, no user context.
export async function GET() {
  try {
    const [telemetry, activity] = await Promise.all([getHomepageTelemetry(), getHomepageActivity()]);
    if (!telemetry) {
      return NextResponse.json({ error: 'UNAVAILABLE' }, { status: 503 });
    }
    return NextResponse.json(
      { source: 'axiora', telemetry, activity, at: telemetry.at },
      { headers: { 'Cache-Control': 'public, max-age=60' } }
    );
  } catch {
    return NextResponse.json({ error: 'UNAVAILABLE' }, { status: 503 });
  }
}
