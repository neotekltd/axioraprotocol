// Validated environment access. Throws a clear, actionable error when a
// required variable is missing instead of failing cryptically downstream.

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing ${name}. Copy .env.example to .env.local and fill in your Supabase project values.`
    );
  }
  return value;
}

export const env = {
  supabaseUrl: () => required('NEXT_PUBLIC_SUPABASE_URL'),
  // Publishable key only — safe for browser bundles. Never put secrets here.
  supabasePublishableKey: () =>
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    required('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'),
};
