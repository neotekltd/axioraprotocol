// Server-side shared UI primitives for the authenticated app.
// Axiora app visual language: deep navy surfaces, thin cyan/blue borders,
// mono technical numbers. (Legacy `glass` styles replaced.)

import Link from 'next/link';
import type { ReactNode } from 'react';

export function PageHeader({
  title,
  sub,
  actions,
}: {
  title: string;
  sub?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-[24px] font-bold tracking-tight text-[#F1F5FA] sm:text-[26px]">{title}</h1>
        {sub && <p className="mt-1 text-[14px] text-[#AAB5C7]">{sub}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: 'up' | 'down' | 'neutral';
}) {
  const color = accent === 'up' ? 'text-[#35D98B]' : accent === 'down' ? 'text-[#F06B78]' : 'text-white';
  return (
    <div className="rounded-[20px] border border-[#202A3A] bg-[#0D111A] p-5">
      <div className="font-mono text-[11px] tracking-[0.18em] text-[#78859A]">{label}</div>
      <div className={`mt-2 font-mono text-2xl font-bold tracking-tight ${color}`}>{value}</div>
      {sub && <div className="mt-1 text-xs text-[#78859A]">{sub}</div>}
    </div>
  );
}

const BADGE_STYLES: Record<string, string> = {
  active: 'border-[rgba(47,214,255,0.4)] bg-[rgba(47,214,255,0.08)] text-[#2FD6FF]',
  completed: 'border-[rgba(53,217,139,0.4)] bg-[rgba(53,217,139,0.08)] text-[#35D98B]',
  credited: 'border-[rgba(53,217,139,0.4)] bg-[rgba(53,217,139,0.08)] text-[#35D98B]',
  available: 'border-[rgba(47,214,255,0.4)] bg-[rgba(47,214,255,0.08)] text-[#2FD6FF]',
  verified: 'border-[rgba(53,217,139,0.4)] bg-[rgba(53,217,139,0.08)] text-[#35D98B]',
  closed: 'border-[#2A394D] bg-[#111722] text-[#AAB5C7]',
  matured: 'border-[#2A394D] bg-[#111722] text-[#AAB5C7]',
  paid: 'border-[#2A394D] bg-[#111722] text-[#AAB5C7]',
  pending: 'border-[rgba(242,191,74,0.4)] bg-[rgba(242,191,74,0.08)] text-[#F2BF4A]',
  processing: 'border-[rgba(242,191,74,0.4)] bg-[rgba(242,191,74,0.08)] text-[#F2BF4A]',
  open: 'border-[rgba(242,191,74,0.4)] bg-[rgba(242,191,74,0.08)] text-[#F2BF4A]',
  failed: 'border-[rgba(240,107,120,0.4)] bg-[rgba(240,107,120,0.08)] text-[#F06B78]',
  cancelled: 'border-[rgba(240,107,120,0.4)] bg-[rgba(240,107,120,0.08)] text-[#F06B78]',
};

export function StatusBadge({ status }: { status: string }) {
  const key = status.toLowerCase();
  const style = BADGE_STYLES[key] ?? 'border-[#2A394D] bg-[#111722] text-[#AAB5C7]';
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide ${style}`}>
      {status}
    </span>
  );
}

export function EmptyState({
  title,
  body,
  actionLabel,
  actionHref,
}: {
  title: string;
  body: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div className="rounded-[20px] border border-[#202A3A] bg-[#0D111A] p-8 text-center sm:p-10">
      <div className="mx-auto h-10 w-10 rounded-[12px] border border-[#2A394D] bg-[#151B27]" aria-hidden="true" />
      <div className="mt-4 font-bold text-white">{title}</div>
      <p className="mx-auto mt-1 max-w-sm text-[14px] text-[#AAB5C7]">{body}</p>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="mt-5 inline-flex min-h-[48px] items-center rounded-[14px] bg-[#2FD6FF] px-6 text-[14px] font-bold text-[#06121A] hover:brightness-110"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}

export function SectionCard({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
  return (
    <section className="mt-6 overflow-hidden rounded-[20px] border border-[#202A3A] bg-[#0D111A]">
      <div className="flex items-center justify-between border-b border-[#202A3A] px-5 py-3.5">
        <h2 className="text-[15px] font-bold tracking-wide text-white">{title}</h2>
        {action}
      </div>
      <div>{children}</div>
    </section>
  );
}

// Horizontal-scroll wrapper so wide tables never break mobile layout.
export function TableWrap({ children }: { children: ReactNode }) {
  return <div className="thin-scroll overflow-x-auto">{children}</div>;
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div role="alert" className="rounded-[20px] border border-[rgba(240,107,120,0.4)] bg-[#0D111A] p-6 text-center">
      <div className="font-bold text-[#F06B78]">Something went wrong</div>
      <p className="mt-1 text-[14px] text-[#AAB5C7]">{message}</p>
    </div>
  );
}
