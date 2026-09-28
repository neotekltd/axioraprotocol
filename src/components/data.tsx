// Server-side shared UI primitives for the authenticated app.
// Visual system: near-black panels, subtle borders, neon-green accent,
// compact data presentation. No emojis, no decoration.

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
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {sub && <p className="mt-1 text-sm text-fog">{sub}</p>}
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
  const color = accent === 'up' ? 'text-pulse' : accent === 'down' ? 'text-danger' : 'text-white';
  return (
    <div className="glass rounded-2xl p-5">
      <div className="text-[11px] font-semibold tracking-[0.2em] text-fog">{label}</div>
      <div className={`mt-2 font-mono text-2xl font-bold tracking-tight ${color}`}>{value}</div>
      {sub && <div className="mt-1 text-xs text-fog">{sub}</div>}
    </div>
  );
}

const BADGE_STYLES: Record<string, string> = {
  active: 'border-pulse/40 bg-pulse/10 text-pulse',
  completed: 'border-pulse/40 bg-pulse/10 text-pulse',
  credited: 'border-pulse/40 bg-pulse/10 text-pulse',
  available: 'border-pulse/40 bg-pulse/10 text-pulse',
  verified: 'border-pulse/40 bg-pulse/10 text-pulse',
  closed: 'border-line bg-surface text-mist',
  matured: 'border-line bg-surface text-mist',
  paid: 'border-line bg-surface text-mist',
  pending: 'border-amberx/40 bg-amberx/10 text-amberx',
  processing: 'border-amberx/40 bg-amberx/10 text-amberx',
  open: 'border-amberx/40 bg-amberx/10 text-amberx',
  failed: 'border-danger/40 bg-danger/10 text-danger',
  cancelled: 'border-danger/40 bg-danger/10 text-danger',
};

export function StatusBadge({ status }: { status: string }) {
  const key = status.toLowerCase();
  const style = BADGE_STYLES[key] ?? 'border-line bg-surface text-mist';
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
    <div className="glass rounded-2xl p-8 text-center sm:p-12">
      <div className="mx-auto h-10 w-10 rounded-xl border border-line bg-surface" aria-hidden="true" />
      <div className="mt-4 font-bold">{title}</div>
      <p className="mx-auto mt-1 max-w-sm text-sm text-fog">{body}</p>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="mt-5 inline-block rounded-xl bg-pulse px-6 py-2.5 text-sm font-bold text-black hover:brightness-110"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}

export function SectionCard({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
  return (
    <section className="glass mt-6 overflow-hidden rounded-2xl">
      <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
        <h2 className="text-sm font-bold tracking-wide">{title}</h2>
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
    <div role="alert" className="glass rounded-2xl border-danger/30 p-6 text-center">
      <div className="font-bold text-danger">Something went wrong</div>
      <p className="mt-1 text-sm text-fog">{message}</p>
    </div>
  );
}
