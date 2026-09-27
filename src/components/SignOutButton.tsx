'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export function SignOutButton({ className = '' }: { className?: string }) {
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  return (
    <button
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        await createClient().auth.signOut();
        router.replace('/login');
        router.refresh();
      }}
      className={`rounded-lg border border-line px-4 py-2 text-sm text-mist hover:text-white ${className}`}
    >
      {busy ? 'Signing out…' : 'Sign out'}
    </button>
  );
}
