'use client';

// Original Axiora network visualization: central consensus node, satellite
// agent nodes, intermittent link illumination and outward signals.
// Pure SVG + CSS, GPU-cheap, no canvas.

const SATELLITES = [
  { x: 200, y: 44 }, { x: 296, y: 80 }, { x: 330, y: 170 }, { x: 296, y: 260 },
  { x: 200, y: 296 }, { x: 104, y: 260 }, { x: 70, y: 170 }, { x: 104, y: 80 },
];

export function NetworkViz({ highlight = null }: { highlight?: number | null }) {
  return (
    <svg viewBox="0 0 400 340" className="w-full" role="img" aria-label="Axiora referral network diagram">
      <defs>
        <radialGradient id="axn-core" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#22D3EE" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="200" cy="170" r="86" fill="url(#axn-core)" />
      {SATELLITES.map((s, i) => {
        const lvl = (i % 5) + 1;
        const lit = highlight === null || highlight === lvl;
        return (
        <g key={i} opacity={lit ? 1 : 0.3} style={{ transition: 'opacity 0.25s ease' }}>
          <line
            x1="200" y1="170" x2={s.x} y2={s.y}
            stroke="#22D3EE" strokeOpacity={highlight === lvl ? 0.7 : 0.28} strokeWidth={highlight === lvl ? 1.5 : 1}
            className={i % 2 === 0 ? 'flow-line' : undefined}
            style={{ animationDuration: '2.6s', animationDelay: `${i * 0.3}s` }}
          />
          <circle cx={s.x} cy={s.y} r="10" fill="rgba(34,211,238,0.08)" stroke="#22D3EE" strokeOpacity={highlight === lvl ? 1 : 0.6} />
          <circle cx={s.x} cy={s.y} r="3" fill="#22D3EE" className="pulse-node" style={{ animationDelay: `${i * 0.4}s` }} />
          <text x={s.x} y={s.y - 15} textAnchor="middle" fill={highlight === lvl ? '#22D3EE' : '#475569'} fontSize="8" fontFamily="monospace">L{lvl}</text>
        </g>
        );
      })}
      <circle cx="200" cy="170" r="26" fill="rgba(34,211,238,0.1)" stroke="#22D3EE" strokeWidth="1.5" />
      <circle cx="200" cy="170" r="9" fill="#22D3EE" className="ping-soft" />
      <circle cx="200" cy="170" r="3.5" fill="#04121a" />
    </svg>
  );
}

// Compact system visual for the specifications section: concentric consensus
// rings with orbiting agent markers. Original Axiora artwork.
export function SystemViz() {
  return (
    <svg viewBox="0 0 400 300" className="w-full" role="img" aria-label="Axiora consensus system diagram">
      {[130, 96, 62].map((r, i) => (
        <ellipse
          key={r} cx="200" cy="150" rx={r} ry={r * 0.62}
          fill="none" stroke="#22D3EE" strokeOpacity={0.35 - i * 0.08}
          strokeDasharray={i === 1 ? '5 5' : undefined}
          className={i === 1 ? 'flow-line' : undefined}
          style={i === 1 ? { animationDuration: '3s' } : undefined}
        />
      ))}
      {[
        { x: 200, y: 69 }, { x: 296, y: 150 }, { x: 200, y: 231 }, { x: 104, y: 150 },
      ].map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="11" fill="rgba(34,211,238,0.07)" stroke="#22D3EE" strokeOpacity="0.55" />
          <circle cx={p.x} cy={p.y} r="3" fill="#22D3EE" className="pulse-node" style={{ animationDelay: `${i * 0.5}s` }} />
        </g>
      ))}
      <rect x="178" y="128" width="44" height="44" rx="10" fill="rgba(34,211,238,0.1)" stroke="#22D3EE" />
      <circle cx="200" cy="150" r="7" fill="#22D3EE" className="ping-soft" />
    </svg>
  );
}
