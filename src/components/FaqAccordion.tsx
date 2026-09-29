'use client';

import { useState } from 'react';

export interface FaqItem {
  q: string;
  a: string;
}

export function FaqAccordion({ items, numbered = false }: { items: FaqItem[]; numbered?: boolean }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="glass divide-y divide-line overflow-hidden rounded-2xl">
      {items.map((f, i) => {
        const isOpen = open === i;
        return (
          <div key={f.q} className={isOpen ? 'bg-pulse/[0.04]' : undefined}>
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              aria-controls={`faq-panel-${i}`}
              id={`faq-button-${i}`}
              className="flex w-full items-center gap-3 px-5 py-4 text-left text-sm font-semibold transition hover:text-pulse"
            >
              {numbered && (
                <span className={`font-mono text-[11px] tracking-[0.15em] ${isOpen ? 'text-pulse' : 'text-fog'}`} aria-hidden="true">
                  Q{String(i + 1).padStart(2, '0')}
                </span>
              )}
              <span className="flex-1">{f.q}</span>
              <svg
                width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"
                className={`shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-pulse' : 'text-fog'}`}
              >
                <path d="M3 5l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {isOpen && (
              <p id={`faq-panel-${i}`} role="region" aria-labelledby={`faq-button-${i}`} className="px-5 pb-4 pl-5 text-sm leading-relaxed text-fog">
                {numbered && <span className="mr-2 inline-block h-3 w-px bg-pulse/70 align-middle" aria-hidden="true" />}
                {f.a}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
