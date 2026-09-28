'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { markNotificationRead, markAllNotificationsRead } from '@/lib/actions';
import type { Notification } from '@/lib/queries';

const TYPE_DOT: Record<string, string> = {
  deposit: 'bg-pulse', withdrawal: 'bg-amberx', deployment: 'bg-pulse',
  profit: 'bg-pulse', referral: 'bg-cyanx', security: 'bg-danger', system: 'bg-fog',
};

export function NotificationsView({ initial, unread }: { initial: Notification[]; unread: number }) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [count, setCount] = useState(unread);

  const readOne = async (id: string) => {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    const wasUnread = items.find((n) => n.id === id && !n.read);
    if (wasUnread) setCount((c) => Math.max(0, c - 1));
    await markNotificationRead(id);
    router.refresh();
  };

  const readAll = async () => {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    setCount(0);
    await markAllNotificationsRead();
    router.refresh();
  };

  if (items.length === 0) {
    return (
      <div className="glass mt-6 rounded-2xl p-8 text-center sm:p-12">
        <div className="font-bold">You are all caught up</div>
        <p className="mx-auto mt-1 max-w-sm text-sm text-fog">Deposit, withdrawal, deployment, profit, referral and security events will appear here.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mt-6 flex items-center justify-between">
        <span className="rounded-full bg-pulse/15 px-2.5 py-1 text-[11px] text-pulse" aria-live="polite">{count} unread</span>
        {count > 0 && (
          <button onClick={readAll} className="rounded-lg border border-line px-4 py-1.5 text-xs hover:border-pulse/50">Mark all read</button>
        )}
      </div>
      <ul className="mt-4 space-y-3">
        {items.map((n) => (
          <li key={n.id}>
            <button
              onClick={() => readOne(n.id)}
              className={`glass flex w-full items-center justify-between gap-3 rounded-2xl p-5 text-left hover:border-pulse/30 ${n.read ? 'opacity-70' : ''}`}
            >
              <span className="flex min-w-0 items-start gap-3">
                <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${TYPE_DOT[n.type] ?? 'bg-fog'}`} aria-hidden="true" />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold">{n.title}</span>
                  {n.body && <span className="block truncate text-xs text-fog">{n.body}</span>}
                </span>
              </span>
              <span className="shrink-0 text-xs text-fog">{n.createdAt.slice(0, 10)}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
