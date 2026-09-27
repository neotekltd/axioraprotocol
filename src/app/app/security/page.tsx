import { DemoBadge, Card } from '@/components/ui';

export const metadata = { title: 'Security' };

export default function SecurityPage() {
  return (
    <div>
      <div className="flex items-center gap-3"><h1 className="text-2xl font-bold">Security</h1><DemoBadge /></div>
      <Card className="mt-6 p-6 space-y-4">
        <div className="flex items-center justify-between text-sm"><span>Password</span><button className="rounded-lg border border-line px-4 py-1.5 text-xs">Change</button></div>
        <div className="flex items-center justify-between text-sm"><span>2FA (TOTP) — required for withdrawals</span><button className="rounded-lg border border-pulse/50 px-4 py-1.5 text-xs text-pulse">Enable</button></div>
        <div className="text-sm"><div className="text-fog">Active sessions</div><div className="mt-2 rounded-xl border border-line bg-void p-3 font-mono text-xs">This device · Windows · Sep 27 <button className="ml-3 text-danger">Revoke others</button></div></div>
        <div className="text-sm"><div className="text-fog">Login history</div><div className="mt-2 space-y-1 font-mono text-xs text-fog"><div>Sep 27 · 08:12 UTC · new login alert sent</div><div>Sep 26 · 19:44 UTC · recognized device</div></div></div>
      </Card>
    </div>
  );
}
