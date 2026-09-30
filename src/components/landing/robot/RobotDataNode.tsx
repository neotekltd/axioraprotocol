// Layer: floating cyan data/value node on the robot's right — original
// Axiora mark (not a currency copy). Slow drift + glow pulse + slow ring
// rotation; stays attached to the robot ecosystem.

export function RobotDataNode() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute right-[7%] top-[34%] z-[4] sm:right-[10%]">
      <div className="node-drift relative h-14 w-14 sm:h-16 sm:w-16">
        <div className="node-spin absolute -inset-2 rounded-full border border-dashed border-[#2FD6FF]/30" />
        <div className="absolute inset-0 rounded-full border border-[#2FD6FF]/60 bg-[#0B1626]/80 shadow-[0_0_28px_rgba(47,214,255,0.35)] backdrop-blur-sm" />
        <svg viewBox="0 0 32 32" className="absolute inset-0 m-auto h-7 w-7 text-[#2FD6FF]">
          <path
            d="M16 4 L27 26 H22.4 L16 12.6 L9.6 26 H5 Z"
            fill="currentColor"
            opacity="0.95"
          />
          <rect x="11" y="20" width="10" height="2.4" rx="1.2" fill="currentColor" />
        </svg>
        <span className="robot-glow-dot absolute -bottom-3 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-[#2FD6FF] shadow-[0_0_10px_rgba(47,214,255,0.9)]" />
      </div>
    </div>
  );
}
