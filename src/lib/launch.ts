// Site-wide go-live moment — ONE source of truth for the Live counter.
// The timestamp is fixed at the official launch; every visitor, tab and
// session derives the same elapsed time from it. Never Date.now() at mount.
//
// Resolution order: NEXT_PUBLIC_AXIORA_LAUNCH_TIMESTAMP (explicit,
// inlined at build time from .env.local / shell) → code fallback for
// development. Production builds MUST carry the explicit value.

// Development fallback. Fixed (not Date.now()) so every visitor still sees
// the same global value even if the env var is missing. Updated at launch.
const FALLBACK_LAUNCH_MS = Date.parse('2026-10-04T09:29:17Z');

export function launchTimestampMs(): number {
  // Static access on purpose (see lib/env.ts). Public value, safe to inline.
  const raw = process.env.NEXT_PUBLIC_AXIORA_LAUNCH_TIMESTAMP;
  const parsed = raw ? Date.parse(raw) : NaN;
  return Number.isFinite(parsed) ? (parsed as number) : FALLBACK_LAUNCH_MS;
}

// Fixed UTC stamp for public display, e.g. "2026-10-04 09:29:17 UTC".
export function formatLaunchUtc(launchMs: number): string {
  const d = new Date(launchMs);
  const p = (n: number) => String(n).padStart(2, '0');
  return (
    `${d.getUTCFullYear()}-${p(d.getUTCMonth() + 1)}-${p(d.getUTCDate())} ` +
    `${p(d.getUTCHours())}:${p(d.getUTCMinutes())}:${p(d.getUTCSeconds())} UTC`
  );
}

// Elapsed duration formatter: unbounded hours (24:00:00, not 00:00:00),
// clamped at zero — never negative, NaN or Infinity.
export function formatElapsed(launchMs: number, nowMs: number): string {
  const raw = Math.floor((nowMs - launchMs) / 1000);
  const total = Number.isFinite(raw) ? Math.max(0, raw) : 0;
  const h = String(Math.floor(total / 3600)).padStart(2, '0');
  const m = String(Math.floor((total % 3600) / 60)).padStart(2, '0');
  const s = String(total % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
}
