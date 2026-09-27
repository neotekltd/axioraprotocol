'use client';
import { useEffect, useState } from 'react';

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
