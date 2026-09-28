'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { addWallet, removeWallet } from '@/lib/actions';
import type { SavedWallet } from '@/lib/queries';

export function WalletsManager({ initial }: { initial: SavedWallet[] }) {
  const router = useRouter();
  const [asset, setAsset] = useState('USDT');
  const [network, setNetwork] = useState('TRC20');
  const [address, setAddress] = useState('');
  const [label, setLabel] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const save = async () => {
    setBusy(true);
    setMessage(null);
    const res = await addWallet({ asset, network, address, label });
    setBusy(false);
    setMessage({ ok: res.ok, text: res.message });
    if (res.ok) {
      setAddress('');
      setLabel('');
      router.refresh();
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Remove this saved address?')) return;
    const res = await removeWallet(id);
    setMessage({ ok: res.ok, text: res.message });
    if (res.ok) router.refresh();
  };

  const input = 'rounded-xl border border-line bg-void px-4 py-2.5 text-sm outline-none focus:border-pulse';
  return (
    <div>
      {initial.length === 0 ? (
        <p className="p-6 text-sm text-fog">No saved addresses yet.</p>
      ) : (
        <ul className="divide-y divide-line">
          {initial.map((w) => (
            <li key={w.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 text-sm">
              <div>
                <div className="font-mono">{w.asset} / {w.network}</div>
                <div className="mt-0.5 break-all font-mono text-xs text-fog">{w.address}{w.label ? ` · ${w.label}` : ''}</div>
                <div className="mt-0.5 text-[11px] text-fog">{w.verified ? 'Verified' : 'Unverified — verify before using for withdrawals'}</div>
              </div>
              <button onClick={() => remove(w.id)} className="rounded-lg border border-line px-4 py-1.5 text-xs hover:border-danger/50 hover:text-danger">Remove</button>
            </li>
          ))}
        </ul>
      )}
      <div className="border-t border-line p-5">
        <div className="text-sm font-bold">Add wallet</div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="text-xs text-fog">Asset<input value={asset} onChange={(e) => setAsset(e.target.value)} className={`mt-1 w-full ${input}`} /></label>
          <label className="text-xs text-fog">Network<input value={network} onChange={(e) => setNetwork(e.target.value)} className={`mt-1 w-full ${input}`} /></label>
          <label className="text-xs text-fog sm:col-span-2">Address<input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Destination address" className={`mt-1 w-full font-mono ${input}`} /></label>
          <label className="text-xs text-fog">Label (optional)<input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Personal Tron" className={`mt-1 w-full ${input}`} /></label>
        </div>
        {message && <p role={message.ok ? 'status' : 'alert'} className={`mt-3 text-xs ${message.ok ? 'text-pulse' : 'text-danger'}`}>{message.text}</p>}
        <button onClick={save} disabled={busy} className="mt-4 rounded-xl bg-pulse px-6 py-2.5 text-sm font-bold text-black disabled:opacity-60 hover:brightness-110">
          {busy ? 'Saving…' : 'Save wallet'}
        </button>
      </div>
    </div>
  );
}
