'use client';

// Original Axiora robot illustration (SVG, no external assets).
// Hovering service unit: graphite shell, cyan visor eyes, chest readout
// with the REAL local server clock plus the configured payout cycle,
// pulsing chest core, scanning projector at the base. Motion comes from
// globals.css robot-* classes (transform/opacity only, reduced-motion
// aware). No invented balances or prices anywhere in this artwork.
import { useEffect, useState } from 'react';

function useClockLabel(): string {
  const [label, setLabel] = useState('--:--:--');
  useEffect(() => {
    const pad = (n: number) => String(n).padStart(2, '0');
    const tick = () => {
      const now = new Date();
      setLabel(`${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return label;
}

export function RobotIllustration({ cycleHours }: { cycleHours: number }) {
  const clock = useClockLabel();
  return (
    <svg
      viewBox="0 0 320 400"
      role="img"
      aria-label="Axiora service unit"
      className="mx-auto h-auto w-full"
    >
      <defs>
        <linearGradient id="ax-shell" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2B3850" />
          <stop offset="0.45" stopColor="#1C2536" />
          <stop offset="1" stopColor="#121927" />
        </linearGradient>
        <linearGradient id="ax-shell-edge" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.14" />
          <stop offset="0.18" stopColor="#FFFFFF" stopOpacity="0.02" />
          <stop offset="0.82" stopColor="#000000" stopOpacity="0.12" />
          <stop offset="1" stopColor="#000000" stopOpacity="0.3" />
        </linearGradient>
        <linearGradient id="ax-visor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0D1626" />
          <stop offset="1" stopColor="#04070D" />
        </linearGradient>
        <radialGradient id="ax-core" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#D9FAFF" />
          <stop offset="0.4" stopColor="#2FD6FF" />
          <stop offset="1" stopColor="#0E7FA0" />
        </radialGradient>
        <radialGradient id="ax-eye" cx="0.5" cy="0.42" r="0.62">
          <stop offset="0" stopColor="#D9FAFF" />
          <stop offset="0.55" stopColor="#2FD6FF" />
          <stop offset="1" stopColor="#0B6E8C" />
        </radialGradient>
        <filter id="ax-glow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="3.2" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="ax-soft" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="6" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* soft halo behind the unit */}
      <ellipse cx="160" cy="200" rx="118" ry="150" fill="#2FD6FF" opacity="0.05" filter="url(#ax-soft)" />

      {/* antenna */}
      <line x1="160" y1="20" x2="160" y2="36" stroke="#2A394D" strokeWidth="4" strokeLinecap="round" />
      <circle cx="160" cy="14" r="5" fill="#2FD6FF" filter="url(#ax-glow)" className="robot-glow-dot" />

      {/* head */}
      <g className="robot-head">
        <rect x="100" y="36" width="120" height="88" rx="30" fill="url(#ax-shell)" stroke="#2A394D" strokeWidth="1.5" />
        <rect x="100" y="36" width="120" height="88" rx="30" fill="url(#ax-shell-edge)" />
        <rect x="100" y="36" width="120" height="88" rx="30" fill="none" stroke="#2FD6FF" strokeOpacity="0.18" strokeWidth="1" />
        {/* crown sheen + brow seam */}
        <path d="M116 46 Q160 36 204 46" fill="none" stroke="#FFFFFF" strokeOpacity="0.12" strokeWidth="2" strokeLinecap="round" />
        <line x1="112" y1="104" x2="208" y2="104" stroke="#0A0F18" strokeWidth="1" strokeOpacity="0.8" />
        {/* visor */}
        <rect x="116" y="58" width="88" height="42" rx="21" fill="url(#ax-visor)" stroke="#2FD6FF" strokeOpacity="0.45" strokeWidth="1" />
        <rect x="122" y="62" width="40" height="8" rx="4" fill="#FFFFFF" opacity="0.07" />
        {/* eye halos */}
        <ellipse cx="140.5" cy="80" rx="17" ry="19" fill="#2FD6FF" opacity="0.16" filter="url(#ax-soft)" className="robot-eye-halo" />
        <ellipse cx="179.5" cy="80" rx="17" ry="19" fill="#2FD6FF" opacity="0.16" filter="url(#ax-soft)" className="robot-eye-halo" style={{ animationDelay: '-2.1s' }} />
        {/* eyes */}
        <g className="robot-eye">
          <rect x="130" y="68" width="21" height="24" rx="10.5" fill="url(#ax-eye)" filter="url(#ax-glow)" />
          <circle cx="140.5" cy="76" r="3" fill="#FFFFFF" opacity="0.85" />
        </g>
        <g className="robot-eye" style={{ animationDelay: '-2.1s' }}>
          <rect x="169" y="68" width="21" height="24" rx="10.5" fill="url(#ax-eye)" filter="url(#ax-glow)" />
          <circle cx="179.5" cy="76" r="3" fill="#FFFFFF" opacity="0.85" />
        </g>
        {/* lower vent slits */}
        <g fill="#0A0F18" stroke="#2A394D" strokeWidth="1">
          <rect x="136" y="108" width="8" height="5" rx="2.5" />
          <rect x="148" y="108" width="8" height="5" rx="2.5" />
          <rect x="160" y="108" width="8" height="5" rx="2.5" />
          <rect x="172" y="108" width="8" height="5" rx="2.5" />
          <rect x="184" y="108" width="8" height="5" rx="2.5" />
        </g>
        {/* ear pods */}
        <circle cx="93" cy="80" r="11" fill="url(#ax-shell)" stroke="#2A394D" strokeWidth="1.5" />
        <circle cx="93" cy="80" r="3.5" fill="#2FD6FF" className="robot-glow-dot" style={{ animationDelay: '-1.2s' }} />
        <circle cx="227" cy="80" r="11" fill="url(#ax-shell)" stroke="#2A394D" strokeWidth="1.5" />
        <circle cx="227" cy="80" r="3.5" fill="#2FD6FF" className="robot-glow-dot" style={{ animationDelay: '-2.4s' }} />
      </g>

      {/* neck */}
      <rect x="147" y="124" width="26" height="14" rx="4" fill="#0D1420" stroke="#2A394D" strokeWidth="1" />
      <line x1="150" y1="131" x2="170" y2="131" stroke="#2A394D" strokeWidth="1" strokeOpacity="0.7" />

      {/* torso */}
      <g>
        {/* shoulders */}
        <circle cx="84" cy="182" r="18" fill="url(#ax-shell)" stroke="#2A394D" strokeWidth="1.5" />
        <circle cx="84" cy="182" r="10" fill="none" stroke="#2FD6FF" strokeOpacity="0.3" strokeWidth="1" strokeDasharray="3 3" />
        <circle cx="84" cy="182" r="4" fill="#2FD6FF" className="robot-glow-dot" />
        <circle cx="236" cy="182" r="18" fill="url(#ax-shell)" stroke="#2A394D" strokeWidth="1.5" />
        <circle cx="236" cy="182" r="10" fill="none" stroke="#2FD6FF" strokeOpacity="0.3" strokeWidth="1" strokeDasharray="3 3" />
        <circle cx="236" cy="182" r="4" fill="#2FD6FF" className="robot-glow-dot" style={{ animationDelay: '-1.6s' }} />
        {/* arms */}
        <rect x="60" y="196" width="21" height="78" rx="10.5" fill="url(#ax-shell)" stroke="#2A394D" strokeWidth="1.5" />
        <circle cx="70.5" cy="230" r="4" fill="#0B111C" stroke="#2A394D" strokeWidth="1" />
        <circle cx="70" cy="284" r="12" fill="url(#ax-shell)" stroke="#2A394D" strokeWidth="1.5" />
        <g transform="rotate(-16 246 226)">
          <rect x="236" y="196" width="21" height="66" rx="10.5" fill="url(#ax-shell)" stroke="#2A394D" strokeWidth="1.5" />
          <circle cx="246.5" cy="272" r="12" fill="url(#ax-shell)" stroke="#2A394D" strokeWidth="1.5" />
        </g>
        {/* chest */}
        <rect x="86" y="156" width="148" height="152" rx="34" fill="url(#ax-shell)" stroke="#2A394D" strokeWidth="1.5" />
        <rect x="86" y="156" width="148" height="152" rx="34" fill="url(#ax-shell-edge)" />
        <rect x="86" y="156" width="148" height="152" rx="34" fill="none" stroke="#2FD6FF" strokeOpacity="0.14" strokeWidth="1" />
        {/* chest panel seams */}
        <line x1="98" y1="170" x2="98" y2="294" stroke="#0A0F18" strokeWidth="1" strokeOpacity="0.7" />
        <line x1="222" y1="170" x2="222" y2="294" stroke="#0A0F18" strokeWidth="1" strokeOpacity="0.7" />
        {/* server-clock readout */}
        <rect x="104" y="172" width="112" height="58" rx="10" fill="#060B14" stroke="#223048" strokeWidth="1" />
        <rect x="104" y="172" width="112" height="58" rx="10" fill="none" stroke="#2FD6FF" strokeOpacity="0.22" strokeWidth="1" />
        <text x="160" y="186" textAnchor="middle" fontSize="7.5" letterSpacing="2" fill="#78859A" fontFamily="monospace">SERVER CLOCK</text>
        <text x="160" y="206" textAnchor="middle" fontSize="16" letterSpacing="1" fill="#E9EEF5" fontFamily="monospace" suppressHydrationWarning>
          {clock}
        </text>
        <text x="160" y="221" textAnchor="middle" fontSize="7.5" letterSpacing="1.4" fill="#2FD6FF" fontFamily="monospace">
          CYCLE EVERY {cycleHours} HOURS
        </text>
        <circle cx="208" cy="183" r="2.5" fill="#35D98B" className="robot-glow-dot" />
        {/* side vents */}
        <g stroke="#2A394D" strokeWidth="2" strokeLinecap="round">
          <line x1="100" y1="252" x2="116" y2="252" />
          <line x1="100" y1="260" x2="116" y2="260" />
          <line x1="100" y1="268" x2="116" y2="268" />
          <line x1="204" y1="252" x2="220" y2="252" />
          <line x1="204" y1="260" x2="220" y2="260" />
          <line x1="204" y1="268" x2="220" y2="268" />
        </g>
        {/* chest core */}
        <circle cx="160" cy="272" r="24" fill="none" stroke="#2FD6FF" strokeOpacity="0.25" strokeWidth="1" strokeDasharray="4 4" className="orbit-rotor orbit-spin-c" />
        <circle cx="160" cy="272" r="15" fill="url(#ax-core)" filter="url(#ax-glow)" className="robot-core" />
        <circle cx="160" cy="272" r="4" fill="#EAFDFF" opacity="0.9" />
        {/* waist */}
        <rect x="132" y="308" width="56" height="16" rx="6" fill="#0D1420" stroke="#2A394D" strokeWidth="1" />
        {/* projector */}
        <polygon points="140,324 180,324 192,350 128,350" fill="#0D1420" stroke="#2A394D" strokeWidth="1" />
        <ellipse cx="160" cy="352" rx="26" ry="6" fill="#2FD6FF" filter="url(#ax-glow)" className="robot-projector" />
      </g>
    </svg>
  );
}
