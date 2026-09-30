// Central deposit-address configuration — SINGLE SOURCE OF TRUTH for every
// supported deposit asset. Server-side only: this module reads process.env
// and the deposit_methods table; UI code must consume getDepositMethods() /
// getDepositAddress() and never scatter env reads or address literals.
//
// Receiving addresses are PUBLIC operational data (users send funds to
// them) — never confuse with secrets. No private keys exist anywhere here.
// Secrets (RESEND_API_KEY, SUPABASE_*, CLOUDFLARE_*) must never enter this
// module's outputs or any client bundle.
//
// Precedence: environment variable wins; the Supabase deposit_methods table
// is a fallback for assets with no env address. An asset is "configured"
// only when a non-empty, format-valid address exists.

import { createHash } from 'crypto';
import { createClient } from '@/lib/supabase/server';

// Canonical asset IDs. USDT variants are SEPARATE assets — never one "USDT"
// with a loosely attached network string (prevents wrong-network display).
export const ASSET_IDS = [
  'BTC',
  'BNB',
  'DOGE',
  'LTC',
  'ETH',
  'TRX',
  'USDT_TRC20',
  'USDT_BEP20',
  'USDT_ERC20',
] as const;

export type AssetId = (typeof ASSET_IDS)[number];

export interface AssetConfig {
  id: AssetId;
  symbol: string;
  name: string;
  network: string;
  standard: string;
  blockchain: string;
  decimals: number;
  contractAddress: string | null;
  envVar: string;
  icon: string | null;
  feeNote: string | null;
}

export const DEPOSIT_CONFIG: Record<AssetId, AssetConfig> = {
  BTC: {
    id: 'BTC', symbol: 'BTC', name: 'Bitcoin', network: 'Bitcoin', standard: 'Native',
    blockchain: 'Bitcoin', decimals: 8, contractAddress: null,
    envVar: 'BTC_DEPOSIT_ADDRESS', icon: null, feeNote: 'Bitcoin network fees apply. Minimum deposit $10.00.',
  },
  BNB: {
    id: 'BNB', symbol: 'BNB', name: 'BNB', network: 'BNB Smart Chain', standard: 'Native',
    blockchain: 'BNB Smart Chain', decimals: 18, contractAddress: null,
    envVar: 'BNB_DEPOSIT_ADDRESS', icon: null, feeNote: 'BNB Smart Chain network fees apply. Minimum deposit $10.00.',
  },
  DOGE: {
    id: 'DOGE', symbol: 'DOGE', name: 'Dogecoin', network: 'Dogecoin', standard: 'Native',
    blockchain: 'Dogecoin', decimals: 8, contractAddress: null,
    envVar: 'DOGE_DEPOSIT_ADDRESS', icon: null, feeNote: 'Dogecoin network fees apply. Minimum deposit $10.00.',
  },
  LTC: {
    id: 'LTC', symbol: 'LTC', name: 'Litecoin', network: 'Litecoin', standard: 'Native',
    blockchain: 'Litecoin', decimals: 8, contractAddress: null,
    envVar: 'LTC_DEPOSIT_ADDRESS', icon: null, feeNote: 'Litecoin network fees apply. Minimum deposit $10.00.',
  },
  ETH: {
    id: 'ETH', symbol: 'ETH', name: 'Ethereum', network: 'Ethereum', standard: 'Native',
    blockchain: 'Ethereum', decimals: 18, contractAddress: null,
    envVar: 'ETH_DEPOSIT_ADDRESS', icon: null, feeNote: 'Ethereum network fees apply. Minimum deposit $10.00.',
  },
  TRX: {
    id: 'TRX', symbol: 'TRX', name: 'TRON', network: 'TRON', standard: 'Native',
    blockchain: 'TRON', decimals: 6, contractAddress: null,
    envVar: 'TRX_DEPOSIT_ADDRESS', icon: null, feeNote: 'TRON network fees are paid in TRX. Minimum deposit $10.00.',
  },
  USDT_TRC20: {
    id: 'USDT_TRC20', symbol: 'USDT', name: 'Tether USD', network: 'TRON', standard: 'TRC-20',
    blockchain: 'TRON', decimals: 6, contractAddress: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
    envVar: 'USDT_TRC20_DEPOSIT_ADDRESS', icon: '/assets/tokens/usdt.png',
    feeNote: 'TRON network fees are paid in TRX. Minimum deposit $10.00.',
  },
  USDT_BEP20: {
    id: 'USDT_BEP20', symbol: 'USDT', name: 'Tether USD', network: 'BNB Smart Chain', standard: 'BEP-20',
    blockchain: 'BNB Smart Chain', decimals: 18, contractAddress: null,
    envVar: 'USDT_BEP20_DEPOSIT_ADDRESS', icon: '/assets/tokens/usdt.png',
    feeNote: 'BNB Smart Chain network fees apply. Minimum deposit $10.00.',
  },
  USDT_ERC20: {
    id: 'USDT_ERC20', symbol: 'USDT', name: 'Tether USD', network: 'Ethereum', standard: 'ERC-20',
    blockchain: 'Ethereum', decimals: 18, contractAddress: null,
    envVar: 'USDT_ERC20_DEPOSIT_ADDRESS', icon: '/assets/tokens/usdt.png',
    feeNote: 'Ethereum network fees apply. Minimum deposit $10.00.',
  },
} as const;

