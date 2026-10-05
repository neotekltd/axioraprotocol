// Invest hub: Plans / My investments / Statistics in one authenticated
// experience (canonical route /app/deploy — the bottom-nav Invest
// destination). Client-side tab switching, no reloads, session untouched.
// All money arrives as server props; the browser only switches views.

'use client';

import { useRef, useState } from 'react';
import { PageHeader } from '@/components/data';
import { useT } from '@/components/LanguageProvider';
import { ChoosePlanSection } from '@/components/invest/PlanCards';
import { InvestPanel } from '@/components/invest/InvestPanel';
import { InvestmentsView } from '@/components/invest/InvestmentsView';
import { StatsView } from '@/components/invest/StatsView';
import type { PlanKey } from '@/lib/plans';
import type { ActivePlan, Deployment, ProtocolStats } from '@/lib/queries';
import { cn } from '@/lib/utils';

type TabKey = 'plans' | 'investments' | 'statistics';

export function InvestHub({
  available,
  hasFunds,
  activePlans,
  deployments,
  stats,
}: {
  available: number;
  hasFunds: boolean;
  activePlans: ActivePlan[];
  deployments: Deployment[];
  stats: ProtocolStats | null;
}) {
  const t = useT();
  const [tab, setTab] = useState<TabKey>('plans');
  const [selected, setSelected] = useState<PlanKey | null>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const TABS: { key: TabKey; label: string }[] = [
    { key: 'plans', label: t.inv.tabPlans },
    { key: 'investments', label: t.inv.tabInv },
    { key: 'statistics', label: t.inv.tabStats },
  ];
  const HEADERS: Record<TabKey, { title: string; sub: string }> = {
    plans: { title: t.inv.hPlansT, sub: t.inv.hPlansS },
    investments: { title: t.inv.hInvT, sub: t.inv.hInvS },
    statistics: { title: t.inv.hStatsT, sub: t.inv.hStatsS },
  };
  const header = HEADERS[tab];

  const onTabKeyDown = (e: React.KeyboardEvent, i: number) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const next = (i + (e.key === 'ArrowRight' ? 1 : TABS.length - 1)) % TABS.length;
    setTab(TABS[next].key);
    tabRefs.current[next]?.focus();
  };

  const investIn = (key: PlanKey) => {
    setSelected(key);
    requestAnimationFrame(() => {
      document.getElementById('invest-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  return (
    <div className="ax-enter mx-auto w-full max-w-[680px]">
      <PageHeader title={header.title} sub={header.sub} />

      <div
        role="tablist"
        aria-label={t.inv.tablistAria}
        className="mt-6 grid grid-cols-3 gap-1 rounded-2xl border border-[#202A3A] bg-[#0A0E16] p-1.5"
      >
        {TABS.map((t, i) => (
          <button
            key={t.key}
            ref={(el) => {
              tabRefs.current[i] = el;
            }}
            type="button"
            role="tab"
            id={`invest-tab-${t.key}`}
            aria-selected={tab === t.key}
            aria-controls={`invest-panel-${t.key}`}
            tabIndex={tab === t.key ? 0 : -1}
            onClick={() => setTab(t.key)}
            onKeyDown={(e) => onTabKeyDown(e, i)}
            className={cn(
              'flex min-h-[48px] items-center justify-center rounded-[11px] px-2 text-center text-[13px] transition-colors duration-200 sm:text-[14px]',
              tab === t.key
                ? 'bg-[#1A2334] font-bold text-white shadow-[inset_0_0_0_1px_rgba(47,214,255,0.25)]'
                : 'font-semibold text-[#78859A] hover:text-white'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div key={tab} className="ax-enter">
        {tab === 'plans' && (
          <div role="tabpanel" id="invest-panel-plans" aria-labelledby="invest-tab-plans">
            <ChoosePlanSection
              selected={selected}
              onSelect={setSelected}
              onInvest={investIn}
              panel={<InvestPanel selected={selected} available={available} hasFunds={hasFunds} />}
            />
          </div>
        )}
        {tab === 'investments' && (
          <div role="tabpanel" id="invest-panel-investments" aria-labelledby="invest-tab-investments">
            <InvestmentsView
              activePlans={activePlans}
              deployments={deployments}
              onStartPlan={() => setTab('plans')}
            />
          </div>
        )}
        {tab === 'statistics' && (
          <div role="tabpanel" id="invest-panel-statistics" aria-labelledby="invest-tab-statistics">
            <StatsView stats={stats} />
          </div>
        )}
      </div>
    </div>
  );
}
