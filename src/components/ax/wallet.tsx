'use client';

// Shared authenticated wallet kit: tabs, flow cards, chips, summary rows,
// warnings, coin pill, bottom-sheet modal, status pill. ONE visual language
// for Deposit / Withdraw / History. No finance logic lives here.

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { ArrowDown, Check, Copy, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ClientPortal } from '@/components/Portal';
import { useT } from '@/components/LanguageProvider';

export function WalletTabs({ active }: { active: 'deposit' | 'withdraw' | 'history' }) {
  const t = useT();
  const tabs = [
    { key: 'deposit', label: t.wallet.depositTab, href: '/app/deposit' },
    { key: 'withdraw', label: t.withdraw.title, href: '/app/withdraw' },
    { key: 'history', label: t.tabs.history, href: '/app/transactions' },
  ] as const;
  return (
    <nav aria-label={t.tabs.walletNav} className="grid grid-cols-3 gap-1 rounded-[16px] border border-[#202A3A] bg-[#0A0E16] p-1.5">
      {tabs.map((t) => (
        <Link
          key={t.key}
          href={t.href}
          aria-current={active === t.key ? 'page' : undefined}
          className={cn(
            'flex min-h-[48px] items-center justify-center rounded-[11px] text-[14px] transition',
            active === t.key
              ? 'bg-[#1A2334] font-bold text-white shadow-[inset_0_0_0_1px_rgba(47,214,255,0.25)]'
              : 'font-semibold text-[#78859A] hover:text-white'
          )}
        >
          {t.label}
        </Link>
      ))}
    </nav>
  );
}

export function FlowCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('rounded-2xl border border-[#202A3A] bg-[#0C1119] p-5 sm:p-6', className)}>
      {children}
    </div>
  );
}

