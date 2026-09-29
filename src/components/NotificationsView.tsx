'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { markNotificationRead, markAllNotificationsRead } from '@/lib/actions';
import type { Notification } from '@/lib/queries';

const TYPE_DOT: Record<string, string> = {
  deposit: 'bg-[#2FD6FF]', withdrawal: 'bg-[#F2BF4A]', deployment: 'bg-[#2FD6FF]',
  profit: 'bg-[#35D98B]', referral: 'bg-[#2FD6FF]', security: 'bg-[#F06B78]', system: 'bg-[#78859A]',
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
      <div className="mt-6 rounded-[20px] border border-[#202A3A] bg-[#0D111A] p-8 text-center sm:p-10">
        <div className="font-bold text-white">You are all caught up</div>
        <p className="mx-auto mt-1 max-w-sm text-[14px] text-[#AAB5C7]">Deposit, withdrawal, deployment, profit, referral and security events will appear here.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mt-6 flex items-center justify-between">
        <span className="rounded-full bg-[rgba(47,214,255,0.12)] px-2.5 py-1 font-mono text-[11px] text-[#2FD6FF]" aria-live="polite">{count} unread</span>
        {count > 0 && (
          <button onClick={readAll} className="rounded-[12px] border border-[#2A394D] px-4 py-2 text-[13px] text-white hover:border-[rgba(47,214,255,0.5)]">Mark all read</button>
        )}
      </div>
      <ul className="mt-4 space-y-3">
        {items.map((n) => (
          <li key={n.id}>
            <button
              onClick={() => readOne(n.id)}
              className={`flex w-full items-center justify-between gap-3 rounded-[20px] border border-[#202A3A] bg-[#0D111A] p-5 text-left transition hover:border-[rgba(47,214,255,0.4)] ${n.read ? 'opacity-70' : ''}`}
            >
              <span className="flex min-w-0 items-start gap-3">
                <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${TYPE_DOT[n.type] ?? 'bg-[#78859A]'}`} aria-hidden="true" />
                <span className="min-w-0">
                  <span className="block truncate text-[14px] font-semibold text-white">{n.title}</span>
                  {n.body && <span className="block truncate text-[13px] text-[#78859A]">{n.body}</span>}
                </span>
              </span>
              <span className="shrink-0 font-mono text-[12px] text-[#78859A]">{n.createdAt.slice(0, 10)}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
