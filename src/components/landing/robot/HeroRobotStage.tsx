'use client';

// HeroRobotStage: immersive robot scene — network field / robot / beam /
// SAY HELLO pill / stat cards. Composition follows the supplied mobile
// reference (centered robot, floating node, projected beam, greeting,
// four stat cards, asset strip below) while every figure stays derived
// from the real plan engine. Pointer parallax on desktop only; static
// under reduced motion. Transform/opacity motion only.
import { useEffect, useRef } from 'react';
import { PLANS, formatUSD } from '@/lib/plans';
import { usePrefersReducedMotion } from '@/components/landing/motion';
import { RobotIllustration } from '@/components/landing/robot/RobotIllustration';
import { RobotEnvironment } from '@/components/landing/robot/RobotEnvironment';
import { RobotOrbits } from '@/components/landing/robot/RobotOrbits';
import { RobotDataNode } from '@/components/landing/robot/RobotDataNode';
import { RobotBeam } from '@/components/landing/robot/RobotBeam';
import { RobotGreeting } from '@/components/landing/robot/RobotGreeting';

function sceneStats(): [string, string][] {
  const maxDaily = Math.max(...PLANS.map((p) => p.ratePerCredit * p.creditsPerDay)) * 100;
  const entry = Math.min(...PLANS.map((p) => p.min));
  const cycleH = PLANS[0].cycleHours;
  const dailyLabel = Number.isInteger(maxDaily) ? `${maxDaily}` : maxDaily.toFixed(1);
  return [
    ['RATE', `Up to ${dailyLabel}% a day`],
    ['CYCLE', `Every ${cycleH} hours`],
    ['EXIT', 'Credited automatically'],
    ['ENTRY', `From ${formatUSD(entry, { decimals: 0 })}`],
  ];
}

export function HeroRobotStage() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const clockRef = useRef<HTMLSpanElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const cycleH = PLANS[0].cycleHours;

  useEffect(() => {
    const pad = (n: number) => String(n).padStart(2, '0');
    const tick = () => {
      const now = new Date();
      if (clockRef.current) {
        clockRef.current.textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
      }
      if (countRef.current) {
        const sixH = 6 * 3600 * 1000;
        const remain = sixH - (Date.now() % sixH);
        const h = Math.floor(remain / 3600000);
        const m = Math.floor((remain % 3600000) / 60000);
        const s = Math.floor((remain % 60000) / 1000);
        countRef.current.textContent = `${pad(h)}:${pad(m)}:${pad(s)}`;
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

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
    <div ref={ref} className="hero-robot-stage robot-scene" aria-label="Axiora service unit">
      <div className="pointer-events-none absolute inset-0 z-[1]" aria-hidden="true">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_62%_46%_at_50%_30%,rgba(47,214,255,0.09),transparent_70%)]" />
        <div className="absolute inset-x-0 bottom-0 top-[38%] bg-[radial-gradient(ellipse_70%_60%_at_50%_100%,rgba(47,214,255,0.06),transparent_70%)]" />
      </div>
      <div className="robot-px robot-px-back absolute inset-0 z-[1]" aria-hidden="true">
        <RobotEnvironment />
      </div>
      <div className="robot-px robot-px-back absolute inset-0 z-[2]" aria-hidden="true">
        <RobotOrbits />
      </div>

      <div
        className="robot-px robot-px-robot robot-scene-in relative z-[4] mx-auto w-[clamp(240px,72%,330px)]"
        style={{ animationDelay: '120ms' }}
      >
        <div className="robot-hover">
          <RobotIllustration cycleHours={cycleH} />
        </div>
      </div>

      <p className="sr-only" aria-live="off">
        Server clock <span ref={clockRef}>--:--:--</span>, next payout in <span ref={countRef}>--:--:--</span>
      </p>

      <div className="robot-px robot-px-node absolute inset-0 z-[4]" aria-hidden="true">
        <RobotDataNode />
      </div>

      <div className="robot-px robot-px-beam robot-scene-in relative z-[3]" style={{ animationDelay: '260ms' }}>
        <RobotBeam />
      </div>
      <div className="robot-px robot-px-mid absolute inset-0 z-[5]" aria-hidden="true">
        <RobotOrbits front />
      </div>

      <div className="robot-scene-in relative z-[6] mt-2" style={{ animationDelay: '360ms' }}>
        <RobotGreeting />
      </div>

      <dl
        className="robot-scene-in relative z-[6] mx-auto mt-5 grid w-full max-w-[560px] grid-cols-2 gap-2.5"
        style={{ animationDelay: '460ms' }}
      >
        {sceneStats().map(([k, v]) => (
          <div
            key={k}
            className="robot-stat rounded-[10px] border border-line bg-[#0A0F18]/90 px-4 py-3 backdrop-blur-sm transition-colors hover:border-pulse/40"
          >
            <dt className="font-mono text-[10px] font-semibold tracking-[0.24em] text-pulse">{k}</dt>
            <dd className="mt-1 font-mono text-[12.5px] font-medium tracking-wide text-mist">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
