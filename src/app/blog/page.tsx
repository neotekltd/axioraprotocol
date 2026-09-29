import Link from 'next/link';
import { BLOG_POSTS } from '@/lib/mock';
import { SectionEyebrow, SectionTitle } from '@/components/ui';

export const metadata = {
  title: 'Blog',
  description: 'Axiora research and updates: consensus trading, risk engineering and protocol design.',
  alternates: { canonical: '/blog' },
};

export default function BlogPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-28 pb-20">
      <SectionEyebrow>RESEARCH & UPDATES</SectionEyebrow>
      <SectionTitle>Blog</SectionTitle>
      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {BLOG_POSTS.map((p) => (
          <Link key={p.slug} href={`/blog/${p.slug}`} className="glass rounded-2xl p-6 hover:border-pulse/40">
            <div className="text-[11px] tracking-widest text-fog">{p.date} · {p.category.toUpperCase()}</div>
            <div className="mt-2 font-bold text-lg leading-snug">{p.title}</div>
            <p className="mt-2 text-sm text-fog">{p.excerpt}</p>
            <div className="mt-3 text-sm text-pulse">Read article →</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
