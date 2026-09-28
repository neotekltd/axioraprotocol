// Validated environment access. Throws a clear, actionable error when a
// required variable is missing instead of failing cryptically downstream.
//
// BUILD-TIME INLINING (critical):
// Next.js inlines NEXT_PUBLIC_* values into the browser bundle at build time,
// but ONLY for static member access of the form
// `process.env.NEXT_PUBLIC_FOO`. A dynamic lookup such as `process.env[name]`
// survives into the client bundle as a runtime lookup that is always empty
// in the browser, so every browser-side Supabase call would throw. Never use
// dynamic/computed access for client-facing variables.

function missing(name: string): Error {
  return new Error(
    `Missing ${name}. Copy .env.example to .env.local and fill in your Supabase project values.`
  );
}

export const env = {
  supabaseUrl: (): string => {
    // Static access on purpose — see note above. Do not refactor to a
    // `required(name)` helper with `process.env[name]`.
    const value = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!value) throw missing('NEXT_PUBLIC_SUPABASE_URL');
    return value;
  },
  // Publishable key only — safe for browser bundles. Never put secrets here.
  supabasePublishableKey: (): string => {
    // Static access on purpose — see note above.
    const value =
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!value) throw missing('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY');
    return value;
  },
};
