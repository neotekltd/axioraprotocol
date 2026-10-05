'use client';

// Admin interactive controls. Every mutation runs through server actions
// with audit logging; buttons show busy/success/error states inline.
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AxButton, AxInput, FieldError, FieldSuccess } from '@/components/ax/controls';
import { useT } from '@/components/LanguageProvider';
import { stWord } from '@/lib/i18n-dict';
import { confirmDeposit, rejectDeposit, setWithdrawalStatus, updateNetwork, updateSetting } from '@/lib/admin-actions';
import { approveWithdrawalPayout, syncPayoutStatus } from '@/lib/payout-actions';
import type { AdminNetwork } from '@/lib/admin';

function useAction<T extends unknown[], R extends { ok: boolean; message: string }>(fn: (...args: T) => Promise<R>) {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<R | null>(null);
  const router = useRouter();
  const run = async (...args: T) => {
    setBusy(true);
    setResult(null);
    try {
      const r = await fn(...args);
      setResult(r);
      if (r.ok) router.refresh();
    } finally {
      setBusy(false);
    }
  };
  return { busy, result, run };
}

export function DepositActions({ id, status, provider, needsReview }: {
  id: string; status: string; provider?: string | null; needsReview?: boolean;
}) {
  const t = useT();
  const confirm = useAction(confirmDeposit);
  const reject = useAction(rejectDeposit);
  const [reason, setReason] = useState('');
  const [arming, setArming] = useState<'confirm' | 'reject' | null>(null);
  if (status !== 'pending') {
    return <p className="text-[13px] text-[#78859A]">{t.adm.noAction.replace('{s}', stWord(t, status))}</p>;
  }
  // Normal automatic provider deposits credit themselves on verified IPN:
  // no admin approve button. Flagged exceptions keep the review actions
  // (the server re-validates before crediting).
  if (provider === 'nowpayments' && !needsReview) {
    return (
      <p className="text-[13px] leading-relaxed text-[#78859A]">
        {t.adm.autoInfo}
      </p>
    );
  }
  return (
    <div className="space-y-3">
      {arming === null && (
        <div className="flex flex-wrap gap-2.5">
          <button
            type="button"
            onClick={() => setArming('confirm')}
            className="min-h-[52px] flex-1 rounded-[14px] bg-[#2FD6FF] px-6 text-[14px] font-bold text-[#06121A] transition hover:brightness-110 active:scale-[0.99]"
          >
            {t.adm.confirmBtn}
          </button>
          <button
            type="button"
            onClick={() => setArming('reject')}
            className="min-h-[52px] flex-1 rounded-[14px] border border-[rgba(240,107,120,0.4)] px-6 text-[14px] font-bold text-[#F06B78] transition hover:bg-[rgba(240,107,120,0.08)] active:scale-[0.99]"
          >
            {t.admin.deposits.reject}
          </button>
        </div>
      )}
      {arming === 'confirm' && (
        <div className="rounded-[14px] border border-[rgba(47,214,255,0.4)] bg-[rgba(47,214,255,0.05)] p-4">
          <p className="text-[14px] font-bold text-white">{t.adm.confirmQ}</p>
          <p className="mt-1 text-[13px] text-[#AAB5C7]">{t.adm.confirmHint}</p>
          <div className="mt-3 flex gap-2.5">
            <AxButton disabled={confirm.busy} onClick={() => { setArming(null); void confirm.run(id); }}>
              {confirm.busy ? t.adm.confirming : t.adm.yesConfirm}
            </AxButton>
            <button type="button" onClick={() => setArming(null)} className="rounded-[14px] border border-[#2A394D] px-5 text-[14px] font-bold text-white">
              {t.common.cancel}
            </button>
          </div>
        </div>
      )}
      {arming === 'reject' && (
        <div className="rounded-[14px] border border-[rgba(240,107,120,0.4)] bg-[rgba(240,107,120,0.05)] p-4">
          <AxInput value={reason} onChange={(e) => setReason(e.target.value)} placeholder={t.adm.reasonPh} maxLength={500} aria-label={t.adm.reasonAria} />
          <div className="mt-3 flex gap-2.5">
            <AxButton disabled={reject.busy} onClick={() => { setArming(null); void reject.run({ id, reason }); }}>
              {reject.busy ? t.adm.rejecting : t.adm.yesReject}
            </AxButton>
            <button type="button" onClick={() => setArming(null)} className="rounded-[14px] border border-[#2A394D] px-5 text-[14px] font-bold text-white">
              {t.common.cancel}
            </button>
          </div>
        </div>
      )}
      {confirm.result && (confirm.result.ok
        ? <FieldSuccess message={confirm.result.message} />
        : <FieldError message={confirm.result.message} />)}
      {reject.result && (reject.result.ok
        ? <FieldSuccess message={reject.result.message} />
        : <FieldError message={reject.result.message} />)}
    </div>
  );
}

