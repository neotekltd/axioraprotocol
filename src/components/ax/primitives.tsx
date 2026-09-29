// Axiora application primitives — the single visual language for /app and
// auth screens. Dark technical financial infrastructure: near-black navy,
// thin cyan/blue borders, cyan primary actions, mono technical numbers.

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function AxCard({
  children, className = '', variant = 'default',
}: {
  children: ReactNode; className?: string;
  variant?: 'default' | 'elevated' | 'active' | 'outlined' | 'hero';
}) {
  const styles: Record<string, string> = {
    default: 'border-[#202A3A] bg-[#0D111A]',
    elevated: 'border-[#202A3A] bg-[#111722]',
    active: 'border-[rgba(47,214,255,0.65)] bg-[#0D111A] shadow-[0_0_32px_rgba(47,214,255,0.12)]',
    outlined: 'border-[#2A394D] bg-transparent',
    hero: 'border-[#202A3A] bg-[#0D111A] overflow-hidden relative',
  };
  return (
    <div className={cn('rounded-[20px] border', styles[variant], className)}>
      {children}
    </div>
  );
}

export function IconBox({
  children, tone = 'neutral', size = 64,
}: {
  children: ReactNode; tone?: 'cyan' | 'green' | 'neutral' | 'warning'; size?: number;
}) {
  const tones: Record<string, string> = {
    cyan: 'border-[rgba(47,214,255,0.35)] bg-[rgba(47,214,255,0.08)] text-[#2FD6FF]',
    green: 'border-[rgba(53,217,139,0.35)] bg-[rgba(53,217,139,0.08)] text-[#35D98B]',
    neutral: 'border-[#2A394D] bg-[#151B27] text-[#AAB5C7]',
    warning: 'border-[rgba(242,191,74,0.35)] bg-[rgba(242,191,74,0.08)] text-[#F2BF4A]',
  };
  return (
    <div
      aria-hidden="true"
      className={cn('grid shrink-0 place-items-center rounded-[18px] border', tones[tone])}
      style={{ width: size, height: size }}
    >
      {children}
    </div>
  );
}

export function SectionHeader({ icon, title, action }: { icon?: ReactNode; title: string; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        {icon && <span className="grid h-10 w-10 place-items-center rounded-[12px] border border-[#2A394D] bg-[#151B27] text-[#AAB5C7]">{icon}</span>}
        <h2 className="text-xl font-bold tracking-tight text-[#F1F5FA]">{title}</h2>
      </div>
      {action}
    </div>
  );
}

export function StatusBadge({ tone = 'live', children }: { tone?: 'live' | 'pending' | 'confirmed' | 'processing' | 'completed' | 'failed'; children: ReactNode }) {
  const tones: Record<string, string> = {
    live: 'border-[#2A394D] bg-[#111722] text-[#AAB5C7]',
    pending: 'border-[rgba(242,191,74,0.4)] bg-[rgba(242,191,74,0.08)] text-[#F2BF4A]',
    confirmed: 'border-[rgba(53,217,139,0.4)] bg-[rgba(53,217,139,0.08)] text-[#35D98B]',
    processing: 'border-[rgba(47,214,255,0.4)] bg-[rgba(47,214,255,0.08)] text-[#2FD6FF]',
    completed: 'border-[rgba(53,217,139,0.4)] bg-[rgba(53,217,139,0.08)] text-[#35D98B]',
    failed: 'border-[rgba(240,107,120,0.4)] bg-[rgba(240,107,120,0.08)] text-[#F06B78]',
  };
  const dot: Record<string, string> = {
    live: 'bg-[#35D98B]', pending: 'bg-[#F2BF4A]', confirmed: 'bg-[#35D98B]',
    processing: 'bg-[#2FD6FF]', completed: 'bg-[#35D98B]', failed: 'bg-[#F06B78]',
  };
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold', tones[tone])}>
      <span className={cn('h-1.5 w-1.5 rounded-full', dot[tone], tone === 'live' && 'animate-pulse')} aria-hidden="true" />
      {children}
    </span>
  );
}

// Segmented schedule bar (CSS only): N segments, `filled` of them cyan.
export function SegmentedSchedule({ total = 12, filled = 0 }: { total?: number; filled?: number }) {
  return (
    <div className="flex gap-1" aria-hidden="true">
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={cn(
            'h-2 flex-1 rounded-[3px] border',
            i < filled ? 'border-[rgba(47,214,255,0.7)] bg-[rgba(47,214,255,0.25)]' : 'border-[#202A3A] bg-[#111722]'
          )}
        />
      ))}
    </div>
  );
}

// Reusable dark background: near-black + faint cyan light + technical grid.
export function TechGridBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0"
      style={{
        background:
          'radial-gradient(circle at 20% 12%, rgba(47,214,255,0.07), transparent 32%), radial-gradient(circle at 88% 62%, rgba(47,214,255,0.04), transparent 36%), #080B12',
      }}
    >
      <div
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            'linear-gradient(rgba(148,197,255,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(148,197,255,0.045) 1px, transparent 1px)',
          backgroundSize: '44px 44px',
          maskImage: 'radial-gradient(ellipse 90% 70% at 50% 20%, black 30%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 90% 70% at 50% 20%, black 30%, transparent 100%)',
        }}
      />
    </div>
  );
}
