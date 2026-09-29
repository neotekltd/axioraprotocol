import Link from 'next/link';
import { Suspense } from 'react';
import { LoginForm } from '@/components/auth/LoginForm';

export const metadata = {
  title: 'Log in',
  description: 'Sign in to your Axiora Protocol account.',
  alternates: { canonical: '/login' },
};

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md px-4 pt-28 pb-20">
      <div className="glass rounded-3xl p-8">
        <h1 className="text-2xl font-bold">Welcome back</h1>
        <p className="mt-1 text-xs text-fog">Secure encrypted connection · Supabase Auth session</p>
        <Suspense>
          <LoginForm />
        </Suspense>
        <p className="mt-4 text-center text-xs text-fog">Don&apos;t have an account? <Link href="/register" className="text-pulse">Create one</Link></p>
      </div>
    </div>
  );
}
