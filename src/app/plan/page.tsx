import { redirect } from 'next/navigation';

// Alias only: the canonical Invest experience lives at /app/deploy
// (authenticated shell, Invest active in nav). /plan redirects there so
// the URL works without a parallel page system. Auth is enforced by the
// existing /app gate (signed-out → /login, unconfirmed → /verify-email).
export default function PlanAlias() {
  redirect('/app/deploy');
}
