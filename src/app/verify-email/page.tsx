import { Suspense } from 'react';
import { VerifyEmailForm } from '@/components/auth/VerifyEmailForm';
import { TechGridBackground } from '@/components/ax/primitives';

export const metadata = {
  title: 'Verify email',
  description: 'Enter the 6-digit code to verify your Axiora email address.',
  alternates: { canonical: '/verify-email' },
};

export default function VerifyEmailPage() {
  return (
    <div className="relative min-h-screen bg-[#080B12]">
      <TechGridBackground />
      <div className="relative">
        <Suspense>
          <VerifyEmailForm />
        </Suspense>
      </div>
    </div>
  );
}
