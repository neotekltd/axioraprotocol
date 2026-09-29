import { SupportView } from '@/components/SupportView';
import { getSupportTickets } from '@/lib/queries';

export const metadata = { title: 'Support' };

export default async function SupportPage() {
  const tickets = await getSupportTickets();
  return <SupportView tickets={tickets} />;
}
