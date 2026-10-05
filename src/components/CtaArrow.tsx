// Directional arrow for primary CTAs (decorative icon, never mirrored —
// both locales are LTR). Import-safe: no hooks, no server modules, usable
// from both server and client components.
export function CtaArrow() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-4 w-4">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}
