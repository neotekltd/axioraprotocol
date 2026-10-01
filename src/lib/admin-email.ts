// Single-administrator identity (SERVER ONLY — never import from client
// components; the browser must never receive this as an authorization
// rule). Changing the administrator requires a deliberate migration that
// updates both this constant and the is_admin() database function.
export const SOLE_ADMIN_EMAIL = 'jaidanem6@gmail.com';

export function isSoleAdminEmail(email: string | null | undefined): boolean {
  return Boolean(email) && email!.trim().toLowerCase() === SOLE_ADMIN_EMAIL;
}

// Post-login destination decided server-side from the verified session.
// Admin -> /admin always (no dashboard flash). Everyone else -> the
// requested in-app path, or the dashboard. Admin-only paths never leak to
// normal users: /admin serves its own authorization failure.
export function resolveDestination(isAdmin: boolean, next: string | null): string {
  if (isAdmin) return '/admin';
  if (next === '/admin') return '/app/dashboard';
  if (next && next.startsWith('/app/')) return next;
  return '/app/dashboard';
}