export function WithdrawalActions({ id, status, providerEnabled }: { id: string; status: string; providerEnabled: boolean }) {
  const t = useT();
  const act = useAction(setWithdrawalStatus);
  const payout = useAction(approveWithdrawalPayout);
  const sync = useAction(syncPayoutStatus);
  const [txHash, setTxHash] = useState('');
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2.5">
        {status === 'pending' && (
          <>
            {providerEnabled ? (
              <button type="button" disabled={payout.busy} onClick={() => void payout.run(id)} className="min-h-[52px] flex-1 rounded-[14px] bg-[#2FD6FF] px-6 text-[14px] font-bold text-[#06121A] transition hover:brightness-110 active:scale-[0.99] disabled:opacity-50">
                {t.adm.approvePayout}
              </button>
            ) : (
              <button type="button" disabled={act.busy} onClick={() => void act.run({ id, to: 'processing' })} className="min-h-[52px] flex-1 rounded-[14px] bg-[#2FD6FF] px-6 text-[14px] font-bold text-[#06121A] transition hover:brightness-110 active:scale-[0.99] disabled:opacity-50">
                {t.adm.approve}
              </button>
            )}
            <button type="button" disabled={act.busy} onClick={() => void act.run({ id, to: 'cancelled' })} className="min-h-[52px] flex-1 rounded-[14px] border border-[rgba(240,107,120,0.4)] px-6 text-[14px] font-bold text-[#F06B78] transition hover:bg-[rgba(240,107,120,0.08)] active:scale-[0.99] disabled:opacity-50">
              {t.admin.deposits.reject}
            </button>
          </>
        )}
        {status === 'processing' && (
          <>
            {providerEnabled && (
              <button type="button" disabled={sync.busy} onClick={() => void sync.run(id)} className="min-h-[52px] flex-1 rounded-[14px] border border-[rgba(47,214,255,0.5)] px-6 text-[14px] font-bold text-[#2FD6FF] transition hover:bg-[rgba(47,214,255,0.08)] active:scale-[0.99] disabled:opacity-50">
                {t.adm.syncBtn}
              </button>
            )}
            <button type="button" disabled={act.busy} onClick={() => void act.run({ id, to: 'completed', txHash: txHash.trim() || undefined })} className="min-h-[52px] flex-1 rounded-[14px] bg-[#35D98B] px-6 text-[14px] font-bold text-[#06121A] transition hover:brightness-110 active:scale-[0.99] disabled:opacity-50">
              {t.adm.markSent}
            </button>
            <button type="button" disabled={act.busy} onClick={() => void act.run({ id, to: 'cancelled' })} className="min-h-[52px] flex-1 rounded-[14px] border border-[rgba(240,107,120,0.4)] px-6 text-[14px] font-bold text-[#F06B78] transition hover:bg-[rgba(240,107,120,0.08)] active:scale-[0.99] disabled:opacity-50">
              {t.common.cancel}
            </button>
          </>
        )}
        {(status !== 'pending' && status !== 'processing') && (
          <p className="text-[13px] text-[#78859A]">{t.adm.noWdAction.replace('{s}', stWord(t, status))}</p>
        )}
      </div>
      {status === 'processing' && (
        <AxInput value={txHash} onChange={(e) => setTxHash(e.target.value)} placeholder={t.adm.broadcastPh} autoComplete="off" spellCheck={false} dir="ltr" className="font-mono" aria-label={t.adm.broadcastAria} />
      )}
      {providerEnabled && status === 'pending' && (
        <p className="text-[12px] leading-relaxed text-[#78859A]">
          {t.adm.payoutHint}
        </p>
      )}
      {act.result && (act.result.ok
        ? <FieldSuccess message={act.result.message} />
        : <FieldError message={act.result.message} />)}
      {payout.result && (payout.result.ok
        ? <FieldSuccess message={payout.result.message} />
        : <FieldError message={payout.result.message} />)}
      {sync.result && (sync.result.ok
        ? <FieldSuccess message={sync.result.message} />
        : <FieldError message={sync.result.message} />)}
    </div>
  );
}

