// 01 / INTELLIGENCE: the AI layer as native homepage content.
// Agent cards, consensus pipeline, telemetry console and model log — all
// driven by the ai_agents registry. No integrations connected yet, so
// statuses read STANDBY and metrics read DATA PENDING. Nothing fabricated.

import { Reveal } from '@/components/Reveal';
import { TechEyebrow } from '@/components/landing/background';
import type { AgentState } from '@/lib/agents';

const FLOW = ['MODEL SIGNALS', 'CROSS-MODEL ANALYSIS', 'AXIORA CONSENSUS', 'RISK ENGINE', 'EXECUTION ENGINE', 'LEDGER'];

export function IntelligenceSection({ agents }: { agents: AgentState[] }) {
  const active = agents.filter((a) => a.status === 'active').length;
  const lastAnalysis = agents
    .map((a) => a.lastConsensusAt ?? a.lastSignalAt)
    .filter((v): v is string => Boolean(v))
    .sort()
    .pop();

  return (
    <section id="intelligence" className="relative mx-auto max-w-[1200px] scroll-mt-24 px-5 py-20 md:px-8 md:py-28" aria-label="Intelligence layer">
      <Reveal>
        <TechEyebrow index="01" label="INTELLIGENCE" />
        <h2 className="mt-3 max-w-2xl text-3xl font-bold tracking-tight sm:text-5xl">One strategy. Multiple frontier models.</h2>
        <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-mist/75">
          Axiora combines independent outputs from multiple AI systems through an orchestration
          and consensus layer. External frontier-model integrations connect here when configured —
          until then every channel honestly reports its real state below.
        </p>
      </Reveal>

      <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {agents.map((a, i) => (
          <Reveal key={a.key} delay={Math.min(i, 2) * 90}>
            <div className="card-sweep h-full rounded-xl border border-line bg-panel/80 p-5 transition hover:border-pulse/50">
              <div className="flex items-center justify-between font-mono text-[10px] tracking-[0.22em] text-fog">
                <span>AGENT {String(i + 1).padStart(2, '0')}</span>
                <span className="flex items-center gap-1.5">
                  <span className={`h-1.5 w-1.5 rounded-full ${a.status === 'active' ? 'bg-pulse shadow-[0_0_8px_1px_rgba(34,211,238,0.8)]' : 'bg-white/20'}`} aria-hidden="true" />
                  <span className={a.status === 'active' ? 'text-pulse' : 'text-fog'}>{a.status.toUpperCase()}</span>
                </span>
              </div>
              <div className="mt-2.5 font-bold">{a.name}</div>
              <div className="mt-0.5 font-mono text-[11px] text-fog">{a.provider} · MODEL PROVIDER</div>
              <div className="mt-3 border-t border-line/60 pt-3 text-xs text-fog">{a.role}</div>
              <div className="mt-1.5 font-mono text-[10px] text-fog">LAST SIGNAL — {a.lastSignalAt ? a.lastSignalAt.slice(0, 19).replace('T', ' ') : 'NONE RECORDED'}</div>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal delay={100}>
        <div className="thin-scroll mt-4 overflow-x-auto rounded-xl border border-line bg-void/60 px-2 py-4" aria-label="Consensus pipeline">
          <ol className="flex min-w-[720px] items-center">
            {FLOW.map((step, i) => (
              <li key={step} className="flex flex-1 items-center last:flex-none">
                <span className="whitespace-nowrap rounded-md border border-line bg-panel px-3 py-2 font-mono text-[10px] tracking-[0.15em] text-mist">{step}</span>
                {i < FLOW.length - 1 && (
                  <span className="relative mx-1 h-px flex-1 bg-white/[0.08]" aria-hidden="true">
                    <span className="signal-x" style={{ animationDuration: `${2.4 + i * 0.5}s`, animationDelay: `${i * 0.4}s` }} />
                  </span>
                )}
              </li>
            ))}
          </ol>
        </div>
      </Reveal>

      <div className="mt-4 grid gap-3 lg:grid-cols-[1.1fr_0.9fr]">
        <Reveal>
          <div className="h-full rounded-xl border border-line bg-panel/70 p-5">
            <div className="font-mono text-[10px] tracking-[0.25em] text-fog">INTELLIGENCE CONSOLE</div>
            <dl className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {[
                ['ACTIVE AGENTS', `${active} / ${agents.length}`],
                ['SIGNALS PROCESSED', 'DATA PENDING'],
                ['CONSENSUS RATE', 'DATA PENDING'],
                ['EXECUTIONS', 'DATA PENDING'],
                ['LAST ANALYSIS', lastAnalysis ? lastAnalysis.slice(0, 19).replace('T', ' ') : 'DATA PENDING'],
                ['ENGINE', 'STANDBY'],
              ].map(([k, v]) => (
                <div key={k} className="rounded-lg border border-line bg-void/60 px-3 py-2.5">
                  <dt className="font-mono text-[9px] tracking-[0.2em] text-fog">{k}</dt>
                  <dd className="mt-1 truncate font-mono text-sm font-bold text-white">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Reveal>
        <Reveal delay={100}>
          <div className="flex h-full flex-col rounded-xl border border-line bg-[#070b12]">
            <div className="flex items-center gap-2 border-b border-line px-4 py-2.5" aria-hidden="true">
              <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
              <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
              <span className="ml-2 font-mono text-[10px] tracking-[0.2em] text-fog">axiora://model-log</span>
            </div>
            <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
              <div className="font-mono text-xs font-bold tracking-[0.2em] text-fog">NO PRODUCTION SIGNALS RECORDED</div>
              <p className="mx-auto mt-2 max-w-xs text-xs leading-relaxed text-fog">
                Signal-received → consensus → risk → execution events stream here
                once model integrations are connected. Nothing is simulated.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
