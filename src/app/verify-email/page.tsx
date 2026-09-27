import { Suspense } from 'react';
import { VerifyEmailForm } from '@/components/auth/VerifyEmailForm';

export const metadata = { title: 'Verify email' };

export default function VerifyEmailPage() {
  return (
    <div className="mx-auto max-w-md px-4 pt-28 pb-20">
      <div className="glass rounded-3xl p-8">
        <div className="text-center">
          <div className="text-sm font-bold tracking-tight">AXIORA PROTOCOL</div>
          <h1 className="mt-3 text-2xl font-bold">Verify your email</h1>
        </div>
        <Suspense>
          <VerifyEmailForm />
        </Suspense>
      </div>
    </div>
  );
}
