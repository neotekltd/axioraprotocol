'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateDisplayName } from '@/lib/actions';

const input = 'mt-1 w-full rounded-xl border border-line bg-void px-4 py-3 text-sm outline-none focus:border-pulse';

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
    <div className="glass mt-6 max-w-2xl space-y-4 rounded-2xl p-6">
      <div>
        <label className="text-xs text-fog">Email</label>
        <div className="mt-1 rounded-xl border border-line bg-void px-4 py-3 text-sm">
          {email} <span className={`ml-2 text-xs ${verified ? 'text-pulse' : 'text-amberx'}`}>{verified ? '· verified' : '· unverified'}</span>
        </div>
      </div>
      <div>
        <label htmlFor="display-name" className="text-xs text-fog">Display name</label>
        <input id="display-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="How should we address you?" className={input} maxLength={60} />
      </div>
      <div className="grid gap-4 text-sm sm:grid-cols-2">
        <div><div className="text-xs text-fog">Member since</div><div className="mt-1">{memberSince}</div></div>
        <div><div className="text-xs text-fog">Referral code</div><div className="mt-1 font-mono text-pulse">{referralCode ?? '—'}</div></div>
      </div>
      {message && <p role={message.ok ? 'status' : 'alert'} className={`text-xs ${message.ok ? 'text-pulse' : 'text-danger'}`}>{message.text}</p>}
      <button onClick={save} disabled={busy} className="rounded-xl bg-pulse px-6 py-2.5 text-sm font-bold text-black disabled:opacity-60 hover:brightness-110">
        {busy ? 'Saving…' : 'Save changes'}
      </button>
    </div>
  );
}
