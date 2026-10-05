import { getDict } from '@/lib/i18n-server';

export const metadata = { title: 'Whitepaper' };
export default function WhitepaperPage() {
  const t = getDict();
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 pt-40 pb-20">
      <h1 className="text-4xl font-bold tracking-tight">{t.pub.wpTitle}</h1>
      <div className="mt-6 space-y-4 text-sm text-mist/80 leading-relaxed">
        {t.pub.wpItems.map((item) => (
          <p key={item}>{item}</p>
        ))}
        <p className="text-fog">{t.pub.wpNote}</p>
      </div>
    </div>
  );
}
