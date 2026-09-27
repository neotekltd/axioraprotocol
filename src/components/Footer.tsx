import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-line bg-panel/60 mt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14 grid gap-10 md:grid-cols-4">
        <div>
          <div className="text-sm font-bold tracking-tight">AXIORA PROTOCOL</div>
          <div className="text-[11px] tracking-[0.2em] text-fog mt-1">AUTONOMOUS INTELLIGENCE</div>
          <p className="mt-4 text-sm text-fog leading-relaxed">
            Original demo interface for a multi-agent consensus trading protocol. Not affiliated with any other Axiora product. No real funds move in this build.
          </p>
        </div>
        <div>
          <div className="text-xs font-semibold tracking-widest text-fog">PROTOCOL</div>
          <div className="mt-3 space-y-2 text-sm">
            <Link className="block text-mist/80 hover:text-white" href="/protocol">How it works</Link>
            <Link className="block text-mist/80 hover:text-white" href="/statistics">Statistics</Link>
            <Link className="block text-mist/80 hover:text-white" href="/calculator">Calculator</Link>
            <Link className="block text-mist/80 hover:text-white" href="/referrals">Referrals</Link>
          </div>
        </div>
        <div>
          <div className="text-xs font-semibold tracking-widest text-fog">RESOURCES</div>
          <div className="mt-3 space-y-2 text-sm">
            <Link className="block text-mist/80 hover:text-white" href="/blog">Blog</Link>
            <Link className="block text-mist/80 hover:text-white" href="/faq">FAQ</Link>
            <Link className="block text-mist/80 hover:text-white" href="/whitepaper">Whitepaper</Link>
            <Link className="block text-mist/80 hover:text-white" href="/investor-deck">Investor deck</Link>
          </div>
        </div>
        <div>
          <div className="text-xs font-semibold tracking-widest text-fog">LEGAL</div>
          <div className="mt-3 space-y-2 text-sm">
            <Link className="block text-mist/80 hover:text-white" href="/terms">Terms</Link>
            <Link className="block text-mist/80 hover:text-white" href="/privacy">Privacy</Link>
            <Link className="block text-mist/80 hover:text-white" href="/login">Log in</Link>
            <Link className="block text-mist/80 hover:text-white" href="/app/dashboard">Dashboard demo</Link>
          </div>
        </div>
      </div>
      <div className="border-t border-line py-5 text-center text-xs text-fog">
        © 2026 Axiora Protocol (demo). All figures shown are simulated demo data unless connected to a backend. Risk disclosure: trading involves loss.
      </div>
    </footer>
  );
}
