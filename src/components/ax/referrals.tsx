'use client';

// Referrals dashboard view. Everything renders from authoritative sources:
// profile referral code/link, referral rows + earnings from the database,
// commission rules from PROTOCOL_CONFIG.referralLevels, banner embeds from
// the central banner config. No invented members, earnings, or rates.

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Check, Copy, Mail, MessageCircle, Send } from 'lucide-react';
import { Reveal } from '@/components/Reveal';
import { PageHeader } from '@/components/data';
import { PROTOCOL_CONFIG } from '@/lib/config';
import { BANNERS, bannerEmbed } from '@/lib/banners';
import { formatUSD } from '@/lib/finance';
import type { ReferralRow } from '@/lib/queries';
import { cn } from '@/lib/utils';

function useCopied(): [boolean, (text: string) => void] {
  const [done, setDone] = useState(false);
  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      /* unavailable */
    }
    setDone(true);
    setTimeout(() => setDone(false), 2000);
  };
  return [done, copy];
}

function CopyPill({ text, label }: { text: string; label: string }) {
  const [done, copy] = useCopied();
  return (
    <button
      type="button"
      onClick={() => void copy(text)}
      aria-live="polite"
      aria-label={done ? 'Copied' : label}
      className={cn(
        'flex min-h-[48px] shrink-0 items-center gap-1.5 rounded-[12px] border px-4 text-[13px] font-bold transition active:scale-[0.97]',
        done
          ? 'border-[rgba(53,217,139,0.5)] text-[#35D98B]'
          : 'border-[#2A394D] text-white hover:border-[rgba(47,214,255,0.5)]'
      )}
    >
      {done ? <Check size={15} aria-hidden="true" /> : <Copy size={15} aria-hidden="true" />}
      {done ? 'Copied' : label}
    </button>
  );
}

const SHARE_TEXT = 'Join me on Axiora Protocol — structured plan modules with daily settlement.';

function shareLinks(link: string) {
  const u = encodeURIComponent(link);
  const t = encodeURIComponent(SHARE_TEXT);
  return [
    { label: 'WhatsApp', href: `https://wa.me/?text=${t}%20${u}`, Icon: MessageCircle },
    { label: 'Telegram', href: `https://t.me/share/url?url=${u}&text=${t}`, Icon: Send },
    { label: 'X', href: `https://x.com/intent/tweet?url=${u}&text=${t}`, Icon: null },
    { label: 'Email', href: `mailto:?subject=${encodeURIComponent('Join me on Axiora Protocol')}&body=${t}%20${u}`, Icon: Mail },
  ];
}

function LevelCard({ level, members, index }: {
  level: { level: number; instantPct: number; dailySharePct: number };
  members: ReferralRow[];
  index: number;
}) {
  const shown = members.slice(0, 5);
  const extra = members.length - shown.length;
  const desc =
    level.level === 1
      ? 'When someone signs up with your link or code, they land here.'
      : level.level === 2
        ? 'When someone your level 1 invites joins, they land here.'
        : 'Deeper network levels earn automatically under the same rules.';
  return (
    <Reveal delay={index * 80}>
      <section
        aria-label={`Referral level ${level.level}`}
        className="rounded-[20px] border border-[#202A3A] bg-[#0C1119] p-5 transition duration-200 hover:-translate-y-[3px] hover:border-[rgba(47,214,255,0.4)] sm:p-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-[17px] font-bold text-white">Level {level.level}</h2>
          <span
            className={cn(
              'rounded-full border px-3 py-1.5 font-mono text-[11px] font-semibold',
              level.level === 1
                ? 'border-[rgba(47,214,255,0.45)] bg-[rgba(47,214,255,0.08)] text-[#2FD6FF]'
                : 'border-[#2A394D] bg-[#111722] text-[#AAB5C7]'
            )}
          >
            {level.instantPct}% of deposits · {level.dailySharePct}% of earnings
          </span>
        </div>
        {members.length === 0 ? (
          <p className="mt-3 text-[14px] text-[#AAB5C7]">Nobody yet</p>
        ) : (
          <ul className="mt-3 divide-y divide-[#202A3A]/70">
            {shown.map((m) => (
              <li key={m.id} className="flex items-center justify-between gap-3 py-2.5 text-[14px]">
                <span className="flex items-center gap-2.5">
                  <span aria-hidden="true" className="grid h-8 w-8 place-items-center rounded-full border border-[#2A394D] bg-[#151B27] font-mono text-[12px] font-bold text-[#2FD6FF]">
                    {String(m.level).padStart(2, '0')}
                  </span>
                  <span className="text-white">Member</span>
                </span>
                <span className="font-mono text-[12px] text-[#78859A]">joined {m.createdAt.slice(0, 10)}</span>
              </li>
            ))}
          </ul>
        )}
        {extra > 0 && (
          <p className="mt-1 text-[13px] text-[#78859A]">
            +{extra} more · <Link href="/app/referrals/network" className="font-semibold text-[#2FD6FF]">Open network</Link>
          </p>
        )}
        <p className="mt-3 text-[13px] leading-relaxed text-[#78859A]">{desc}</p>
      </section>
    </Reveal>
  );
}

