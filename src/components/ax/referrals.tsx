'use client';

// Referrals dashboard view. Everything renders from authoritative sources:
// profile referral code/link, referral rows + earnings from the database,
// commission rules from PROTOCOL_CONFIG.referralLevels, banner embeds from
// the central banner config. No invented members, earnings, or rates.

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Check, Copy, Mail, MessageCircle, Send } from 'lucide-react';
import { Reveal } from '@/components/Reveal';
import { PageHeader } from '@/components/data';
import { AXIORA_TELEGRAM_URL, PROTOCOL_CONFIG } from '@/lib/config';
import { BANNERS, bannerEmbed } from '@/lib/banners';
import { formatUSD } from '@/lib/finance';
import type { ReferralRow } from '@/lib/queries';
import { useT } from '@/components/LanguageProvider';
import type { Dictionary } from '@/lib/i18n-dict';
import { cn } from '@/lib/utils';

type CopyState = 'idle' | 'done' | 'failed';

function useCopied(): [CopyState, (text: string) => void] {
  const [state, setState] = useState<CopyState>('idle');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);
  const copy = async (text: string) => {
    let ok = false;
    try {
      await navigator.clipboard.writeText(text);
      ok = true;
    } catch {
      ok = false;
    }
    setState(ok ? 'done' : 'failed');
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setState('idle'), 2000);
  };
  return [state, copy];
}

function CopyPill({ text, label }: { text: string; label: string }) {
  const t = useT();
  const [state, copy] = useCopied();
  return (
    <button
      type="button"
      onClick={() => void copy(text)}
      aria-live="polite"
      aria-label={state === 'done' ? t.common.copied : state === 'failed' ? t.ref.copyFailed : label}
      className={cn(
        'flex min-h-[48px] shrink-0 items-center gap-1.5 rounded-[12px] px-4 text-[13px] font-bold transition active:scale-[0.97]',
        state === 'done'
          ? 'bg-[#35D98B] text-[#06121A]'
          : state === 'failed'
            ? 'border border-[rgba(240,107,120,0.5)] text-[#F06B78]'
            : 'bg-[#2FD6FF] text-[#06121A] shadow-[0_0_20px_rgba(47,214,255,0.25)] hover:brightness-110'
      )}
    >
      {state === 'done' ? <Check size={15} aria-hidden="true" /> : <Copy size={15} aria-hidden="true" />}
      {state === 'done' ? t.common.copied : state === 'failed' ? t.ref.copyFailed : label}
    </button>
  );
}

function shareLinks(link: string, t: Dictionary['ref']) {
  // The URL itself is never translated or altered — only the human message
  // around it is localized, then percent-encoded for every channel.
  const u = encodeURIComponent(link);
  const msg = encodeURIComponent(t.shareText);
  return [
    { label: 'WhatsApp', href: `https://wa.me/?text=${msg}%20${u}`, Icon: MessageCircle, ariaLabel: t.shareWhatsapp },
    { label: 'Telegram', href: AXIORA_TELEGRAM_URL, Icon: Send, ariaLabel: t.shareTelegram },
    { label: 'X', href: `https://x.com/intent/tweet?url=${u}&text=${msg}`, Icon: null, ariaLabel: t.shareX },
    { label: 'Email', href: `mailto:?subject=${encodeURIComponent(t.shareSubject)}&body=${msg}%20${u}`, Icon: Mail, ariaLabel: t.shareEmail },
  ];
}

