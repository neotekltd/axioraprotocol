import { DemoBadge, Card } from '@/components/ui';

export const metadata = { title: 'Profile' };

export default function ProfilePage() {
  return (
    <div>
      <div className="flex items-center gap-3"><h1 className="text-2xl font-bold">Profile</h1><DemoBadge /></div>
      <Card className="mt-6 p-6 space-y-4">
        <div><label className="text-xs text-fog">Email</label><div className="mt-1 rounded-xl border border-line bg-void px-4 py-3 text-sm">you@domain.com · verified ✓</div></div>
        <div><label className="text-xs text-fog">Display name</label><input defaultValue="Axiora Trader" className="mt-1 w-full rounded-xl border border-line bg-void px-4 py-3 text-sm outline-none focus:border-pulse" /></div>
        <button className="rounded-xl bg-pulse px-6 py-2.5 text-sm font-bold text-black">Save changes</button>
      </Card>
    </div>
  );
}
