// Layer: floating financial node at the robot's raised right side —
// compact circular outline, dark translucent center, cyan border, generic
// "$" mark (Axiora-original, no brand copying), thin connector reaching
// back toward the scene. Restrained drift + pulse. Always rendered:
// on small screens it shrinks and docks right so the reference
// composition survives without overlapping header or cards.

export function RobotDataNode() {
  return (
    <div aria-hidden="true" className="robot-datanode pointer-events-none absolute right-[3%] top-[24%] z-[4] sm:right-[7%] sm:top-[30%]">
      <svg viewBox="0 0 120 90" className="absolute -left-[74px] top-1/2 h-[64px] w-[84px] -translate-y-1/2 text-[#2FD6FF] sm:-left-[88px] sm:h-[76px] sm:w-[100px]">
        <path
          d="M4 62 L34 62 L44 44 L78 44"
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.45"
          strokeWidth="1"
        />
        <circle cx="4" cy="62" r="2" fill="currentColor" opacity="0.7" className="robot-glow-dot" />
        <circle cx="78" cy="44" r="2" fill="currentColor" opacity="0.7" />
      </svg>
      <div className="node-drift relative h-12 w-12 sm:h-16 sm:w-16">
        <div className="node-spin absolute -inset-2 rounded-full border border-dashed border-[#2FD6FF]/30" />
        <div className="absolute inset-0 rounded-full border border-[#2FD6FF]/60 bg-[#0B1626]/80 shadow-[0_0_28px_rgba(47,214,255,0.35)] backdrop-blur-sm" />
        <span className="absolute inset-0 grid place-items-center font-mono text-[18px] font-bold text-[#2FD6FF] sm:text-[22px]">
          $
        </span>
        <span className="robot-glow-dot absolute inset-0 rounded-full border border-[#2FD6FF]/25" aria-hidden="true" />
        <span className="robot-glow-dot absolute -bottom-3 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-[#2FD6FF] shadow-[0_0_10px_rgba(47,214,255,0.9)]" />
      </div>
    </div>
  );
}
