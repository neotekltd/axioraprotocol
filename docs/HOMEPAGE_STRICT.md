# AXIORA HOMEPAGE — STRICT REFERENCE RECONSTRUCTION (handoff prompt)

NON-NEGOTIABLE RULE: the Axiora homepage MUST use the exact same SECTION
STRUCTURE and SECTION ORDER as the Aevos Protocol homepage
(reference: https://aevosprotocol.net/). NO CREATIVE LIBERTY. Do not invent,
remove, merge, split, reorder sections; no alternative layouts; no generic
equivalents. The reference IA is the specification.

EXACT ORDER (no sections between these):
01 HERO (nav, headline, copy, primary + secondary CTA, visual, metrics)
02 HOW CONVERGENCE WORKS (Signal/Risk/Execution/Sentiment, consensus, trade —
not a generic 4-column feature section)
03 BATTLE-TESTED PROTOCOL (editorial composition, spacing, metrics; Axiora content)
04 BEYOND SCRIPTS. TRADING BY CONSENSUS. (copy, consensus explanation, stats,
phone visual, CTA; left/right composition + scale preserved)
05 MODEL YOUR RETURNS (interactive calculator: term + amount controls; daily
yield, monthly estimate, net profit, total return, protocol fee, deploy CTA;
Axiora parameters — never a static pricing card)
06 BUSINESS MODEL (explanation + performance-fee copy, deck-style CTA area,
large visual)
07 THREE STEPS. FOUR AGENTS. (exactly 01 FUND / 02 DEPLOY / 03 EARN)
08 BUILT FOR CONSENSUS (Consensus-Driven Execution + Risk Agent + Transparent
Fee Model + Bank-Grade Security; asymmetric composition, NOT a 4-col grid)
09 EARN FROM YOUR REFERRAL NETWORK (explanation, instant + daily concepts,
levels table/viz, CTA, network viz; configurable Axiora economics)
10 BLOG INSIGHTS (exactly 3 cards desktop: image, date, title, excerpt, read;
Axiora articles/imagery)
11 QUESTIONS (centered accordion: width, rows, spacing, borders, type, behavior)
12 FOOTER (brand, nav, social, legal, copyright; Axiora info)

VISUAL RULE: structure + order fixed; composition closely reproduced — font,
weight, size, line-height, letter-spacing, colors, gradients, borders,
shadows, glow, section height/padding, content width, card/image dimensions +
position, CTA dimensions, grid gaps, whitespace, responsive behavior matched.
No stylistic substitutions.

BRAND RULE: AXIORA / AXIORA PROTOCOL only. No AEVOS marks, logos, proprietary
assets or artwork; Axiora-original assets in the same structural role.

COPY RULE: original Axiora copy at the same IA/density. No inherited financial
claims, fees, returns, registration or business promises.

RESPONSIVE RULE: mobile keeps the EXACT SAME 12-section order; reconstruct the
reference's responsive behavior (not generic stacked cards).

PROHIBITED unless explicitly requested: testimonials, pricing, features,
tokenomics, partners, roadmap, team, extra CTAs, newsletter, extra statistics
section, nav redesign, new page structure, reorders. Structure is LOCKED.

VALIDATION: npm run dev → capture desktop + mobile → compare to reference
(same count/order/hierarchy/density/rhythm/heights/composition/sequence, no
invented/missing sections) → npm run typecheck → npm run lint → npm run build.
Not complete until all pass.

Phone asset: contributor-supplied visual lives at
public/phone-protocol-stats.png (§04 slot); fallback CSS concept renders until
the file is placed. Figures baked into a supplied bitmap are that bitmap's
claims, not audited performance.
