// Login identifier helpers (client-safe, pure). The login accepts a single
// "username or email" field; Supabase password sign-in still uses the real
// account email. Display username and auth email stay separate concepts.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_RE = /^[a-z0-9_]{3,64}$/;

export function isEmailLike(raw: string): boolean {
  return EMAIL_RE.test(raw.trim());
}

// Canonical auth-email normalization (single funnel for signup, resend,
// verification UI, and login so no variant like "Email@example.com "
// ever diverges from the Auth user "email@example.com").
export function normalizeAuthEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

// Normalized for lookup comparison. Registration already constrains
// usernames to this shape; legacy values are lowered for matching.
export function normalizeUsername(raw: string): string {
  return raw.trim().toLowerCase();
}

// Whether the identifier is even worth sending to the server resolver
// (shape check only — NOT an existence signal).
export function isResolvableUsername(raw: string): boolean {
  return USERNAME_RE.test(normalizeUsername(raw));
}
