'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateDisplayName } from '@/lib/actions';
import { AxButton, AxInput, FieldError, FieldSuccess } from '@/components/ax/controls';

export function ProfileForm({ email, verified, displayName, memberSince, referralCode }: {
  email: string; verified: boolean; displayName: string | null; memberSince: string; referralCode: string | null;
}) {
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
        <div className="mb-2 text-[14px] text-[#AAB5C7]">Email</div>
        <div className="rounded-[16px] border border-[#2A394D] bg-[#080B12] px-4 py-3.5 text-[15px] text-white">
          {email} <span className={`ml-2 text-[13px] ${verified ? 'text-[#35D98B]' : 'text-[#F2BF4A]'}`}>{verified ? '· verified' : '· unverified'}</span>
        </div>
      </div>
      <div>
        <label htmlFor="display-name" className="mb-2 block text-[14px] text-[#AAB5C7]">Display name</label>
        <AxInput id="display-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="How should we address you?" maxLength={60} />
      </div>
      <div className="grid gap-4 text-[14px] sm:grid-cols-2">
        <div><div className="text-[#78859A]">Member since</div><div className="mt-1 text-white">{memberSince}</div></div>
        <div><div className="text-[#78859A]">Referral code</div><div className="mt-1 font-mono text-[#2FD6FF]">{referralCode ?? '—'}</div></div>
      </div>
      {message && (message.ok
        ? <FieldSuccess message={message.text} />
        : <FieldError message={message.text} />)}
      <div className="max-w-xs">
        <AxButton onClick={save} disabled={busy}>
          {busy ? 'Saving…' : 'Save changes'}
        </AxButton>
      </div>
    </div>
  );
}