// TRON Base58Check validation (0x41 prefix + checksum). Format check only —
// it does not prove wallet ownership.
export function isValidTronAddress(addr: string): boolean {
  const ALPH = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  if (!/^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(addr)) return false;
  try {
    let num = BigInt(0);
    for (const ch of addr) num = num * BigInt(58) + BigInt(ALPH.indexOf(ch));
    let hex = num.toString(16);
    if (hex.length % 2) hex = '0' + hex;
    let buf = Buffer.from(hex, 'hex');
    let lead = 0;
    for (const ch of addr) {
      if (ch === '1') lead++;
      else break;
    }
    buf = Buffer.concat([Buffer.alloc(lead), buf]);
    if (buf.length !== 25 || buf[0] !== 0x41) return false;
    const h1 = createHash('sha256').update(buf.slice(0, 21)).digest();
    const h2 = createHash('sha256').update(h1).digest().slice(0, 4);
    return buf.slice(21).equals(h2);
  } catch {
    return false;
  }
}

function isValidEvmAddress(addr: string): boolean {
  return /^0x[0-9a-fA-F]{40}$/.test(addr);
}

function isValidBtcAddress(addr: string): boolean {
  return /^(bc1[ac-hj-np-z02-9]{11,71}|[13][a-km-zA-HJ-NP-Z1-9]{25,34})$/.test(addr);
}

function isValidLtcAddress(addr: string): boolean {
  return /^(ltc1[ac-hj-np-z02-9]{11,71}|[LM3][a-km-zA-HJ-NP-Z1-9]{25,34})$/.test(addr);
}

function isValidDogeAddress(addr: string): boolean {
  return /^D[1-9A-HJ-NP-Za-km-z]{33}$/.test(addr);
}

// Format validation appropriate to the asset's network. Rejects obviously
// malformed input; never claims to prove wallet ownership.
export function isValidDepositAddress(assetId: AssetId, address: string): boolean {
  const addr = (address ?? '').trim();
  if (!addr) return false;
  switch (assetId) {
    case 'BTC':
      return isValidBtcAddress(addr);
    case 'LTC':
      return isValidLtcAddress(addr);
    case 'DOGE':
      return isValidDogeAddress(addr);
    case 'ETH':
    case 'BNB':
    case 'USDT_ERC20':
    case 'USDT_BEP20':
      return isValidEvmAddress(addr);
    case 'TRX':
    case 'USDT_TRC20':
      return isValidTronAddress(addr);
    default:
      return false;
  }
}

// THE single helper for reading a deposit address. Returns the trimmed env
// address when format-valid, otherwise "". Unknown ids return "".
export function getDepositAddress(assetId: string): string {
  if (!((ASSET_IDS as readonly string[]).includes(assetId))) return '';
  const id = assetId as AssetId;
  const raw = (process.env[DEPOSIT_CONFIG[id].envVar] ?? '').trim();
  return isValidDepositAddress(id, raw) ? raw : '';
}

// An asset is configured only when its address exists AND is format-valid.
export function isConfigured(assetId: string): boolean {
  return getDepositAddress(assetId) !== '';
}

// Diagnostics-safe snapshot: booleans only, never addresses. Log this, not
// the addresses themselves.
export function configStatus(): Record<AssetId, boolean> {
  const out = {} as Record<AssetId, boolean>;
  for (const id of ASSET_IDS) out[id] = isConfigured(id);
  return out;
}

export interface DepositMethod {
  id: AssetId;
  asset: string;
  assetName: string;
  network: string;
  standard: string;
  contractAddress: string | null;
  decimals: number | null;
  depositAddress: string;
  enabled: boolean;
  icon: string | null;
  feeNote: string | null;
}

function methodFromConfig(id: AssetId, address: string): DepositMethod {
  const c = DEPOSIT_CONFIG[id];
  return {
    id,
    asset: c.symbol,
    assetName: c.name,
    network: c.network,
    standard: c.standard,
    contractAddress: c.contractAddress,
    decimals: c.decimals,
    depositAddress: address,
    enabled: true,
    icon: c.icon,
    feeNote: c.feeNote,
  };
}

// Served deposit methods: env config first (precedence), Supabase
// deposit_methods table as fallback for assets with no env address. Every
// address is format-validated before it can appear; empties never surface.
export async function getDepositMethods(): Promise<DepositMethod[]> {
  const out: DepositMethod[] = [];
  const covered = new Set<AssetId>();
  for (const id of ASSET_IDS) {
    const addr = getDepositAddress(id);
    if (addr) {
      out.push(methodFromConfig(id, addr));
      covered.add(id);
    }
  }
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('deposit_methods')
      .select('asset,asset_name,network,standard,contract_address,decimals,deposit_address,enabled')
      .eq('enabled', true);
    if (!error && data) {
      for (const r of data as Record<string, unknown>[]) {
        const asset = String(r.asset ?? '');
        const network = String(r.network ?? '');
        const standard = String(r.standard ?? '');
        const addr = String(r.deposit_address ?? '').trim();
        if (!asset || !addr) continue;
        const match = (Object.keys(DEPOSIT_CONFIG) as AssetId[]).find(
          (id) =>
            !covered.has(id) &&
            DEPOSIT_CONFIG[id].symbol === asset &&
            DEPOSIT_CONFIG[id].network === network &&
            DEPOSIT_CONFIG[id].standard === standard &&
            isValidDepositAddress(id, addr)
        );
        if (match) {
          const base = methodFromConfig(match, addr);
          out.push({
            ...base,
            assetName: String(r.asset_name ?? '') || base.assetName,
            contractAddress: (r.contract_address as string | null) ?? base.contractAddress,
            decimals: typeof r.decimals === 'number' ? r.decimals : base.decimals,
          });
          covered.add(match);
        }
      }
    }
  } catch {
    // DB unavailable: env-configured methods still served.
  }
  return out.filter((m) => m.asset && m.depositAddress && m.enabled);
}
