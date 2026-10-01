import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/config';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE_URL;
  const pages = ['', '/protocol', '/statistics', '/calculator', '/referral-program', '/blog', '/faq', '/investor-deck', '/whitepaper', '/terms', '/privacy', '/login', '/register'];
  return pages.map((p) => ({ url: `${base}${p || '/'}`, lastModified: new Date(), changeFrequency: p === '' ? 'daily' : 'weekly', priority: p === '' ? 1 : 0.7 }));
}
