'use client';
import { useEffect, useRef, useState } from 'react';

export function DemoBadge({ label = 'DEMO DATA' }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-amberx/30 bg-amberx/10 px-2.5 py-1 text-[10px] font-semibold tracking-widest text-amberx">
      <span className="h-1.5 w-1.5 rounded-full bg-amberx animate-pulse" />
      {label}
    </span>
  );
}

export function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return <div className="text-[11px] font-semibold tracking-[0.28em] text-pulse">{children}</div>;
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="mt-3 text-3xl sm:text-5xl font-bold tracking-tight leading-[1.05]">{children}</h2>;
}

export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`glass rounded-2xl shadow-card ${className}`}>{children}</div>;
}

export function useCountUp(target: number, active: boolean, duration = 1400) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) return;
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(target * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, active, duration]);
  return val;
}

export function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="text-[11px] tracking-[0.2em] text-fog">{label}</div>
      <div className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight">{value}</div>
      {sub && <div className="mt-1 text-xs text-fog">{sub}</div>}
    </div>
  );
}

export function CopyButton({ text, label = 'Copy' }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      aria-live="polite"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
        } catch {
          const ta = document.createElement('textarea');
          ta.value = text;
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          ta.remove();
        }
        setDone(true);
        setTimeout(() => setDone(false), 1600);
      }}
      className="rounded-xl border border-line px-4 py-2 text-xs text-mist hover:border-pulse/50 hover:text-white"
    >
      {done ? 'Copied' : label}
    </button>
  );
}

export function Tabs<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div role="tablist" aria-label="View" className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o}
          role="tab"
          aria-selected={value === o}
          onClick={() => onChange(o)}
          className={`rounded-full border px-4 py-1.5 text-xs font-semibold ${
            value === o ? 'border-pulse/60 bg-pulse/10 text-pulse' : 'border-line text-fog hover:text-white'
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

export function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    ref.current?.querySelector<HTMLElement>('button, input, [tabindex]')?.focus();
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 sm:items-center"
      onClick={onClose}
      role="presentation"
    >
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className="glass w-full max-w-md rounded-2xl bg-void p-6"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-bold">{title}</h2>
          <button onClick={onClose} aria-label="Close dialog" className="rounded-lg px-2 py-1 text-fog hover:text-white">
            ✕
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}
