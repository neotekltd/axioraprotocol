'use client';

// Client-only portal to document.body. Used to escape CSS containing
// blocks (notably backdrop-filter on fixed headers, which reparents
// position:fixed descendants to the header box in Chromium). Rendered
// content must manage its own positioning/z-index/a11y.
import { useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

export function ClientPortal({ children }: { children: ReactNode }) {
  const [host, setHost] = useState<HTMLElement | null>(null);
  useEffect(() => {
    const el = document.createElement('div');
    document.body.appendChild(el);
    setHost(el);
    return () => {
      document.body.removeChild(el);
    };
  }, []);
  if (!host) return null;
  return createPortal(children, host);
}