export function FlowLabel({ children, right }: { children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-[14px] text-[#AAB5C7]">{children}</span>
      {right && <span className="font-mono text-[12px] text-[#78859A]">{right}</span>}
    </div>
  );
}

export function QuickChips({ options, active, onPick }: { options: string[]; active: string | null; onPick: (v: string) => void }) {
  const t = useT();
  return (
    <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label={t.tabs.quickAmounts}>
      {options.map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => onPick(o)}
          aria-pressed={active === o}
          className={cn(
            'min-h-[44px] rounded-full border px-4 font-mono text-[13px] font-semibold transition active:scale-[0.97]',
            active === o
              ? 'border-[rgba(47,214,255,0.6)] bg-[rgba(47,214,255,0.08)] text-[#2FD6FF]'
              : 'border-[#2A394D] bg-[#111722] text-white hover:border-[rgba(47,214,255,0.4)]'
          )}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

export type RowTone = 'white' | 'cyan' | 'green' | 'amber' | 'muted';
const ROW_TONE: Record<RowTone, string> = {
  white: 'text-white',
  cyan: 'text-[#2FD6FF]',
  green: 'text-[#35D98B]',
  amber: 'text-[#F2BF4A]',
  muted: 'text-[#AAB5C7]',
};

export function SummaryRows({ rows }: { rows: { label: string; value: string; tone?: RowTone }[] }) {
  return (
    <dl className="mt-2 space-y-0">
      {rows.map((r) => (
        <div key={r.label} className="flex items-baseline justify-between gap-3 py-2">
          <dt className="text-[14px] text-[#78859A]">{r.label}</dt>
          <dd className={cn('text-right text-[14px] font-semibold', ROW_TONE[r.tone ?? 'white'])}>{r.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function TechnicalWarning({ title, body, action }: { title: string; body: string; action?: React.ReactNode }) {
  return (
    <div role="note" className="flex items-center justify-between gap-3 rounded-[14px] border border-[rgba(242,191,74,0.3)] bg-[rgba(242,191,74,0.07)] p-4">
      <div className="flex gap-3">
        <span aria-hidden="true" className="mt-0.5 text-[18px] leading-none text-[#F2BF4A]">⚠</span>
        <div>
          <div className="text-[13px] text-[#78859A]">{title}</div>
          <div className="mt-0.5 text-[14px] font-bold text-white">{body}</div>
        </div>
      </div>
      {action}
    </div>
  );
}

export function DividerArrow() {
  return (
    <div aria-hidden="true" className="relative z-10 mx-auto -my-3 grid h-10 w-10 place-items-center rounded-[10px] border border-[#2A394D] bg-[#111722] text-[#2FD6FF] shadow-[0_8px_20px_rgba(0,0,0,0.45)]">
      <ArrowDown size={16} />
    </div>
  );
}

export function StatusPill({ tone, children }: { tone: 'amber' | 'green' | 'cyan'; children: React.ReactNode }) {
  const cls =
    tone === 'amber'
      ? 'border-[rgba(242,191,74,0.4)] bg-[rgba(242,191,74,0.1)] text-[#F2BF4A]'
      : tone === 'green'
        ? 'border-[rgba(53,217,139,0.4)] bg-[rgba(53,217,139,0.1)] text-[#35D98B]'
        : 'border-[rgba(47,214,255,0.4)] bg-[rgba(47,214,255,0.1)] text-[#2FD6FF]';
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-[12px] font-bold', cls)}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      {children}
    </span>
  );
}

export function CopyButton({ text, label, primary = false }: { text: string; label: string; primary?: boolean }) {
  const t = useT();
  const [done, setDone] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      /* clipboard unavailable */
    }
    setDone(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setDone(false), 2000);
  };
  return (
    <button
      type="button"
      onClick={copy}
      aria-live="polite"
      className={cn(
        'flex min-h-[56px] w-full items-center justify-center gap-2 rounded-[14px] text-[15px] font-bold transition active:scale-[0.99]',
        primary
          ? 'bg-[#2FD6FF] text-[#06121A] shadow-[0_0_28px_rgba(47,214,255,0.25)] hover:brightness-110'
          : 'border border-[#2A394D] bg-[#111722] text-white hover:border-[rgba(47,214,255,0.5)]'
      )}
    >
      {done ? <Check size={17} aria-hidden="true" /> : <Copy size={17} aria-hidden="true" />}
      {done ? t.common.copied : label}
    </button>
  );
}

export function BottomSheet({ open, onClose, title, icon, children, labelledBy, overlayClassName = '', overlayTop }: {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  icon?: React.ReactNode;
  children: React.ReactNode;
  labelledBy?: string;
  overlayClassName?: string;
  overlayTop?: number;
}) {
  const t = useT();
  const closeRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (!open) return;
    openerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const t = setTimeout(() => closeRef.current?.focus(), 80);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
      clearTimeout(t);
      // Restore focus to the control that opened the sheet.
      if (openerRef.current && document.contains(openerRef.current)) openerRef.current.focus();
    };
  }, [open, onClose]);
  if (!open) return null;
  // Portaled above the entire app shell: page roots carry a persistent
  // transform (entrance animation fill), which otherwise traps this fixed
  // layer in a nested stacking context beneath the bottom nav.
  return (
    <ClientPortal>
      <div data-sheet-root="" className="pointer-events-none fixed inset-0 z-[70]" role="presentation">
      <div
        className={cn('ax-sheet-overlay pointer-events-auto absolute inset-0 bg-black/70', overlayClassName)}
        style={overlayTop !== undefined ? { top: overlayTop } : undefined}
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="pointer-events-none absolute inset-0 flex flex-col justify-end p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:items-center sm:justify-center sm:p-6">
        <div
          role="dialog"
          aria-modal="true"
          aria-label={labelledBy}
          className="ax-sheet pointer-events-auto mx-auto flex w-full min-h-0 max-w-[520px] flex-col overflow-hidden rounded-[24px] border border-[#2A394D] bg-[#0C1119]"
        >
          <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[#202A3A] px-5 py-4">
            <div className="flex min-w-0 items-center gap-3">
              {icon}
              <div className="truncate text-[16px] font-bold text-white">{title}</div>
            </div>
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label={t.tabs.closeDlg}
              className="grid h-11 w-11 shrink-0 place-items-center rounded-[12px] border border-[#2A394D] text-[#AAB5C7] transition hover:border-[rgba(47,214,255,0.5)] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2FD6FF]"
            >
              <X size={20} />
            </button>
          </div>
          <div
            data-sheet-body
            className="thin-scroll min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-5 pb-[calc(24px+env(safe-area-inset-bottom))] pt-5"
            style={{ overscrollBehaviorY: 'contain', touchAction: 'pan-y', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
          >
            {children}
          </div>
        </div>
      </div>
      </div>
    </ClientPortal>
  );
}
