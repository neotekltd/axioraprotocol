// Server-side deposit-method registry. SINGLE SOURCE OF TRUTH chain:
// central DEPOSIT_CONFIG (metadata + env bootstrap) -> Supabase
// crypto_networks (admin-managed canonical records) -> UI. The legacy
// deposit_methods table is no longer read. Receiving addresses are PUBLIC
// (users send funds to them) — never confuse with secrets.

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
  memoRequired: boolean;
  memoLabel: string | null;
  confirmations: number | null;
  minimumDeposit: number | null;
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
    memoRequired: false,
    memoLabel: null,
    confirmations: null,
    minimumDeposit: null,
  };
}

// TXID / transaction-hash format validation per network family. This only
// checks SHAPE (64 hex chars; 0x-prefixed for EVM) — it never claims the
// transaction exists, matches, or is confirmed. Existence/ownership/amount
// verification happens in review, never on format alone.
export function isValidTxHash(assetId: string, hash: string): boolean {
  const h = (hash ?? '').trim();
  if (!((ASSET_IDS as readonly string[]).includes(assetId))) return false;
  switch (assetId) {
    case 'ETH':
    case 'BNB':
    case 'USDT_ERC20':
    case 'USDT_BEP20':
      return /^0x[0-9a-fA-F]{64}$/.test(h);
    default:
      return /^[0-9a-fA-F]{64}$/.test(h);
  }
}

// Served deposit methods: env bootstrap first (precedence), then the
// admin-managed crypto_networks records for assets with no env address.
// Every address is format-validated before it can appear; empties and
// disabled networks never surface.
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
    const [{ data: nets }, { data: assets }] = await Promise.all([
      supabase
        .from('crypto_networks')
        .select('id,asset_id,network_code,network_name,deposit_address,token_contract_address,memo_required,memo_label,confirmations_required,minimum_deposit,deposit_enabled,withdrawal_enabled')
        .eq('deposit_enabled', true),
      supabase.from('crypto_assets').select('id,symbol,name'),
    ]);
    const names = new Map<string, { symbol: string; name: string }>();
    for (const a of (assets ?? []) as Record<string, unknown>[]) {
      names.set(String(a.id), { symbol: String(a.symbol ?? ''), name: String(a.name ?? '') });
    }
    for (const r of (nets ?? []) as Record<string, unknown>[]) {
      const id = String(r.id ?? '');
      if (!((ASSET_IDS as readonly string[]).includes(id)) || covered.has(id as AssetId)) continue;
      const cfg = DEPOSIT_CONFIG[id as AssetId];
      const addr = String(r.deposit_address ?? '').trim();
      if (!addr || !isValidDepositAddress(id as AssetId, addr)) continue;
      const meta = names.get(String(r.asset_id ?? ''));
      out.push({
        ...methodFromConfig(id as AssetId, addr),
        asset: meta?.symbol || cfg.symbol,
        assetName: meta?.name || cfg.name,
        network: String(r.network_name ?? '') || cfg.network,
        standard: String(r.network_code ?? '') || cfg.standard,
        contractAddress: (r.token_contract_address as string | null) ?? cfg.contractAddress,
        memoRequired: Boolean(r.memo_required),
        memoLabel: (r.memo_label as string | null) ?? null,
        confirmations: typeof r.confirmations_required === 'number' ? r.confirmations_required : null,
        minimumDeposit: r.minimum_deposit != null ? Number(r.minimum_deposit) : null,
      });
      covered.add(id as AssetId);
    }
  } catch {
    // DB unavailable: env-configured methods still served.
  }
  return out.filter((m) => m.asset && m.depositAddress && m.enabled);
}
