'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateDisplayName } from '@/lib/actions';
import { AxButton, AxInput, FieldError, FieldSuccess } from '@/components/ax/controls';
import { useT } from '@/components/LanguageProvider';

export function ProfileForm({ email, verified, displayName, memberSince, referralCode }: {
  email: string; verified: boolean; displayName: string | null; memberSince: string; referralCode: string | null;
}) {
  const t = useT();
  const router = useRouter();
  const [name, setName] = useState(displayName ?? '');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const save = async () => {
    setBusy(true);
    setMessage(null);
    const res = await updateDisplayName({ displayName: name });
    setBusy(false);
    setMessage({ ok: res.ok, text: res.message });
    if (res.ok) router.refresh();
  };

  return (
    <div className="mt-6 max-w-2xl space-y-5 rounded-[20px] border border-[#202A3A] bg-[#0D111A] p-6">
      <div>
        <div className="mb-2 text-[14px] text-[#AAB5C7]">{t.profile.email}</div>
        <div dir="ltr" className="rounded-[16px] border border-[#2A394D] bg-[#080B12] px-4 py-3.5 text-left text-[15px] text-white">
          {email} <span className={`ml-2 text-[13px] ${verified ? 'text-[#35D98B]' : 'text-[#F2BF4A]'}`}>{verified ? t.pf.verified : t.pf.unverified}</span>
        </div>
      </div>
      <div>
        <label htmlFor="display-name" className="mb-2 block text-[14px] text-[#AAB5C7]">{t.profile.displayName}</label>
        <AxInput id="display-name" value={name} onChange={(e) => setName(e.target.value)} placeholder={t.pf.namePh} maxLength={60} />
      </div>
      <div className="grid gap-4 text-[14px] sm:grid-cols-2">
        <div><div className="text-[#78859A]">{t.pf.memberSince}</div><div className="mt-1 text-white">{memberSince}</div></div>
        <div><div className="text-[#78859A]">{t.profile.referralCode}</div><div dir="ltr" className="mt-1 text-left font-mono text-[#2FD6FF]">{referralCode ?? '—'}</div></div>
      </div>
      {message && (message.ok
        ? <FieldSuccess message={message.text} />
        : <FieldError message={message.text} />)}
      <div className="max-w-xs">
        <AxButton onClick={save} disabled={busy}>
          {busy ? t.pf.saving : t.profile.save}
        </AxButton>
      </div>
    </div>
  );
}
