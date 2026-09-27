import Link from 'next/link';
import { Reveal } from '@/components/Reveal';

const QUESTIONS = [
  'What is Axiora Protocol?',
  'How does Axiora’s consensus architecture work?',
  'What assets does Axiora support?',
  'How does the AI agent system work?',
  'How is trading risk managed?',
  'How are protocol fees calculated?',
  'How do I fund my account?',
  'How do deployments work?',
  'How do withdrawals work?',
  'How does the referral program work?',
];

export function FaqSection() {
  return (
    <section className="pb-28 pt-8 md:pb-36">
      <div className="mx-auto max-w-3xl px-5 md:px-8">
        <Reveal className="text-center">
          <h2 className="t-h2 text-3xl">Questions</h2>
        </Reveal>
        <Reveal delay={100}>
          <div className="mt-10 divide-y divide-white/5 rounded-2xl border border-line bg-surface/50">
            {QUESTIONS.map((q) => (
              <details key={q} className="group px-6 py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between text-[0.9375rem] font-medium">
                  {q}
                  <span className="ml-4 text-pulse group-open:hidden">+</span>
                  <span className="ml-4 hidden text-pulse group-open:inline">−</span>
                </summary>
                <p className="mt-2.5 text-sm leading-relaxed text-fog">
                  Axiora-specific answer lives on the <Link className="text-pulse" href="/faq">FAQ page</Link>.
                  Demo accordion — production uses structured FAQPage schema.
                </p>
              </details>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
