'use client';
import { useEffect, useState } from 'react';

const NODES = ['SIGNAL', 'RISK', 'EXECUTION', 'SENTIMENT', 'CONSENSUS', 'TRADE'];

export function HeroViz() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setStep((s) => (s + 1) % (NODES.length + 1)), 900);
    return () => clearInterval(id);
  }, []);
  const active = (i: number) => step > i;
  return (
    <div className="glass rounded-3xl p-6 sm:p-8 relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-70" />
      <div className="relative">
        <div className="flex items-center justify-between">
          <span className="text-[11px] tracking-[0.25em] text-fog">CONVERGENCE ENGINE</span>
          <span className="flex items-center gap-2 text-[11px] text-pulse"><span className="h-2 w-2 rounded-full bg-pulse animate-pulse" />LIVE SIM</span>
        </div>
        <div className="mt-6 flex flex-col items-center gap-2">
          <Node label="SIGNAL" on={active(0)} />
          <Wire on={active(0)} />
          <div className="flex items-center gap-2 sm:gap-3">
            <Node label="RISK" small on={active(1)} />
            <Node label="CONSENSUS" core on={active(4)} extra={step >= 5 ? 'ALL AGENTS AGREE' : undefined} />
            <Node label="SENTIMENT" small on={active(3)} />
          </div>
          <Wire on={active(4)} />
          <Node label="EXECUTION" on={active(2)} />
          <Wire on={active(4)} />
          <Node label="TRADE" trade on={active(5)} extra={step >= 6 ? 'EXECUTED ✓' : undefined} />
        </div>
        <div className="mt-6 grid grid-cols-3 gap-2 text-center">
          {[['$10', 'Minimum'], ['0%', 'Withdrawal fee'], ['DAILY', 'Settlement']].map(([v, l]) => (
            <div key={l} className="rounded-xl border border-line bg-void/60 px-2 py-3">
              <div className="text-sm font-bold text-pulse">{v}</div>
              <div className="text-[10px] tracking-widest text-fog">{l.toUpperCase()}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Node({ label, on, small, core, trade, extra }: { label: string; on: boolean; small?: boolean; core?: boolean; trade?: boolean; extra?: string }) {
  return (
    <div className="flex flex-col items-center">
      <div
        className={`pulse-node rounded-xl border px-3 text-[11px] font-bold tracking-widest transition-all duration-500 ${
          small ? 'py-2' : 'py-2.5 px-5'
        } ${on ? (core || trade ? 'border-pulse bg-pulse/15 text-pulse text-glow' : 'border-pulse/60 bg-pulse/10 text-white') : 'border-line bg-void text-fog'}`}
      >
        {label}
      </div>
      {extra && <div className="mt-1 text-[10px] tracking-widest text-pulse">{extra}</div>}
    </div>
  );
}

function Wire({ on }: { on: boolean }) {
  return <div className={`h-5 w-px transition-colors duration-500 ${on ? 'bg-pulse' : 'bg-edge'}`} />;
}
