import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://example.com';
  const pages = ['', '/protocol', '/statistics', '/calculator', '/referrals', '/blog', '/faq', '/investor-deck', '/whitepaper', '/terms', '/privacy', '/login', '/register'];
  return pages.map((p) => ({ url: `${base}${p || '/'}`, lastModified: new Date(), changeFrequency: p === '' ? 'daily' : 'weekly', priority: p === '' ? 1 : 0.7 }));
}
