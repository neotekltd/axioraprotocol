// Landing hero v3: multi-model intelligence is the core message.
// H1 "Frontier AI. Unified execution." with staged boot sequence, factual
// status panel (integrations honestly STANDBY), and the agent-topology
// visual showing agents → consensus → risk → execution.

import Link from 'next/link';
import { TechEyebrow } from '@/components/landing/background';
import { AgentTopology } from '@/components/landing/AgentTopology';
import { PROTOCOL_CONFIG } from '@/lib/config';
import type { AgentState } from '@/lib/agents';

const STATUS_ROWS: [string, string][] = [
  ['INTELLIGENCE', 'Multi-model · consensus-gated'],
  ['AGENTS DEFINED', '4 / 4'],
  ['MODEL INTEGRATIONS', 'Standby'],
  ['MINIMUM', `$${PROTOCOL_CONFIG.minDeployment}`],
  ['TERMS', `${PROTOCOL_CONFIG.minTermDays}–${PROTOCOL_CONFIG.maxTermDays} days`],
];

export function HeroAutopilot({ agents }: { agents: AgentState[] }) {
  return (
    <section className="relative overflow-hidden pb-14 pt-24 md:pb-16 md:pt-32" aria-label="Introduction">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_72%_32%,rgba(34,211,238,0.1),transparent)]" aria-hidden="true" />
      <svg className="absolute inset-0 h-full w-full opacity-60" aria-hidden="true" preserveAspectRatio="xMidYMid slice" viewBox="0 0 1200 640">
        <g stroke="#22D3EE" strokeOpacity="0.14" strokeWidth="1">
          <line x1="620" y1="0" x2="900" y2="640" />
          <line x1="760" y1="0" x2="1040" y2="640" />
          <line x1="480" y1="640" x2="820" y2="120" />
          <line x1="0" y1="480" x2="1200" y2="380" strokeOpacity="0.07" />
        </g>
        <g fill="#22D3EE">
          <circle cx="820" cy="120" r="2.5" opacity="0.5" className="pulse-node" />
          <circle cx="900" cy="640" r="2.5" opacity="0.4" />
          <circle cx="680" cy="420" r="2" opacity="0.45" className="pulse-node" />
          <circle cx="1040" cy="300" r="2" opacity="0.35" />
        </g>
      </svg>
      <div className="relative mx-auto grid w-full max-w-[1200px] items-center gap-10 px-5 md:px-8 lg:grid-cols-[0.88fr_1.12fr] lg:gap-6">
        <div>
          <div className="hero-in" style={{ animationDelay: '250ms' }}>
            <TechEyebrow index="AI" label="MULTI-MODEL INTELLIGENCE" />
          </div>
          <h1 className="mt-4 max-w-[12ch] text-[2.6rem] font-bold leading-[1.0] tracking-[-0.025em] sm:text-6xl xl:text-[4rem]">
            <span className="hero-in block" style={{ animationDelay: '400ms' }}>Frontier AI.</span>
            <span className="hero-in block text-pulse text-glow" style={{ animationDelay: '500ms' }}>Unified execution.</span>
          </h1>
          <p className="hero-in mt-5 max-w-md text-[15px] leading-relaxed text-mist/80" style={{ animationDelay: '650ms' }}>
            Axiora orchestrates intelligence across independent AI agents, combines their signals
            through a consensus layer, applies risk controls, and routes authorized strategies
            through its execution engine.
          </p>
          <div className="hero-in mt-7 flex flex-wrap items-center gap-3" style={{ animationDelay: '800ms' }}>
            <Link href="/register" className="rounded-md bg-pulse px-5 py-2.5 text-[13px] font-bold text-black shadow-glow transition hover:brightness-110">
              Launch Axiora
            </Link>
            <Link href="#intelligence" className="rounded-md border border-line px-5 py-2.5 text-[13px] text-mist transition hover:border-pulse/50 hover:text-white">
              Explore the intelligence layer
            </Link>
          </div>
          <div className="hero-in mt-6 max-w-sm rounded-lg border border-line bg-void/70" style={{ animationDelay: '900ms' }}>
            <div className="border-b border-line px-3.5 py-1.5 font-mono text-[10px] tracking-[0.25em] text-fog">SYSTEM STATUS</div>
            <dl>
              {STATUS_ROWS.map(([k, v]) => (
                <div key={k} className="flex items-center justify-between border-b border-line/50 px-3.5 py-[7px] font-mono text-[11px] last:border-0">
                  <dt className="tracking-[0.18em] text-fog">{k}</dt>
                  <dd className="text-mist">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
        <div className="hero-in relative" style={{ animationDelay: '950ms' }}>
          <AgentTopology agents={agents} />
          <p className="mt-3 text-center font-mono text-[0.6875rem] tracking-[0.2em] text-fog">AXIORA INTELLIGENCE FABRIC · ORIGINAL RENDER</p>
        </div>
      </div>
    </section>
  );
}

export function CoinsStrip() {
  return (
    <section aria-label="Connected assets" className="border-y border-white/5 bg-void/60">
      <div className="thin-scroll mx-auto flex max-w-[1200px] items-center gap-2.5 overflow-x-auto px-5 py-3 md:px-8">
        <span className="shrink-0 font-mono text-[10px] tracking-[0.22em] text-fog">CONNECTED ASSETS</span>
        <span className="h-4 w-px shrink-0 bg-line" aria-hidden="true" />
        {PROTOCOL_CONFIG.supportedAssets.map((a) => (
          <span key={a} className="group flex shrink-0 items-center gap-2 rounded-md border border-line bg-panel px-2.5 py-1.5 transition hover:border-pulse/50">
            <span className="h-1 w-1 rounded-full bg-pulse/70 transition group-hover:bg-pulse" aria-hidden="true" />
            <span className="font-mono text-[11px] font-bold tracking-wide text-mist">{a}</span>
          </span>
        ))}
        <span className="h-4 w-px shrink-0 bg-line" aria-hidden="true" />
        <span className="shrink-0 text-[11px] text-fog">Deposits convert to USDT on arrival</span>
      </div>
    </section>
  );
}
