import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';
import { getDict } from '@/lib/i18n-server';

export const metadata = {
  title: 'Forgot password',
  description: 'Request a password reset link for your Axiora account.',
  alternates: { canonical: '/forgot-password' },
};

export default function ForgotPage() {
  const t = getDict();
  return (
    <div className="mx-auto max-w-md px-4 pt-12 pb-20">
      <div className="glass rounded-3xl p-8">
        <h1 className="text-2xl font-bold">{t.auth.forgotTitle}</h1>
        <p className="mt-1 text-xs text-fog">{t.auth.forgotSub}</p>
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
