import Link from 'next/link';
import { BLOG_POSTS } from '@/lib/mock';
import { notFound } from 'next/navigation';
import { getDict } from '@/lib/i18n-server';

export function generateStaticParams() {
  return BLOG_POSTS.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const post = BLOG_POSTS.find((p) => p.slug === params.slug);
  if (!post) return { title: 'Article not found' };
  return { title: post.title, description: post.excerpt, alternates: { canonical: `/blog/${params.slug}` } };
}

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const t = getDict();
  const post = BLOG_POSTS.find((p) => p.slug === params.slug);
  if (!post) notFound();
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 pt-40 pb-20">
      <div dir="ltr" className="text-left text-[11px] tracking-widest text-pulse">{post.category.toUpperCase()}</div>
      <h1 className="mt-3 text-4xl font-bold tracking-tight">{post.title}</h1>
      <div dir="ltr" className="mt-3 text-left text-xs text-fog">{post.date} · {t.pub.blogBy} · {t.pub.blogReadTime}</div>
      <div dir="ltr" className="mt-8 rounded-2xl border border-line bg-panel p-8 text-left text-mist/85 leading-relaxed">{post.body}</div>
      <div className="mt-8 text-sm font-bold">{t.pub.blogRel}</div>
      <div className="mt-3 grid gap-3">
        {BLOG_POSTS.filter((p) => p.slug !== post.slug).slice(0, 2).map((p) => (
          <Link key={p.slug} href={`/blog/${p.slug}`} className="glass rounded-xl p-4 text-sm hover:border-pulse/40"><span className="font-semibold">{p.title}</span><span className="text-fog"> — {p.date}</span></Link>
        ))}
      </div>
    </div>
  );
}
