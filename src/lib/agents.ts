// Canonical AI agent registry. The four Axiora agents are the only systems
// ever displayed. External providers (OpenAI/Anthropic/Google) appear here
// ONLY after a real server-side integration exists — never speculatively.
// Statuses resolve from the ai_agents table when migration 0006 is applied;
// otherwise every agent honestly reports standby. No credentials anywhere.

import { createClient } from '@/lib/supabase/server';

export interface AgentDef {
  key: string;
  name: string;
  provider: string;
  role: string;
}

export const AGENTS: AgentDef[] = [
  { key: 'signal', name: 'SIGNAL AGENT', provider: 'AXIORA', role: 'MARKET ANALYSIS' },
  { key: 'risk', name: 'RISK AGENT', provider: 'AXIORA', role: 'EXPOSURE CONTROL' },
  { key: 'execution', name: 'EXECUTION AGENT', provider: 'AXIORA', role: 'ORDER ROUTING' },
  { key: 'sentiment', name: 'SENTIMENT AGENT', provider: 'AXIORA', role: 'FLOW ANALYSIS' },
];

export type AgentStatus = 'standby' | 'analyzing' | 'active' | 'disabled';

export interface AgentState extends AgentDef {
  enabled: boolean;
  status: AgentStatus;
  lastSignalAt: string | null;
  lastConsensusAt: string | null;
}

const STANDBY: Omit<AgentState, keyof AgentDef> = {
  enabled: false,
  status: 'standby',
  lastSignalAt: null,
  lastConsensusAt: null,
};

export async function getAgentStates(): Promise<AgentState[]> {
  let rows: Record<string, unknown>[] = [];
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('ai_agents')
      .select('key,enabled,status,last_signal_at,last_consensus_at');
    if (!error && data) rows = data as Record<string, unknown>[];
  } catch {
    rows = [];
  }
  const byKey = new Map(rows.map((r) => [String(r.key), r]));
  return AGENTS.map((a) => {
    const r = byKey.get(a.key);
    const status = r?.status;
    const valid: AgentStatus[] = ['standby', 'analyzing', 'active', 'disabled'];
    return {
      ...a,
      enabled: Boolean(r?.enabled),
      status: valid.includes(status as AgentStatus) ? (status as AgentStatus) : 'standby',
      lastSignalAt: (r?.last_signal_at as string | null) ?? null,
      lastConsensusAt: (r?.last_consensus_at as string | null) ?? null,
    };
  });
}
