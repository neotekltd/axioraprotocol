import { afterEach, describe, expect, it } from 'vitest';
import {
  configStatus,
  DEPOSIT_CONFIG,
  getDepositAddress,
  isConfigured,
  isValidDepositAddress,
  isValidTronAddress,
  isValidTxHash,
} from '@/lib/deposits';

const TRC20 = 'TX3VNFswkExvKDwq3BSSVmEbVWRR9gkwdk';
const EVM = '0x1234567890abcdef1234567890ABCDEF12345678';

const SAVED = { ...process.env };

afterEach(() => {
  for (const k of Object.keys(process.env)) {
    if (k.endsWith('_DEPOSIT_ADDRESS') && !(k in SAVED)) delete process.env[k];
  }
  for (const [k, v] of Object.entries(SAVED)) {
    if (k.endsWith('_DEPOSIT_ADDRESS')) {
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
  }
});

function setEnv(vars: Record<string, string>) {
  for (const id of Object.values(DEPOSIT_CONFIG)) delete process.env[id.envVar];
  Object.assign(process.env, vars);
}

describe('TRON address validation', () => {
  it('accepts the configured deposit wallet', () => {
    expect(isValidTronAddress('TX3VNFswkExvKDwq3BSSVmEbVWRR9gkwdk')).toBe(true);
  });

  it('accepts the USDT contract as a well-formed address', () => {
    expect(isValidTronAddress('TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t')).toBe(true);
  });

  it('rejects malformed input', () => {
    expect(isValidTronAddress('')).toBe(false);
    expect(isValidTronAddress('0xabc')).toBe(false);
    expect(isValidTronAddress('TX3VNFswkExvKDwq3BSSVmEbVWRR9gkwdkX')).toBe(false);
    // one char flipped -> checksum fails
    expect(isValidTronAddress('TX3VNFswkExvKDwq3BSSVmEbVWRR9gkwda')).toBe(false);
  });
});

describe('central deposit configuration', () => {
  it('USDT_TRC20 configured -> address available', () => {
    setEnv({ USDT_TRC20_DEPOSIT_ADDRESS: TRC20 });
    expect(isConfigured('USDT_TRC20')).toBe(true);
    expect(getDepositAddress('USDT_TRC20')).toBe(TRC20);
    expect(DEPOSIT_CONFIG.USDT_TRC20.blockchain).toBe('TRON');
    expect(DEPOSIT_CONFIG.USDT_TRC20.standard).toBe('TRC-20');
    expect(DEPOSIT_CONFIG.USDT_TRC20.decimals).toBe(6);
  });

  it('empty variables -> unavailable (no placeholders)', () => {
    setEnv({ USDT_TRC20_DEPOSIT_ADDRESS: TRC20 });
    for (const id of ['USDT_BEP20', 'USDT_ERC20', 'BNB', 'BTC', 'ETH', 'TRX', 'DOGE', 'LTC'] as const) {
      expect(isConfigured(id)).toBe(false);
      expect(getDepositAddress(id)).toBe('');
    }
  });

  it('adding one future address configures only that asset', () => {
    setEnv({ USDT_TRC20_DEPOSIT_ADDRESS: TRC20, BNB_DEPOSIT_ADDRESS: EVM });
    expect(isConfigured('BNB')).toBe(true);
    expect(getDepositAddress('BNB')).toBe(EVM);
    expect(getDepositAddress('USDT_TRC20')).toBe(TRC20);
    expect(isConfigured('USDT_BEP20')).toBe(false);
    expect(isConfigured('ETH')).toBe(false);
    const status = configStatus();
    expect(status.BNB).toBe(true);
    expect(status.USDT_TRC20).toBe(true);
    expect(status.USDT_ERC20).toBe(false);
  });

  it('rejects cross-network mixups (TRC20 address is not a valid ERC20 address)', () => {
    setEnv({ USDT_ERC20_DEPOSIT_ADDRESS: TRC20 });
    expect(isConfigured('USDT_ERC20')).toBe(false);
    expect(isValidDepositAddress('USDT_ERC20', TRC20)).toBe(false);
    expect(isValidDepositAddress('USDT_TRC20', TRC20)).toBe(true);
  });

  it('rejects malformed env addresses', () => {
    setEnv({ USDT_TRC20_DEPOSIT_ADDRESS: 'TX3VNFswkExvKDwq3BSSVmEbVWRR9gkwda' });
    expect(isConfigured('USDT_TRC20')).toBe(false);
    setEnv({ ETH_DEPOSIT_ADDRESS: '0xshort' });
    expect(isConfigured('ETH')).toBe(false);
  });

  it('unknown asset ids are never configured', () => {
    setEnv({ USDT_TRC20_DEPOSIT_ADDRESS: TRC20 });
    expect(getDepositAddress('USDT')).toBe('');
    expect(getDepositAddress('BNB_WALLET')).toBe('');
    expect(isConfigured('USDT')).toBe(false);
  });
});

describe('transaction hash validation', () => {
  const TRON_TX = 'a'.repeat(64);
  const EVM_TX = '0x' + 'b'.repeat(64);

  it('accepts TRON-shaped hashes for TRC20', () => {
    expect(isValidTxHash('USDT_TRC20', TRON_TX)).toBe(true);
    expect(isValidTxHash('TRX', TRON_TX.toUpperCase())).toBe(true);
  });

  it('accepts 0x hashes for EVM networks only', () => {
    expect(isValidTxHash('USDT_ERC20', EVM_TX)).toBe(true);
    expect(isValidTxHash('USDT_BEP20', EVM_TX)).toBe(true);
    expect(isValidTxHash('ETH', EVM_TX)).toBe(true);
    expect(isValidTxHash('USDT_TRC20', EVM_TX)).toBe(false);
    expect(isValidTxHash('USDT_TRC20', TRON_TX)).toBe(true);
  });

  it('rejects malformed hashes', () => {
    expect(isValidTxHash('USDT_TRC20', 'short')).toBe(false);
    expect(isValidTxHash('USDT_TRC20', '')).toBe(false);
    expect(isValidTxHash('USDT_ERC20', 'no-prefix' + 'c'.repeat(54))).toBe(false);
    expect(isValidTxHash('UNKNOWN', TRON_TX)).toBe(false);
  });
});
