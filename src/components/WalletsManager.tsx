'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { addWallet, removeWallet } from '@/lib/actions';
import { AxButton, AxInput, FieldError, FieldSuccess } from '@/components/ax/controls';
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

  return (
    <div>
      {initial.length === 0 ? (
        <p className="p-6 text-[14px] text-[#78859A]">No saved addresses yet.</p>
      ) : (
        <ul className="divide-y divide-[#202A3A]/70">
          {initial.map((w) => (
            <li key={w.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 text-[14px]">
              <div>
                <div className="font-mono text-white">{w.asset} / {w.network}</div>
                <div className="mt-0.5 break-all font-mono text-[12px] text-[#78859A]">{w.address}{w.label ? ` · ${w.label}` : ''}</div>
                <div className="mt-0.5 font-mono text-[11px] uppercase tracking-[0.12em] text-[#78859A]">{w.verified ? 'Verified' : 'Unverified — verify before using for withdrawals'}</div>
              </div>
              <button onClick={() => remove(w.id)} className="rounded-[12px] border border-[#2A394D] px-4 py-2 text-[13px] text-[#AAB5C7] hover:border-[rgba(240,107,120,0.5)] hover:text-[#F06B78]">Remove</button>
            </li>
          ))}
        </ul>
      )}
      <div className="border-t border-[#202A3A] p-5 sm:p-6">
        <div className="text-[15px] font-bold text-white">Add wallet</div>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="w-asset" className="mb-2 block text-[14px] text-[#AAB5C7]">Asset</label>
            <AxInput id="w-asset" value={asset} onChange={(e) => setAsset(e.target.value)} />
          </div>
          <div>
            <label htmlFor="w-network" className="mb-2 block text-[14px] text-[#AAB5C7]">Network</label>
            <AxInput id="w-network" value={network} onChange={(e) => setNetwork(e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="w-address" className="mb-2 block text-[14px] text-[#AAB5C7]">Address</label>
            <AxInput id="w-address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Destination address" className="font-mono" autoComplete="off" />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="w-label" className="mb-2 block text-[14px] text-[#AAB5C7]">Label (optional)</label>
            <AxInput id="w-label" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Personal Tron" />
          </div>
        </div>
        <p className="mt-3 text-[13px] text-[#78859A]">New addresses require verification before withdrawals can target them.</p>
        {message && (message.ok
          ? <FieldSuccess message={message.text} />
          : <div className="mt-1"><FieldError message={message.text} /></div>)}
        <div className="mt-4 max-w-xs">
          <AxButton onClick={save} disabled={busy}>
            {busy ? 'Saving…' : 'Save wallet'}
          </AxButton>
        </div>
      </div>
    </div>
  );
}
