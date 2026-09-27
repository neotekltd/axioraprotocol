import Link from 'next/link';
import { BLOG_POSTS } from '@/lib/mock';
import { notFound } from 'next/navigation';

export function generateStaticParams() {
  return BLOG_POSTS.map((p) => ({ slug: p.slug }));
}

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const post = BLOG_POSTS.find((p) => p.slug === params.slug);
  if (!post) notFound();
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 pt-28 pb-20">
      <div className="text-[11px] tracking-widest text-pulse">{post.category.toUpperCase()}</div>
      <h1 className="mt-3 text-4xl font-bold tracking-tight">{post.title}</h1>
      <div className="mt-3 text-xs text-fog">{post.date} · Axiora Protocol Research · ~4 min read</div>
      <div className="mt-8 rounded-2xl border border-line bg-panel p-8 text-mist/85 leading-relaxed">{post.body}</div>
      <div className="mt-8 text-sm font-bold">Related articles</div>
      <div className="mt-3 grid gap-3">
        {BLOG_POSTS.filter((p) => p.slug !== post.slug).slice(0, 2).map((p) => (
          <Link key={p.slug} href={`/blog/${p.slug}`} className="glass rounded-xl p-4 text-sm hover:border-pulse/40"><span className="font-semibold">{p.title}</span><span className="text-fog"> — {p.date}</span></Link>
        ))}
      </div>
    </div>
  );
}
