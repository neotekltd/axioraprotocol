export const metadata = { title: 'Privacy' };
export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 pt-28 pb-20">
      <h1 className="text-4xl font-bold tracking-tight">Privacy Policy (demo)</h1>
      <p className="mt-4 text-sm text-fog">Placeholder. Production must document data collection, cookies, analytics, retention, and jurisdiction-specific rights.</p>
      <div className="mt-6 text-sm text-mist/80 leading-relaxed">This demo stores nothing sensitive. Do not commit secrets, API keys or private keys to the repo. Use a secrets manager in production.</div>
    </div>
  );
}
