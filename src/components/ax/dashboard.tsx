'use client';

// Dashboard composites built from Ax primitives. All money comes from props
// (server-computed ledger values) — these components never invent figures.

import Link from 'next/link';
import { useState } from 'react';
import { ArrowRight, Check, Coins, Copy, Layers, Target, TrendingUp, Users, Wallet } from 'lucide-react';
import { AxCard, IconBox, SegmentedSchedule } from '@/components/ax/primitives';
import { PLANS, type PlanKey } from '@/lib/plans';
import { PROTOCOL_CONFIG } from '@/lib/config';
import { formatUSD, formatPct } from '@/lib/plans';

export function WalletSummaryRow({ icon, title, subtitle, amount, tone = 'neutral' as const }: {
  icon: React.ReactNode; title: string; subtitle: string; amount: string;
  tone?: 'cyan' | 'green' | 'neutral' | 'warning';
}) {
  return (
    <div className="flex items-center gap-3.5 border-b border-[#202A3A]/60 py-4 last:border-0">
      <IconBox tone={tone} size={52}>{icon}</IconBox>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[15px] font-semibold text-white">{title}</div>
        <div className="truncate text-[13px] text-[#78859A]">{subtitle}</div>
      </div>
      <div className="font-mono text-[17px] font-bold text-white">{amount}</div>
    </div>
  );
}

export function BalanceHeroCard({ total, available, earning, invested, hasDeposits }: {
  total: number; available: number; earning: number; invested: number; hasDeposits: boolean;
}) {
  return (
    <AxCard variant="hero" className="p-6 sm:p-7">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{ background: 'radial-gradient(circle at 85% 30%, rgba(47,214,255,0.10), transparent 55%)' }}
      />
      <div className="relative">
        <div className="text-[14px] text-[#AAB5C7]">Total balance</div>
        <div className="mt-1 font-mono text-[44px] font-bold leading-none tracking-tight text-white sm:text-[52px]">
          {formatUSD(total)}
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <Link href="/app/deposit" className="flex min-h-[54px] items-center justify-center gap-2 rounded-[14px] bg-[#2FD6FF] text-[15px] font-bold text-[#06121A] shadow-[0_0_28px_rgba(47,214,255,0.25)] transition hover:brightness-110 active:scale-[0.99]">
            <span aria-hidden="true">↓</span> Deposit
          </Link>
          <Link href="/app/deploy" className="flex min-h-[54px] items-center justify-center gap-2 rounded-[14px] border border-[#2A394D] bg-[#111722] text-[15px] font-bold text-white transition hover:border-[rgba(47,214,255,0.5)] active:scale-[0.99]">
            See plans <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
        <div className="mt-2">
          <WalletSummaryRow icon={<Wallet size={22} />} title="Deposit wallet" subtitle="Use it to invest" amount={formatUSD(available)} tone="cyan" />
          <WalletSummaryRow icon={<Coins size={22} />} title="Earning wallet" subtitle="You can withdraw this" amount={formatUSD(earning)} tone="green" />
          <WalletSummaryRow
            icon={<Layers size={22} />} title="Invested"
            subtitle={hasDeposits ? `${formatUSD(invested)} deployed` : 'No plans yet'}
            amount={formatUSD(invested)} tone="neutral"
          />
        </div>
      </div>
    </AxCard>
  );
}

const ONBOARDING = [
  { n: '01', title: 'Deposit crypto', body: 'Fund your deposit wallet to begin.', cta: 'Make a deposit', href: '/app/deposit' },
  { n: '02', title: 'Choose a module', body: 'Pick the term that fits your capital.', cta: 'See plans', href: '/app/deploy' },
  { n: '03', title: 'Collect on schedule', body: 'Earnings settle to your ledger at maturity.', cta: 'How it works', href: '/how-it-works' },
];