function BannerCard({ bannerId, link }: { bannerId: (typeof BANNERS)[number]; link: string | null }) {
  const [done, copy] = useCopied();
  const code = link ? bannerEmbed(bannerId, link) : '';
  return (
    <div className="overflow-hidden rounded-[20px] border border-[#202A3A] bg-[#0C1119] transition duration-200 hover:-translate-y-[2px] hover:border-[rgba(47,214,255,0.4)]">
      <div className="tech-dots flex items-center justify-center bg-[#070B13] p-6">
        <Image
          src={bannerId.file}
          alt={`${bannerId.title} preview`}
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
          {done ? <Check size={16} className="text-[#35D98B]" aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
          {done ? 'Copied' : 'Copy code'}
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
  const team = referrals.length;
  return (
    <div>
      <PageHeader
        title="Referrals"
        sub="Share your link. Each time someone you invited deposits or earns from a plan, a commission lands in your Earning wallet."
      />
      <Reveal>
        <section aria-label="Your referral link" className="mt-6 rounded-[20px] border border-[#202A3A] bg-[#0C1119] p-5 sm:p-6">
          <h2 className="text-[15px] font-bold text-white">Your referral link</h2>
          {link ? (
            <div className="mt-3 flex gap-2">
              <div className="min-w-0 flex-1 truncate rounded-[12px] border border-[#2A394D] bg-[#080B12] px-4 py-3.5 font-mono text-[13px] text-white" title={link}>
                {link}
              </div>
              <CopyPill text={link} label="Copy link" />
            </div>
          ) : (
            <p className="mt-3 text-[14px] text-[#AAB5C7]">Your referral link is unavailable for this account.</p>
          )}
          {code && (
            <p className="mt-3 text-[13px] leading-relaxed text-[#78859A]">
              Or give them your code <span className="font-mono font-bold text-white">{code}</span> — they can type it when they sign up.
            </p>
          )}
          {link && (
            <div className="mt-3 flex flex-wrap gap-2" aria-label="Share your link">
              {shareLinks(link).map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith('mailto:') ? undefined : '_blank'}
                  rel="noopener noreferrer"
                  aria-label={`Share on ${label}`}
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
              <div className="text-[13px] text-[#78859A]">Your earned</div>
              <div className="mt-1 font-mono text-[22px] font-bold text-white">{formatUSD(earned)}</div>
              <div className="mt-1 text-[12px] text-[#78859A]">Paid into your Earning wallet</div>
            </div>
            <div>
              <div className="text-[13px] text-[#78859A]">Your team</div>
              <div className="mt-1 font-mono text-[22px] font-bold text-white">{team}</div>
              <div className="mt-1 text-[12px] text-[#78859A]">{team === 0 ? 'Nobody yet' : `${team} member${team === 1 ? '' : 's'}`}</div>
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
        A commission is paid the moment it is earned, with no minimum.{' '}
        <Link href="/app/referrals/earnings" className="font-semibold text-[#2FD6FF] hover:brightness-110">
          See every commission in your history
        </Link>
      </p>
      <Reveal>
        <section aria-label="Banners with your link" className="mt-6 rounded-[20px] border border-[#202A3A] bg-[#0C1119] p-5 sm:p-6">
          <h2 className="text-[15px] font-bold text-white">Banners with your link</h2>
          <p className="mt-1.5 text-[13px] leading-relaxed text-[#78859A]">
            Each one already carries your referral link. Copy its code into a website, a blog or a forum signature.
          </p>
        </section>
      </Reveal>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {BANNERS.map((b) => (
          <BannerCard key={b.id} bannerId={b} link={link} />
        ))}
      </div>
      {!link && (
        <p className="mt-3 text-[13px] text-[#78859A]">Banner embed codes need your referral link, which is unavailable for this account.</p>
      )}
    </div>
  );
}
