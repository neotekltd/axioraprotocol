import Link from 'next/link';
import { Suspense } from 'react';
import { LoginForm } from '@/components/auth/LoginForm';
import { TechGridBackground } from '@/components/ax/primitives';

export const metadata = {
  title: 'Log in',
  description: 'Sign in to your Axiora Protocol account.',
  alternates: { canonical: '/login' },
};

export default function LoginPage() {
  return (
    <div className="relative min-h-screen bg-[#080B12]">
      <TechGridBackground />
      <div className="relative">
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
