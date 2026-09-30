// Central banner configuration. Previews and embed codes reference REAL
// static assets in public/assets/banners (original Axiora artwork).
// One source — no duplicated embed HTML across components.

import { SITE_URL } from '@/lib/config';

export interface BannerDef {
  id: string;
  title: string;
  width: number;
  height: number;
  file: string;
  sizeLabel: string;
  blurb: string;
}

export const BANNERS: BannerDef[] = [
  {
    id: 'leaderboard',
    title: 'Leaderboard 728×90',
    width: 728,
    height: 90,
    file: '/assets/banners/leaderboard-728x90.svg',
    sizeLabel: '728 × 90 · SVG · 1.1 KB',
    blurb: 'Fits a page header or the top of an article.',
  },
  {
    id: 'rectangle',
    title: 'Medium rectangle 300×250',
    width: 300,
    height: 250,
    file: '/assets/banners/rectangle-300x250.svg',
    sizeLabel: '300 × 250 · SVG · 1.2 KB',
    blurb: 'Fits a sidebar or inside an article.',
  },
  {
    id: 'button',
    title: 'Button 125×125',
    width: 125,
    height: 125,
    file: '/assets/banners/button-125x125.svg',
    sizeLabel: '125 × 125 · SVG · 0.8 KB',
    blurb: 'Fits a sidebar or inside an article.',
  },
];

export function bannerEmbed(b: BannerDef, referralUrl: string): string {
  const src = `${SITE_URL}${b.file}`;
  return `<a href="${referralUrl}"><img src="${src}" width="${b.width}" height="${b.height}" alt="Axiora Protocol"></a>`;
}
