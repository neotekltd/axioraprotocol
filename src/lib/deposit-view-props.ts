// Shared server-side props for the wallet deposit hub. BOTH /app/wallet
// (bottom-nav Wallet destination) and /app/deposit render the same
// DepositView from these props — one data path, no duplicate routes, no
// drift. Methods come from the central deposit config, QR payloads encode
// each method's exact on-chain address (nothing else), and only deposits
// are passed through for per-asset progress.
import QRCode from 'qrcode';
import { getDepositMethods, isValidDepositAddress, type DepositMethod } from '@/lib/deposits';
import { getTransactions, type WalletTxn } from '@/lib/queries';

export interface DepositViewProps {
  methods: DepositMethod[];
  deposits: WalletTxn[];
  qr: Record<string, string>;
}

export async function getDepositViewProps(): Promise<DepositViewProps> {
  const [methods, txns] = await Promise.all([getDepositMethods(), getTransactions(20)]);
  const deposits = txns.filter((t) => t.type === 'deposit');
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
  return { methods, deposits, qr };
}
