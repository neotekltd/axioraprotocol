import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';
import { getDict } from '@/lib/i18n-server';

export const metadata = {
  title: 'Reset password',
  description: 'Set a new password for your Axiora account.',
  alternates: { canonical: '/reset-password' },
};

export default function ResetPasswordPage() {
  const t = getDict();
  return (
    <div className="mx-auto max-w-md px-4 pt-12 pb-20">
      <div className="glass rounded-3xl p-8">
        <h1 className="text-2xl font-bold">{t.auth.resetTitle}</h1>
        <p className="mt-1 text-xs text-fog">{t.auth.linkNote}</p>
        <ResetPasswordForm />
      </div>
    </div>
  );
}
