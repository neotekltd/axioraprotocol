import { DemoBadge, Card } from '@/components/ui';

export const metadata = { title: 'Support' };

export default function SupportPage() {
  return (
    <div>
      <div className="flex items-center gap-3"><h1 className="text-2xl font-bold">Support</h1><DemoBadge /></div>
      <Card className="mt-6 p-6">
        <label className="text-xs text-fog">Subject</label>
        <input placeholder="How can we help?" className="mt-1 w-full rounded-xl border border-line bg-void px-4 py-3 text-sm outline-none focus:border-pulse" />
        <label className="mt-4 block text-xs text-fog">Message</label>
        <textarea rows={5} className="mt-1 w-full rounded-xl border border-line bg-void px-4 py-3 text-sm outline-none focus:border-pulse" />
        <button className="mt-4 rounded-xl bg-pulse px-6 py-2.5 text-sm font-bold text-black">Open ticket</button>
      </Card>
    </div>
  );
}
