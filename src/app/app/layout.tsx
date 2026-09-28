import { AppNav } from '@/components/AppNav';

export const metadata = { title: 'App' };

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-6 sm:px-6 lg:pt-24">
      <div className="flex gap-6">
        <AppNav />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
