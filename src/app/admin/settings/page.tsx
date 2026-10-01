import { PageHeader, SectionCard, EmptyState } from '@/components/data';
import { SettingEditor } from '@/components/admin/forms';
import { getSettings } from '@/lib/admin';

export const metadata = { title: 'Admin settings' };

export default async function AdminSettings() {
  const rows = await getSettings();
  return (
    <div>
      <PageHeader title="Settings" sub="Platform key/value configuration. Critical changes require care — every save is audited." />
      {rows.length === 0 ? (
        <div className="mt-6"><EmptyState title="No settings" body="Platform settings will appear here." /></div>
      ) : (
        <SectionCard title={`${rows.length} settings`}>
          <div className="divide-y divide-[#202A3A]/70">
            {rows.map((s) => (
              <SettingEditor key={s.key} settingKey={s.key} value={s.value} />
            ))}
          </div>
        </SectionCard>
      )}
    </div>
  );
}
