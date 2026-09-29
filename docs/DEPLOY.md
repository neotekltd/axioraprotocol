# Axiora Protocol — Cloudflare Deploy / Inspect / Fix Loop

Mandatory workflow for every production deployment. Never blindly redeploy.

## Auth

- Wrangler reads `CLOUDFLARE_API_TOKEN` from process env (plus optional
  `CLOUDFLARE_ACCOUNT_ID`). Stored in `.env.local` (git-ignored, never
  committed, never printed, never `NEXT_PUBLIC_`).
- Each PowerShell call is a fresh process: prefix every Wrangler command with
  the loader (reads the single `CLOUDFLARE_API_TOKEN=` line, no output):
  `$env:CLOUDFLARE_API_TOKEN = (Get-Content -LiteralPath ".env.local" | Where-Object { $_ -match '^CLOUDFLARE_API_TOKEN=' } | Select-Object -First 1).Substring('CLOUDFLARE_API_TOKEN='.Length)`
- Verify with `npx wrangler whoami` (shows account, never the token).

## Loop

```text
inspect (git status, deployments list, config, package.json)
→ build (npm run build:worker; verify .open-next/worker.js exists)
→ deploy (npm run deploy)
→ inspect (deployments list / versions list --json; confirm 100% + version ID)
→ smoke test (/, /login, /register, /verify-email, /api/*, /app guard)
→ logs (wrangler tail during a request; CLEAN or root-cause)
→ diagnose → fix → rebuild → redeploy → verify (repeat until healthy)
```

## Commands

- Adapter: `@opennextjs/cloudflare` (ONE system; no vinext alongside).
- `npm run dev` (local), `npm run build` (plain Next check),
  `npm run build:worker`, `npm run preview` (Windows-local 500s are a known
  miniflare/chdir artifact — production Linux is the source of truth),
  `npm run deploy`.
- Never `npx wrangler deploy` raw (no entry point without the adapter build).

## Reference

- Worker: `axioraprotocol` → https://axioraprotocol.jaidanem6.workers.dev (deployment origin; public canonical URL is https://axioraprotocol.com once custom-domain routing is configured)
- Runtime secrets (set via `wrangler secret put`, never committed):
  `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
- Rollback: pick a prior version ID from `deployments list`; never delete versions.
