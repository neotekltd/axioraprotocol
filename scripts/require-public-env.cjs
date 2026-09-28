// Fail-fast guard: NEXT_PUBLIC_* values are inlined into the browser bundle
// at build time. If they are absent when `next build` runs, the shipped
// client silently points at nothing and every browser-side Supabase call
// fails. Abort the build instead.
//
// Reads .env* files directly (no dotenv dependency) plus the live shell env;
// shell values win. Never prints values — names only.
const fs = require('fs');
const path = require('path');

const REQUIRED = ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'];
const ENV_FILES = ['.env.production.local', '.env.local', '.env.production', '.env'];

function fromFiles() {
  const found = {};
  for (const f of ENV_FILES) {
    const p = path.join(process.cwd(), f);
    let text;
    try {
      text = fs.readFileSync(p, 'utf8');
    } catch {
      continue;
    }
    for (const line of text.split(/\r?\n/)) {
      const s = line.trim();
      if (!s || s.startsWith('#')) continue;
      const i = s.indexOf('=');
      if (i < 0) continue;
      const name = s.slice(0, i).trim();
      if (REQUIRED.includes(name) && !(name in found)) found[name] = f;
    }
  }
  return found;
}

const fileHit = fromFiles();
const missing = REQUIRED.filter((n) => !process.env[n] && !(n in fileHit));
if (missing.length > 0) {
  console.error(
    `[prebuild] Missing required public env: ${missing.join(', ')}. ` +
      `Set them in the shell or .env.local (see .env.example). Refusing to build a client bundle without Supabase configuration.`
  );
  process.exit(1);
}
console.log('[prebuild] Public Supabase env present.');
