// Runtime secret access. SERVER ONLY — never import from client components.
//
// Cloudflare Workers expose secrets/vars as environment BINDINGS, not as
// process.env. Plain process.env reads only see build-time values, so a
// Worker secret (set via `wrangler secret put`) is invisible to them —
// that exact gap caused the deposit rail to report PROVIDER_DISABLED in
// production while configured. This bridge reads the request-scoped
// binding first and falls back to process.env for local dev/preview.
import { getCloudflareContext } from '@opennextjs/cloudflare';

export function runtimeEnv(name: string): string | undefined {
  try {
    const ctx = getCloudflareContext();
    const value = (ctx.env as Record<string, unknown> | undefined)?.[name];
    if (typeof value === 'string' && value.length > 0) return value;
  } catch {
    // Outside the Worker request scope (local dev, build, tests).
  }
  const fallback = process.env[name];
  return fallback && fallback.length > 0 ? fallback : undefined;
}
