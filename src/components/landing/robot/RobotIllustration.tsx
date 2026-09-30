// Original Axiora robot illustration (SVG, no external assets).
// Hovering service unit: graphite shell, cyan visor eyes, chest readout
// showing the REAL next-payout countdown, pulsing chest core, scanning
// projector at the base. Motion comes from globals.css robot-* classes
// (transform/opacity only, reduced-motion aware).

export function RobotIllustration({ cycleHours, payoutsPerDay }: { cycleHours: number; payoutsPerDay: number }) {
  return (
    <svg
      viewBox="0 0 320 400"
      role="img"
      aria-label="Axiora service unit"
      className="mx-auto h-auto w-full"
    >
      <defs>
        <linearGradient id="ax-shell" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#26334A" />
          <stop offset="0.55" stopColor="#1A2334" />
          <stop offset="1" stopColor="#121927" />
        </linearGradient>
        <linearGradient id="ax-visor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0B1220" />
          <stop offset="1" stopColor="#04070D" />
        </linearGradient>
        <radialGradient id="ax-core" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#A5F3FC" />
          <stop offset="0.45" stopColor="#2FD6FF" />
          <stop offset="1" stopColor="#0E7FA0" />
        </radialGradient>
        <linearGradient id="ax-beam-core" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2FD6FF" stopOpacity="0.85" />
          <stop offset="1" stopColor="#2FD6FF" stopOpacity="0.05" />
        </linearGradient>
        <filter id="ax-glow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="3.2" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* antenna */}
      <line x1="160" y1="20" x2="160" y2="36" stroke="#2A394D" strokeWidth="4" strokeLinecap="round" />
      <circle cx="160" cy="14" r="5" fill="#2FD6FF" filter="url(#ax-glow)" className="robot-glow-dot" />

      {/* head */}
      <g className="robot-head">
        <rect x="100" y="36" width="120" height="88" rx="30" fill="url(#ax-shell)" stroke="#2A394D" strokeWidth="1.5" />
        <rect x="100" y="36" width="120" height="88" rx="30" fill="none" stroke="#2FD6FF" strokeOpacity="0.18" strokeWidth="1" />
        {/* visor */}
        <rect x="116" y="58" width="88" height="42" rx="21" fill="url(#ax-visor)" stroke="#2FD6FF" strokeOpacity="0.4" strokeWidth="1" />
        {/* eyes */}
        <rect x="130" y="68" width="21" height="24" rx="10.5" fill="#2FD6FF" filter="url(#ax-glow)" className="robot-eye" />
        <rect x="169" y="68" width="21" height="24" rx="10.5" fill="#2FD6FF" filter="url(#ax-glow)" className="robot-eye" style={{ animationDelay: '-2.1s' }} />
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
        <rect x="86" y="156" width="148" height="152" rx="34" fill="none" stroke="#2FD6FF" strokeOpacity="0.14" strokeWidth="1" />
        {/* status readout */}
        <rect x="106" y="174" width="108" height="56" rx="10" fill="#070C15" stroke="#223048" strokeWidth="1" />
        <text x="160" y="190" textAnchor="middle" fontSize="8" letterSpacing="2" fill="#78859A" fontFamily="monospace">CYCLE {cycleHours}H</text>
        <text x="160" y="212" textAnchor="middle" fontSize="15" letterSpacing="1.5" fill="#2FD6FF" fontFamily="monospace">
          {payoutsPerDay} / DAY
        </text>
        <circle cx="206" cy="185" r="2.5" fill="#35D98B" className="robot-glow-dot" />
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
        {/* waist */}
        <rect x="132" y="308" width="56" height="16" rx="6" fill="#0D1420" stroke="#2A394D" strokeWidth="1" />
        {/* projector */}
        <polygon points="140,324 180,324 192,350 128,350" fill="#0D1420" stroke="#2A394D" strokeWidth="1" />
        <ellipse cx="160" cy="352" rx="26" ry="6" fill="#2FD6FF" filter="url(#ax-glow)" className="robot-projector" />
      </g>
    </svg>
  );
}
