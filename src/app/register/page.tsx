import { cookies } from 'next/headers';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { REFERRAL_COOKIE, normalizeReferralCode } from '@/lib/referral-cookie';

export const metadata = {
  title: 'Register',
  description: 'Create your Axiora Protocol account. Email verification required.',
  alternates: { canonical: '/register' },
};

export default function RegisterPage() {
  // Server-read first-touch attribution (cookie is readable client-side too,
  // but the server value wins for the initial prefill — no flash, no JS).
  const captured = normalizeReferralCode(cookies().get(REFERRAL_COOKIE)?.value ?? '');
  return <RegisterForm referredCode={captured || null} />;
}
