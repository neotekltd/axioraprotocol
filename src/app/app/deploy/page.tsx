import { DeployForm } from '@/components/DeployForm';
import { getPortfolioSummary } from '@/lib/queries';

export const metadata = { title: 'Deploy' };

export default async function DeployPage() {
  const summary = await getPortfolioSummary();
  return <DeployForm available={summary.available} hasFunds={summary.available >= 10} />;
}