export function NetworkEditor({ network }: { network: AdminNetwork }) {
  const t = useT();
  const [address, setAddress] = useState(network.address);
  const [contract, setContract] = useState(network.contract ?? '');
  const [memoRequired, setMemoRequired] = useState(network.memoRequired);
  const [memoLabel, setMemoLabel] = useState(network.memoLabel ?? '');
  const [confirmations, setConfirmations] = useState(String(network.confirmations));
  const [minimum, setMinimum] = useState(String(network.minimum));
  const [depositEnabled, setDepositEnabled] = useState(network.depositEnabled);
  const [withdrawalEnabled, setWithdrawalEnabled] = useState(network.withdrawalEnabled);
  const save = useAction(updateNetwork);
  const ready = address.trim().length > 0;
  return (
    <div className="space-y-4 p-5 sm:p-6">
      <div className="flex flex-wrap items-center gap-2">
        <span className={`rounded-full border px-3 py-1 font-mono text-[11px] font-bold ${depositEnabled && ready ? 'border-[rgba(53,217,139,0.4)] text-[#35D98B]' : 'border-[#2A394D] text-[#78859A]'}`}>
          {depositEnabled && ready ? t.adm.ready : t.adm.notReady}
        </span>
        {!ready && <span className="text-[12px] text-[#F2BF4A]">{t.adm.addrMissing}</span>}
      </div>
      <div>
        <label className="mb-2 block text-[14px] text-[#AAB5C7]" htmlFor={`addr-${network.id}`}>{t.adm.depAddrLbl}</label>
        <AxInput id={`addr-${network.id}`} value={address} onChange={(e) => setAddress(e.target.value)} placeholder={t.adm.notCfg} autoComplete="off" spellCheck={false} dir="ltr" className="font-mono" />
      </div>
      <div>
        <label className="mb-2 block text-[14px] text-[#AAB5C7]" htmlFor={`contract-${network.id}`}>{t.adm.tokenLbl} <span className="text-[#596579]">{t.adm.nullNative}</span></label>
        <AxInput id={`contract-${network.id}`} value={contract} onChange={(e) => setContract(e.target.value)} placeholder={t.adm.notApplicable} autoComplete="off" spellCheck={false} dir="ltr" className="font-mono" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-[14px] text-[#AAB5C7]" htmlFor={`conf-${network.id}`}>{t.adm.confLbl}</label>
          <AxInput id={`conf-${network.id}`} value={confirmations} onChange={(e) => setConfirmations(e.target.value)} inputMode="numeric" dir="ltr" />
        </div>
        <div>
          <label className="mb-2 block text-[14px] text-[#AAB5C7]" htmlFor={`min-${network.id}`}>{t.adm.minDepLbl}</label>
          <AxInput id={`min-${network.id}`} value={minimum} onChange={(e) => setMinimum(e.target.value)} inputMode="decimal" dir="ltr" />
        </div>
      </div>
      <div>
        <label className="mb-2 block text-[14px] text-[#AAB5C7]" htmlFor={`memo-${network.id}`}>{t.adm.memoLbl} <span className="text-[#596579]">{t.adm.emptyNotReq}</span></label>
        <AxInput id={`memo-${network.id}`} value={memoLabel} onChange={(e) => setMemoLabel(e.target.value)} placeholder={t.adm.notReq} maxLength={60} />
      </div>
      <div className="flex flex-wrap gap-5 text-[14px]">
        <label className="flex items-center gap-2 text-white">
          <input type="checkbox" checked={memoRequired} onChange={(e) => setMemoRequired(e.target.checked)} className="h-5 w-5 accent-[#2FD6FF]" />
          {t.adm.memoReq}
        </label>
        <label className="flex items-center gap-2 text-white">
          <input type="checkbox" checked={depositEnabled} onChange={(e) => setDepositEnabled(e.target.checked)} className="h-5 w-5 accent-[#2FD6FF]" />
          {t.adm.depEnabled}
        </label>
        <label className="flex items-center gap-2 text-white">
          <input type="checkbox" checked={withdrawalEnabled} onChange={(e) => setWithdrawalEnabled(e.target.checked)} className="h-5 w-5 accent-[#2FD6FF]" />
          {t.adm.wdEnabled}
        </label>
      </div>
      {save.result && (save.result.ok
        ? <FieldSuccess message={save.result.message} />
        : <FieldError message={save.result.message} />)}
      <div className="max-w-xs">
        <AxButton
          disabled={save.busy}
          onClick={() => void save.run({
            id: network.id,
            depositAddress: address.trim(),
            tokenContract: contract.trim(),
            memoRequired,
            memoLabel: memoLabel.trim(),
            confirmations,
            minimum,
            depositEnabled,
            withdrawalEnabled,
          })}
        >
          {save.busy ? t.adm.savingCfg : t.adm.saveCfg}
        </AxButton>
      </div>
    </div>
  );
}

export function SettingEditor({ settingKey, value }: { settingKey: string; value: string }) {
  const t = useT();
  const [v, setV] = useState(value);
  const save = useAction(updateSetting);
  return (
    <div className="flex flex-wrap items-center gap-3 px-5 py-4">
      <div className="min-w-0 flex-1">
        <div className="font-mono text-[13px] font-bold text-white">{settingKey}</div>
        <AxInput value={v} onChange={(e) => setV(e.target.value)} aria-label={settingKey} className="mt-2 font-mono text-[13px]" />
        {save.result && (save.result.ok
          ? <FieldSuccess message={save.result.message} />
          : <FieldError message={save.result.message} />)}
      </div>
      <div className="w-32 shrink-0">
        <AxButton disabled={save.busy} onClick={() => void save.run({ key: settingKey, value: v })}>
          {save.busy ? '…' : t.common.save}
        </AxButton>
      </div>
    </div>
  );
}