function LevelCard({ level, members, index }: {
  level: { level: number; instantPct: number; dailySharePct: number };
  members: ReferralRow[];
  index: number;
}) {
  const t = useT();
  const shown = members.slice(0, 5);
  const extra = members.length - shown.length;
  // Descriptions derive from the authoritative level config — never
  // hardcoded percentages from another product's page.
  const desc =
    level.level === 1
      ? t.ref.levelDesc1
      : t.ref.levelDescN
          .replace('{prev}', String(level.level - 1))
          .replace('{p}', String(level.instantPct))
          .replace('{s}', String(level.dailySharePct));
  return (
    <Reveal delay={index * 80}>
      <section
        aria-label={t.ref.levelGroup.replace('{n}', String(level.level))}
        className="rounded-2xl border border-[#202A3A] bg-[#0C1119] p-5 transition duration-200 hover:-translate-y-[3px] hover:border-[rgba(47,214,255,0.4)] sm:p-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-[17px] font-bold text-white">{t.referrals.level.replace('{n}', String(level.level))}</h2>
          <span
            className={cn(
              'rounded-full border px-3 py-1.5 font-mono text-[11px] font-semibold',
              level.level === 1
                ? 'border-[rgba(47,214,255,0.45)] bg-[rgba(47,214,255,0.08)] text-[#2FD6FF]'
                : 'border-[#2A394D] bg-[#111722] text-[#AAB5C7]'
            )}
          >
            {level.instantPct}% {t.ref.ofDeposits} · {level.dailySharePct}% {t.ref.ofEarnings}
          </span>
        </div>
        {members.length === 0 ? (
          <p className="mt-3 text-[14px] text-[#AAB5C7]">{t.ref.nobody}</p>
        ) : (
          <ul className="mt-3 divide-y divide-[#202A3A]/70">
            {shown.map((m) => (
              <li key={m.id} className="flex items-center justify-between gap-3 py-2.5 text-[14px]">
                <span className="flex items-center gap-2.5">
                  <span aria-hidden="true" className="grid h-8 w-8 place-items-center rounded-full border border-[#2A394D] bg-[#151B27] font-mono text-[12px] font-bold text-[#2FD6FF]">
                    {String(m.level).padStart(2, '0')}
                  </span>
                  <span className="text-white">{t.ref.memberWord}</span>
                </span>
                <span className="font-mono text-[12px] text-[#78859A]">{t.ref.joined.replace('{d}', m.createdAt.slice(0, 10))}</span>
              </li>
            ))}
          </ul>
        )}
        {extra > 0 && (
          <p className="mt-1 text-[13px] text-[#78859A]">
            {t.ref.moreN.replace('{n}', String(extra))} · <Link href="/app/referrals/network" className="font-semibold text-[#2FD6FF]">{t.ref.openNetwork}</Link>
          </p>
        )}
        <p className="mt-3 text-[13px] leading-relaxed text-[#78859A]">{desc}</p>
      </section>
    </Reveal>
  );
}

