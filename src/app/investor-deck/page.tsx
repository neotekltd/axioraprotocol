import { getDict } from '@/lib/i18n-server';

export const metadata = { title: 'Investor Deck' };
export default function DeckPage() {
  const t = getDict();
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 pt-40 pb-20">
      <h1 className="text-4xl font-bold tracking-tight">{t.pub.deckTitle}</h1>
      <div className="mt-6 grid gap-3 text-sm">
        {t.pub.deckItems.map((s) => (
          <div key={s} className="glass rounded-xl p-4 text-mist/85">{s}</div>
        ))}
      </div>
    </div>
  );
}
