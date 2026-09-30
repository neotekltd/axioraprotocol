// Layer C: orbital arcs. Partial elliptical rings rotating very slowly in
// opposite directions. `front` renders the near arc above the robot.

export function RobotOrbits({ front = false }: { front?: boolean }) {
  if (front) {
    return (
      <svg viewBox="0 0 400 560" preserveAspectRatio="xMidYMid slice" aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full">
        <g fill="none" stroke="#2FD6FF" strokeWidth="1">
          <ellipse cx="200" cy="330" rx="150" ry="120" strokeOpacity="0.14" strokeDasharray="120 480" strokeLinecap="round" className="orbit-rotor orbit-spin-b" />
        </g>
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 400 560" preserveAspectRatio="xMidYMid slice" aria-hidden="true" className="absolute inset-0 h-full w-full">
      <g fill="none" stroke="#22D3EE" strokeWidth="1">
        <ellipse cx="200" cy="300" rx="172" ry="190" strokeOpacity="0.12" strokeDasharray="200 880" strokeLinecap="round" className="orbit-rotor orbit-spin-a" />
        <ellipse cx="200" cy="300" rx="138" ry="150" strokeOpacity="0.16" strokeDasharray="140 730" strokeLinecap="round" className="orbit-rotor orbit-spin-b" />
        <ellipse cx="200" cy="300" rx="104" ry="112" strokeOpacity="0.1" strokeDasharray="90 560" strokeLinecap="round" className="orbit-rotor orbit-spin-c" />
      </g>
      <g fill="none" stroke="#67E8F9" strokeWidth="1">
        <circle cx="200" cy="300" r="120" strokeOpacity="0.07" strokeDasharray="2 10" className="orbit-rotor orbit-spin-a" />
      </g>
    </svg>
  );
}