function BannerCard({ bannerId, link }: { bannerId: (typeof BANNERS)[number]; link: string | null }) {
  const t = useT();
  const [state, copy] = useCopied();
  const code = link ? bannerEmbed(bannerId, link) : '';
  return (
    <div className="overflow-hidden rounded-2xl border border-[#202A3A] bg-[#0C1119] transition duration-200 hover:-translate-y-[2px] hover:border-[rgba(47,214,255,0.4)]">
      <div className="tech-dots flex items-center justify-center bg-[#070B13] p-6">
        <Image
          src={bannerId.file}
          alt={`${bannerId.title} ${t.ref.previewSuffix}`}
          width={bannerId.width}
          height={bannerId.height}
          className="h-auto w-full max-w-[420px] rounded-[8px]"
          unoptimized
        />
      </div>
      <div className="p-5">
        <h3 className="text-[15px] font-bold text-white">{bannerId.title}</h3>
        <p className="mt-1 font-mono text-[11px] text-[#78859A]">{bannerId.sizeLabel} · {bannerId.blurb}</p>
        <button
          type="button"
          onClick={() => void copy(code)}
          disabled={!link}
          aria-live="polite"
          className="mt-4 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-[14px] border border-[#2A394D] bg-[#111722] text-[14px] font-bold text-white transition hover:border-[rgba(47,214,255,0.55)] active:scale-[0.99] disabled:opacity-50"
        >
          {state === 'done' ? <Check size={16} className="text-[#35D98B]" aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
          {state === 'done' ? t.common.copied : state === 'failed' ? t.ref.copyFailed : t.ref.copyCode}
        </button>
      </div>
    </div>
  );
}

export function ReferralsView({ link, code, referrals, earned }: {
  link: string | null;
  code: string | null;
  referrals: ReferralRow[];
  earned: number;
}) {
  const t = useT();
  const team = referrals.length;
  return (
    <div className="ax-enter mx-auto w-full max-w-[680px]">
      <PageHeader
        title={t.referrals.title}
        sub={t.ref.pageSub}
      />
      <Reveal>
        <section aria-label={t.referrals.yourLink} className="mt-6 rounded-2xl border border-[#202A3A] bg-[#0C1119] p-5 sm:p-6">
          <h2 className="text-[15px] font-bold text-white">{t.referrals.yourLink}</h2>
          {link ? (
            <div className="mt-3 flex gap-2">
              <div className="min-w-0 flex-1 truncate rounded-[12px] border border-[#2A394D] bg-[#080B12] px-4 py-3.5 font-mono text-[13px] text-white" title={link} dir="ltr">
                {link}
              </div>
              <CopyPill text={link} label={t.dashboard.copyLink} />
            </div>
          ) : (
            <p className="mt-3 text-[14px] text-[#AAB5C7]">{t.ref.linkUnavailable}</p>
          )}
          {code && (
            <p className="mt-3 text-[13px] leading-relaxed text-[#78859A]">
              {t.ref.codePrefix} <span className="font-mono font-bold text-white">{code}</span> {t.ref.codeSuffix}
            </p>
          )}
          {link && (
            <div className="mt-3 flex flex-wrap gap-2" aria-label={t.ref.shareGroup}>
              {shareLinks(link, t.ref).map(({ label, href, Icon, ariaLabel }) => (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith('mailto:') ? undefined : '_blank'}
                  rel="noopener noreferrer"
                  aria-label={ariaLabel}
                  className="flex min-h-[44px] items-center gap-1.5 rounded-full border border-[#2A394D] bg-[#111722] px-4 text-[13px] font-semibold text-white transition hover:border-[rgba(47,214,255,0.5)] active:scale-[0.97]"
                >
                  {Icon ? <Icon size={15} aria-hidden="true" /> : <span aria-hidden="true" className="font-mono text-[13px] font-bold">𝕏</span>}
                  {label}
                </a>
              ))}
            </div>
          )}
          <div className="mt-5 grid grid-cols-2 gap-3 border-t border-[#202A3A] pt-5">
            <div>
              <div className="text-[13px] text-[#78859A]">{t.ref.yourEarned}</div>
              <div className="mt-1 font-mono text-[22px] font-bold text-white">{formatUSD(earned)}</div>
              <div className="mt-1 text-[12px] text-[#78859A]">{t.ref.paidInto}</div>
            </div>
            <div>
              <div className="text-[13px] text-[#78859A]">{t.ref.yourTeam}</div>
              <div className="mt-1 font-mono text-[22px] font-bold text-white">{team}</div>
              <div className="mt-1 text-[12px] text-[#78859A]">{team === 0 ? t.ref.nobody : `${team} ${team === 1 ? t.ref.memberWord : t.ref.membersWord}`}</div>
            </div>
          </div>
        </section>
      </Reveal>
      <div className="mt-4 space-y-4">
        {PROTOCOL_CONFIG.referralLevels.map((lv, i) => (
          <LevelCard key={lv.level} level={lv} members={referrals.filter((r) => r.level === lv.level)} index={i} />
        ))}
      </div>
      <p className="mt-5 text-[13px] leading-relaxed text-[#78859A]">
        {t.ref.commissionNote}{' '}
        <Link href="/app/referrals/earnings" className="font-semibold text-[#2FD6FF] hover:brightness-110">
          {t.ref.seeHistory}
        </Link>
      </p>
      <Reveal>
        <section aria-label="Banners with your link" className="mt-6 rounded-2xl border border-[#202A3A] bg-[#0C1119] p-5 sm:p-6">
          <div className="flex items-center gap-2.5">
            <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true" className="shrink-0">
              <rect x="1" y="1" width="20" height="20" rx="6" fill="#101724" stroke="#2A394D" />
              <rect x="6" y="11" width="2.4" height="5" rx="1.2" fill="#2FD6FF" opacity="0.45" />
              <rect x="9.8" y="8" width="2.4" height="8" rx="1.2" fill="#2FD6FF" opacity="0.7" />
              <rect x="13.6" y="5" width="2.4" height="11" rx="1.2" fill="#2FD6FF" />
            </svg>
            <h2 className="text-[15px] font-bold text-white">{t.ref.bannersTitle}</h2>
          </div>
          <p className="mt-1.5 text-[13px] leading-relaxed text-[#78859A]">
            {t.ref.bannersSub}
          </p>
        </section>
      </Reveal>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {BANNERS.map((b) => (
          <BannerCard key={b.id} bannerId={b} link={link} />
        ))}
      </div>
      {!link && (
        <p className="mt-3 text-[13px] text-[#78859A]">{t.ref.bannersNeed}</p>
      )}
    </div>
  );
}
