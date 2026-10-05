import { PageHeader, SectionCard, EmptyState } from '@/components/data';
import { SettingEditor } from '@/components/admin/forms';
import { getSettings } from '@/lib/admin';
import { getDict } from '@/lib/i18n-server';

export const metadata = { title: 'Admin settings' };

export default async function AdminSettings() {
  const t = getDict();
  const rows = await getSettings();
  return (
    <div>
      <PageHeader title={t.ax.settingsTitle} sub={t.ax.settingsSub} />
      {rows.length === 0 ? (
        <div className="mt-6"><EmptyState title={t.ax.noSettings} body={t.ax.settingsB} /></div>
      ) : (
        <SectionCard title={t.ax.settingsN.replace('{n}', String(rows.length))}>
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
