// Layer E: scanning beam below the robot — translucent trapezoid cone with
// shimmer, rising motes inside, and an elliptical base ring.

const MOTES = [0, -1.2, -2.4];

export function RobotBeam() {
  return (
    <div aria-hidden="true" className="pointer-events-none relative z-[3] mx-auto -mt-2 w-[62%] max-w-[300px]">
      <div className="beam-shimmer relative mx-auto h-24 sm:h-28">
        <div
          className="absolute inset-x-0 top-0 mx-auto h-full w-[54%]"
          style={{
            background: 'linear-gradient(180deg, rgba(47,214,255,0.35) 0%, rgba(47,214,255,0.12) 55%, rgba(47,214,255,0.02) 100%)',
            clipPath: 'polygon(28% 0, 72% 0, 100% 100%, 0% 100%)',
            filter: 'blur(1px)',
          }}
        />
        <div
          className="absolute inset-x-0 top-0 mx-auto h-full w-[22%]"
          style={{
            background: 'linear-gradient(180deg, rgba(165,243,252,0.5) 0%, rgba(165,243,252,0.04) 100%)',
            clipPath: 'polygon(38% 0, 62% 0, 100% 100%, 0% 100%)',
            filter: 'blur(2px)',
          }}
        />
        {MOTES.map((d, i) => (
          <span
            key={i}
            className="beam-mote absolute left-1/2 top-1 h-1 w-1 rounded-full bg-[#A5F3FC]"
            style={{ animationDelay: `${d}s`, marginLeft: `${(i - 1) * 14}px` }}
          />
        ))}
      </div>
      <div className="relative mx-auto -mt-1 h-8">
        <div className="absolute inset-x-4 top-1 h-5 rounded-[50%] border border-[#2FD6FF]/50 shadow-[0_0_24px_rgba(47,214,255,0.3)]" />
        <div className="robot-glow-dot absolute inset-x-10 top-2.5 h-2 rounded-[50%] bg-[#2FD6FF]/40 blur-[3px]" />
      </div>
    </div>
  );
}