export function OnboardingStepsCard({ doneDeposited, doneDeployed }: { doneDeposited: boolean; doneDeployed: boolean }) {
  const done = [doneDeposited, doneDeployed, false];
  const firstOpen = done.findIndex((d) => !d);
  return (
    <AxCard className="p-6 sm:p-7">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-[12px] border border-[rgba(47,214,255,0.4)] bg-[rgba(47,214,255,0.08)] text-[#2FD6FF]">
          <Target size={20} />
        </span>
        <h2 className="text-xl font-bold tracking-tight text-white">Get started in 3 steps</h2>
      </div>
      <ol className="relative mt-5 space-y-3">
        {ONBOARDING.map((s, i) => {
          const isDone = done[i];
          const isOpen = i === firstOpen;
          return (
            <li
              key={s.n}
              className={`relative rounded-[16px] border p-5 transition ${isOpen ? 'border-[rgba(47,214,255,0.6)] bg-[rgba(47,214,255,0.05)] shadow-[0_0_28px_rgba(47,214,255,0.10)]' : 'border-[#202A3A] bg-[#0D111A]'}`}
            >
              <div className="flex items-center gap-3">
                <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-[12px] font-mono text-[15px] font-bold ${isOpen ? 'bg-[#2FD6FF] text-[#06121A]' : isDone ? 'border border-[rgba(53,217,139,0.5)] bg-[rgba(53,217,139,0.1)] text-[#35D98B]' : 'border border-[#2A394D] bg-[#151B27] text-[#596579]'}`}>
                  {isDone && !isOpen ? <Check size={18} /> : s.n}
                </span>
                <div className="text-[17px] font-bold text-white">{s.title}</div>
              </div>
              <p className="mt-2.5 text-[14px] text-[#AAB5C7]">{s.body}{i === 0 && ` ${[...PROTOCOL_CONFIG.supportedAssets].join(', ')}.`}</p>
              {isOpen && (
                <Link href={s.href} className="mt-4 inline-flex min-h-[48px] items-center rounded-[12px] bg-[#2FD6FF] px-5 text-[14px] font-bold text-[#06121A] transition hover:brightness-110">
                  {s.cta}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </AxCard>
  );
}

export function PlanCard({ planKey, selected }: { planKey: PlanKey; selected?: boolean }) {
  const plan = PLANS.find((p) => p.key === planKey) ?? PLANS[0];
  return (
    <AxCard variant={selected ? 'active' : 'default'} className="p-6">
      <div className="flex items-center gap-3">
        <IconBox tone="cyan" size={56}><TrendingUp size={24} /></IconBox>
        <div className="text-[19px] font-bold text-white">{plan.name}</div>
      </div>
      <div className="mt-4 font-mono text-[38px] font-bold leading-none tracking-tight text-[#2FD6FF]">
        {formatPct(plan.ratePerCredit * 100)}
        <span className="ml-1 align-middle font-sans text-[13px] font-normal text-[#78859A]">every 6h</span>
      </div>
      <div className="mt-3"><SegmentedSchedule total={12} filled={8} /></div>
      <div className="mt-3 text-[14px] text-[#AAB5C7]">
        Invest {formatUSD(plan.min, { decimals: 0 })} to {formatUSD(plan.max, { decimals: 0 })}
      </div>
      <Link
        href="/app/deploy"
        className={`mt-5 flex min-h-[52px] items-center justify-center rounded-[14px] text-[15px] font-bold transition active:scale-[0.99] ${selected ? 'bg-[#2FD6FF] text-[#06121A] shadow-[0_0_28px_rgba(47,214,255,0.25)] hover:brightness-110' : 'border border-[#2A394D] bg-[#151B27] text-white hover:border-[rgba(47,214,255,0.5)]'}`}
      >
        Choose {plan.name}
      </Link>
      <p className="mt-2.5 text-center font-mono text-[10px] tracking-[0.15em] text-[#596579]">{plan.code}</p>
    </AxCard>
  );
}

export function ReferralSummaryCard({ link, count, earned }: { link: string | null; count: number; earned: number }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      /* clipboard unavailable */
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };
  return (
    <AxCard className="p-6 sm:p-7">
      <div className="flex items-start gap-4">
        <IconBox tone="cyan" size={60}><Users size={26} /></IconBox>
        <div>
          <div className="text-[19px] font-bold text-white">Invite friends</div>
          <p className="mt-1 text-[14px] leading-relaxed text-[#AAB5C7]">
            Earn {PROTOCOL_CONFIG.referralLevels[0].instantPct}% of every deployment your L1 referrals make.
          </p>
        </div>
      </div>
      {link ? (
        <div className="mt-5 flex items-center gap-2 rounded-[16px] border border-[#2A394D] bg-[#0D111A] p-2 pl-4">
          <span className="min-w-0 flex-1 truncate font-mono text-[13px] text-[#AAB5C7]">{link}</span>
          <button
            onClick={copy}
            className="flex shrink-0 items-center gap-1.5 rounded-[12px] bg-[#2FD6FF] px-4 py-2.5 text-[13px] font-bold text-[#06121A] transition hover:brightness-110"
            aria-live="polite"
          >
            {copied ? <Check size={15} /> : <Copy size={15} />}{copied ? 'Copied' : 'Copy link'}
          </button>
        </div>
      ) : (
        <p className="mt-5 text-[14px] text-[#78859A]">Your link appears once your profile is ready.</p>
      )}
      <div className="mt-5 flex gap-8 border-t border-[#202A3A]/70 pt-4">
        <div>
          <div className="text-[13px] text-[#78859A]">Friends</div>
          <div className="mt-0.5 font-mono text-[22px] font-bold text-white">{count}</div>
        </div>
        <div>
          <div className="text-[13px] text-[#78859A]">You earned</div>
          <div className="mt-0.5 font-mono text-[22px] font-bold text-white">{formatUSD(earned)}</div>
        </div>
      </div>
    </AxCard>
  );
}
