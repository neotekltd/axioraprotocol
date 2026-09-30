import QRCode from 'qrcode';
import { DepositView } from '@/components/DepositView';
import { getDepositMethods, isValidDepositAddress } from '@/lib/deposits';
import { getTransactions } from '@/lib/queries';

export const metadata = { title: 'Deposit' };

export default async function DepositPage() {
  const [methods, txns] = await Promise.all([getDepositMethods(), getTransactions(20)]);
  const deposits = txns.filter((t) => t.type === 'deposit');
  // Server-rendered QR payloads: each encodes its method's exact on-chain
  // recipient address from the central deposit config — nothing else. No QR
  // is rendered for methods without a validated address.
  const qr: Record<string, string> = {};
  for (const m of methods) {
    if (isValidDepositAddress(m.id, m.depositAddress)) {
      try {
        qr[m.id] = await QRCode.toString(m.depositAddress, {
          type: 'svg',
          width: 220,
          margin: 1,
          color: { dark: '#000000', light: '#ffffff' },
        });
      } catch {
        // leave absent; UI shows unavailable state
      }
    }
  }
  return <DepositView methods={methods} deposits={deposits} qr={qr} />;
}
