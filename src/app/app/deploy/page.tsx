import { InvestHub } from '@/components/invest/InvestHub';
import { getActivePlans, getDeployments, getPortfolioSummary, getProtocolStats } from '@/lib/queries';

export const metadata = { title: 'Deploy' };

// Canonical Invest destination (bottom-nav Invest + desktop rail Deploy):
// tabbed hub — Plans (default), My investments, Statistics — all from
// authoritative server reads. No /plan parallel route.
export default async function DeployPage() {
  const [summary, activePlans, deployments, stats] = await Promise.all([
    getPortfolioSummary(),
    getActivePlans(),
    getDeployments(),
    getProtocolStats(),
  ]);
  return (
    <InvestHub
      available={summary.available}
      hasFunds={summary.available >= 10}
      activePlans={activePlans}
      deployments={deployments}
      stats={stats}
    />
  );
}
