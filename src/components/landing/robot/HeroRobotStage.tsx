'use client';

// HeroRobotStage: the robot as hero focal point. Vertical rhythm —
// terminal / network field / robot / beam / interaction pill — with the
// environment moving around an anchored robot. Subtle pointer parallax on
// desktop only; static under reduced motion.
import { useEffect, useRef, useState } from 'react';
import { PLANS } from '@/lib/plans';
import { usePrefersReducedMotion } from '@/components/landing/motion';
import { RobotIllustration } from '@/components/landing/robot/RobotIllustration';
import { RobotEnvironment } from '@/components/landing/robot/RobotEnvironment';
import { RobotOrbits } from '@/components/landing/robot/RobotOrbits';
import { RobotDataNode } from '@/components/landing/robot/RobotDataNode';
import { RobotBeam } from '@/components/landing/robot/RobotBeam';
import { RobotGreeting } from '@/components/landing/robot/RobotGreeting';

function useNextPayoutCountdown(): string {
  const [label, setLabel] = useState('--:--:--');
  useEffect(() => {
    const tick = () => {
      const sixH = 6 * 3600 * 1000;
      const remain = sixH - (Date.now() % sixH);
      const h = Math.floor(remain / 3600000);
      const m = Math.floor((remain % 3600000) / 60000);
      const s = Math.floor((remain % 60000) / 1000);
      setLabel(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return label;
}

export function HeroRobotStage() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const countdown = useNextPayoutCountdown();
  const cycleH = PLANS[0].cycleHours;

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;
    if (!window.matchMedia('(pointer: fine)').matches) return;
    let raf = 0;
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const nx = ((e.clientX - r.left) / Math.max(1, r.width) - 0.5) * 2;
      const ny = ((e.clientY - r.top) / Math.max(1, r.height) - 0.5) * 2;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.setProperty('--rx', nx.toFixed(3));
        el.style.setProperty('--ry', ny.toFixed(3));
      });
    };
    const onLeave = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.setProperty('--rx', '0');
        el.style.setProperty('--ry', '0');
      });
    };
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    return () => {
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
      cancelAnimationFrame(raf);
    };
  }, [reduced]);

  return (
    <div
      ref={ref}
      className="hero-robot-stage rounded-2xl border border-line bg-[#070B13]/80 px-4 pb-8 pt-4 sm:px-6"
      aria-label="Axiora service unit"
    >
      {/* back layers */}
      <div className="robot-px robot-px-back absolute inset-0 z-[1]" aria-hidden="true">
        <RobotEnvironment />
      </div>
      <div className="robot-px robot-px-back absolute inset-0 z-[2]" aria-hidden="true">
        <RobotOrbits />
      </div>

      {/* terminal above the robot (config-derived, live countdown) */}
      <div className="relative z-[5] mx-auto max-w-[400px] rounded-xl border border-[#1D2839] bg-[#080D16]/95 p-4 font-mono text-[12px] leading-[1.9] shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
        <p><span className="text-[#78859A]">&gt; {PLANS.length} plans loaded</span> <span className="text-[#35D98B]">.......... ok</span></p>
        <p><span className="text-[#78859A]">&gt; payout cycle: {cycleH} hours</span> <span className="text-[#35D98B]"> .. ok</span></p>
        <p>
          <span className="text-[#78859A]">&gt; next payout </span>
          <span className="text-[#2FD6FF]" suppressHydrationWarning>{countdown}</span>
        </p>
      </div>

      {/* robot */}
      <div className="robot-px robot-px-robot relative z-[4] mx-auto -mt-1 w-[clamp(230px,68%,320px)]">
        <div className="robot-hover">
          <RobotIllustration cycleHours={cycleH} payoutsPerDay={PLANS[0].creditsPerDay} />
        </div>
      </div>

      {/* data node floats at the robot's right */}
      <div className="robot-px robot-px-node absolute inset-0 z-[4] hidden min-[420px]:block" aria-hidden="true">
        <RobotDataNode />
      </div>

      {/* beam */}
      <div className="robot-px robot-px-beam relative z-[3]">
        <RobotBeam />
      </div>
      <div className="robot-px robot-px-mid absolute inset-0 z-[5]" aria-hidden="true">
        <RobotOrbits front />
      </div>

      {/* interaction */}
      <div className="relative mt-3">
        <RobotGreeting />
      </div>
    </div>
  );
}
