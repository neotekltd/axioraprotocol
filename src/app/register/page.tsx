import Link from 'next/link';
import { RegisterForm } from '@/components/auth/RegisterForm';

export const metadata = { title: 'Register' };

export default function RegisterPage() {
  return (
    <div className="mx-auto max-w-md px-4 pt-28 pb-20">
      <div className="glass rounded-3xl p-8">
        <h1 className="text-2xl font-bold">Create account</h1>
        <p className="mt-1 text-xs text-fog">Email verification required · profile auto-created on signup</p>
        <RegisterForm />
        <p className="mt-4 text-center text-xs text-fog">Have an account? <Link href="/login" className="text-pulse">Sign in</Link></p>
      </div>
    </div>
  );
}
