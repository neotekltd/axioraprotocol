// Axiora-original technical background: near-black base, faint blue grid,
// dotted texture, vertical section connector rail with scroll progress.
// All decorative layers are pointer-events-none and aria-hidden.

'use client';

import { useEffect, useRef } from 'react';

export function ProtocolBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="tech-grid absolute inset-0 opacity-90 [mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,black_30%,transparent_100%)]" />
      <div className="tech-dots absolute inset-0 opacity-50" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyanx/40 to-transparent" />
    </div>
  );
}

// Full-page circuit spine at the content boundary. A scroll-linked progress
// line illuminates the traveled portion; static nodes mark section rhythm.
// rAF-throttled, transform-only, hidden on mobile and reduced-motion.
export function PageSpine() {
  const progressRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = progressRef.current;
      if (!el) return;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      el.style.transform = `scaleY(${p})`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
  return (
    <div aria-hidden="true" className="pointer-events-none absolute bottom-0 left-3 top-0 hidden w-px bg-white/[0.05] md:block lg:left-6">
      <div ref={progressRef} className="absolute inset-0 origin-top bg-gradient-to-b from-pulseDim via-pulse to-pulseBright" style={{ transform: 'scaleY(0)' }} />
      {[6, 18, 32, 45, 58, 71, 84, 94].map((top) => (
        <span
          key={top}
          className="absolute h-[5px] w-[5px] -translate-x-1/2 rounded-full bg-cyanx/60 shadow-[0_0_8px_1px_rgba(34,211,238,0.45)]"
          style={{ top: `${top}%` }}
        />
      ))}
    </div>
  );
}

// Vertical rail with traveling signal + node. Place inside a relative section.
export function CircuitRail({ nodes = 3 }: { nodes?: number }) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute bottom-0 left-4 top-0 hidden w-px bg-white/[0.06] md:block lg:left-8">
      <div className="signal-y" style={{ animationDuration: '5s' }} />
      {Array.from({ length: nodes }).map((_, i) => (
        <span
          key={i}
          className="absolute h-[5px] w-[5px] -translate-x-1/2 rounded-full bg-cyanx/70 shadow-[0_0_10px_2px_rgba(34,211,238,0.5)]"
          style={{ top: `${12 + (i * 76) / Math.max(1, nodes - 1)}%` }}
        />
      ))}
    </div>
  );
}

// Numbered technical eyebrow: "02 / MODULES".
export function TechEyebrow({ index, label }: { index: string; label: string }) {
  return (
    <div className="flex items-center gap-3 font-mono text-[11px] font-semibold tracking-[0.24em] text-pulse">
      <span className="inline-block h-px w-6 bg-pulse/60" aria-hidden="true" />
      {index} / {label}
    </div>
  );
}
