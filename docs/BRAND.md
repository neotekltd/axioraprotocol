# Axiora Protocol — Brand + Visual Identity Specification

**Entity:** always "Axiora Protocol" in full on first reference; "Axiora" short form only after. Never present as, or adjacent to, any other Axiora-branded product. Positioning: **Autonomous Intelligence for Crypto Markets**.

## 1. Brand architecture

```text
AXIORA PROTOCOL
├── Protocol (/protocol)
├── How It Works (#how on /)
├── Statistics (/statistics)
├── Calculator (/calculator)
├── Trading (app: /app/dashboard, /app/trades)
├── AI Agents (/protocol#agents)
├── Referrals (/referrals, /app/referrals)
├── Documentation (/whitepaper, /investor-deck)
├── Research (/blog)
└── App (/login, /register, /app/dashboard)
```

## 2. Visual identity

- **Theme:** dark / minimal / technical. Background near-black green-tinted `#05070B`; panel `#0B0F16`; surface `#111722`; edge `#1E293B`; hairline `rgba(148,163,184,0.14)`.
- **Accent:** electric green `#34F5A5` (text-glow `0 0 24px rgba(52,245,165,.35)`, card shadow `0 0 40px rgba(52,245,165,.15)`). Positive green, negative `#FF5C5C`, warning `#FBBF24`.
- **Typography:** modern grotesk / geometric sans — Inter first (Geist/Manrope fallbacks). Hero 72–96px desktop / 42–52 mobile; section 48–64; heading 32–44; body 16–18; dashboard 13–16. Mono for figures: JetBrains Mono/ui-monospace.
- **Cards:** 1px hairline border, 16–24px radius, translucent dark glass + backdrop blur; hover border→accent, translateY(-2px); subtle shadows only.
- **Symbol/logo direction:** abstract "A" built from converging nodes (Signal/Risk/Execution/Sentiment → consensus point), never a copied mark. Wordmark `AXIORA PROTOCOL` + micro-caption `AUTONOMOUS INTELLIGENCE`. Current scaffold uses a Zap glyph placeholder in a green-tinted rounded square — replace with the final node-A mark in Phase 3 without changing geometry/spacing.
- **Imagery:** original low-poly dark-graphite geometry with emerald rim light, fog, green particles (hero market core, trading machine, liquidity towers). No reference-site assets. 3D isolated to small lazy-loaded scenes; page remains readable with WebGL disabled.
- **Motion language:** slow ambient glow/particles; consensus pulses traveling agent→consensus→trade; count-ups on viewport entry; calculator interpolation; progressive line-draw charts; referral lines animating outward; scroll reveals `opacity 0→1, translateY 20→0, 400–700ms, stagger 50–100ms`. Respect `prefers-reduced-motion`.

## 3. Voice + copy rules

Institutional, precise, no hype. Never promise yield; never present demo figures as performance; always label simulations DEMO. Fee/referral figures come from config/docs, never copied from another protocol.

## 4. SEO/identity hygiene

Canonical brand string "Axiora Protocol"; Organization JSON-LD; distinct favicon/OG art (node-A); no keyword collision tactics with unrelated Axiora products.
