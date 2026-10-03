// Layer A/B/D: circuit network, perspective floor grid, floating nodes,
// tech particles (one SVG). Thin cyan geometry at low opacity; a few
// dashed "live" lines reuse the existing flow-line motion. Node count
// stays low — no DOM bloat.

const NODES: [number, number, number, number][] = [
  [28, 60, 2.2, 0.5], [66, 30, 1.6, 0.4], [112, 52, 2, 0.45], [160, 22, 1.5, 0.35],
  [210, 44, 2.2, 0.5], [258, 26, 1.6, 0.4], [306, 58, 2, 0.45], [348, 34, 1.5, 0.35],
  [384, 66, 2.2, 0.5], [40, 150, 1.8, 0.4], [90, 200, 2.4, 0.5], [330, 170, 2, 0.45],
  [372, 230, 1.6, 0.35], [30, 300, 2, 0.4], [70, 380, 1.7, 0.35], [340, 360, 2.1, 0.45],
  [376, 420, 1.6, 0.35], [120, 470, 2, 0.4], [280, 480, 1.8, 0.4], [200, 520, 2.2, 0.45],
  [52, 470, 1.5, 0.3], [352, 500, 1.5, 0.3],
];

const LINES: [number, number, number, number][] = [
  [28, 60, 66, 30], [66, 30, 112, 52], [112, 52, 160, 22], [160, 22, 210, 44],
  [210, 44, 258, 26], [258, 26, 306, 58], [306, 58, 348, 34], [348, 34, 384, 66],
  [28, 60, 40, 150], [40, 150, 90, 200], [90, 200, 70, 380],
  [384, 66, 372, 230], [372, 230, 340, 360], [340, 360, 376, 420],
  [30, 300, 70, 380], [70, 380, 120, 470], [120, 470, 200, 520], [200, 520, 280, 480],
  [280, 480, 352, 500], [330, 170, 340, 360],
];

const MOTES: [number, number, number][] = [
  [120, 300, 0], [180, 380, -1.8], [240, 260, -3.1], [150, 180, -4.4],
  [270, 420, -2.3], [100, 430, -5.6], [300, 300, -0.9], [210, 120, -6.2],
];

// Converging floor rails (perspective): from a vanishing band near the
// robot's base spreading toward the viewer. Horizontal floor rings give
// the receding-grid feel of the reference.
const FLOOR_RAILS: [number, number][] = [
  [200, 400], [150, 400], [250, 400], [110, 400], [290, 400],
  [70, 400], [330, 400], [30, 400], [370, 400],
];
const FLOOR_SPREAD = 150;

export function RobotEnvironment() {
  return (
    <svg
      viewBox="0 0 400 560"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      className="absolute inset-0 h-full w-full"
    >
      <g stroke="#22D3EE" strokeOpacity="0.13" strokeWidth="1">
        {LINES.map(([x1, y1, x2, y2], i) => (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} className={i % 7 === 0 ? 'flow-line' : undefined} strokeOpacity={i % 7 === 0 ? 0.3 : undefined} />
        ))}
      </g>
      <g fill="#22D3EE">
        {NODES.map(([x, y, r, o], i) => (
          <circle key={i} cx={x} cy={y} r={r} opacity={o} className={i % 8 === 0 ? 'pulse-node' : undefined} />
        ))}
      </g>
      {/* perspective floor */}
      <g stroke="#2FD6FF" strokeWidth="1">
        {FLOOR_RAILS.map(([x, y], i) => (
          <line
            key={i}
            x1={x}
            y1={y}
            x2={x < 200 ? x - FLOOR_SPREAD : x > 200 ? x + FLOOR_SPREAD : x}
            y2={560}
            strokeOpacity={x === 200 ? 0.22 : 0.13}
          />
        ))}
        {[418, 446, 478, 514, 552].map((y, i) => (
          <line
            key={y}
            x1={200 - (150 + i * 52)}
            y1={y}
            x2={200 + (150 + i * 52)}
            y2={y}
            strokeOpacity={0.14 - i * 0.018}
          />
        ))}
        <line x1={40} y1={400} x2={360} y2={400} strokeOpacity={0.28} className="flow-line" />
      </g>
      <ellipse cx="200" cy="400" rx="120" ry="14" fill="none" stroke="#2FD6FF" strokeOpacity="0.2" strokeWidth="1" />
      <g fill="#67E8F9">
        {MOTES.map(([x, y, d], i) => (
          <circle key={i} cx={x} cy={y} r={1.4} opacity={0} className="robot-particle" style={{ animationDelay: `${d}s` }} />
        ))}
      </g>
    </svg>
  );
}
