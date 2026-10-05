'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { AxButton, AxInput, FieldError, FieldSuccess } from '@/components/ax/controls';
import { PageHeader } from '@/components/data';
import { useT } from '@/components/LanguageProvider';

export function SecurityView({ email, verified }: { email: string; verified: boolean }) {
  const t = useT();
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  const changePassword = async () => {
    setMessage(null);
    if (password.length < 8) {
      setMessage({ ok: false, text: t.sec.pwMin8 });
      return;
    }
    if (password !== confirm) {
      setMessage({ ok: false, text: t.auth.passwordsNoMatch });
      return;
    }
    setBusy(true);
    try {
      const { error } = await createClient().auth.updateUser({ password });
      setMessage(error ? { ok: false, text: error.message } : { ok: true, text: t.security.updated });
      if (!error) {
        setPassword('');
        setConfirm('');
      }
    } catch {
      setMessage({ ok: false, text: t.sec.connFail });
    } finally {
      setBusy(false);
    }
  };

  const signOut = async () => {
    setSigningOut(true);
    await createClient().auth.signOut();
    router.replace('/login');
    router.refresh();
  };

  return (
    <div>
      <PageHeader title={t.security.title} sub={t.sec.signedInAs.replace('{e}', email)} />
      <div className="mt-6 max-w-2xl space-y-6 rounded-[20px] border border-[#202A3A] bg-[#0D111A] p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-[15px] font-semibold text-white">{t.sec.emailVer}</div>
            <div className={`mt-0.5 text-[13px] ${verified ? 'text-[#35D98B]' : 'text-[#F2BF4A]'}`}>
              {verified ? t.sec.verified : t.sec.notVerified}
            </div>
          </div>
          {!verified && <Link href="/verify-email" className="rounded-[12px] border border-[#2A394D] px-4 py-2 text-[13px] text-white hover:border-[rgba(47,214,255,0.5)]">{t.sec.verifyNow}</Link>}
        </div>
        <div className="border-t border-[#202A3A] pt-5">
          <div className="text-[15px] font-semibold text-white">{t.sec.changePw}</div>
          <label htmlFor="new-password" className="mb-2 mt-3 block text-[14px] text-[#AAB5C7]">{t.auth.min8pass}</label>
          <AxInput id="new-password" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} className="sm:max-w-xs" />
          <label htmlFor="confirm-password" className="mb-2 mt-3 block text-[14px] text-[#AAB5C7]">{t.auth.confirmPassword}</label>
          <AxInput id="confirm-password" type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="sm:max-w-xs" />
          {message && (message.ok
            ? <FieldSuccess message={message.text} />
            : <div className="mt-2"><FieldError message={message.text} /></div>)}
          <div className="mt-4 max-w-xs">
            <AxButton onClick={changePassword} disabled={busy}>
              {busy ? t.auth.updating : t.auth.updatePassword}
            </AxButton>
          </div>
        </div>
        <div className="border-t border-[#202A3A] pt-5">
          <div className="text-[15px] font-semibold text-white">{t.sec.totp}</div>
          <p className="mt-1 text-[13px] leading-relaxed text-[#78859A]">{t.sec.totpBody}</p>
        </div>
        <div className="border-t border-[#202A3A] pt-5">
          <div className="text-[15px] font-semibold text-white">{t.sec.session}</div>
          <p className="mt-1 text-[13px] text-[#78859A]">{t.sec.sessionBody}</p>
          <button onClick={signOut} disabled={signingOut} className="mt-3 rounded-[14px] border border-[rgba(240,107,120,0.4)] px-6 py-3 text-[14px] font-semibold text-[#F06B78] hover:bg-[rgba(240,107,120,0.1)] disabled:opacity-60">
            {signingOut ? t.account.signingOut : t.sec.signOutDevice}
          </button>
        </div>
      </div>
    </div>
  );
}
