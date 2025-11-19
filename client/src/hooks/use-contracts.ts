import { useMemo } from 'react';
import { BrowserProvider, Contract, formatUnits, parseUnits } from 'ethers';
import { 
  CONTRACTS, 
  MockUSD_ABI, 
  MockSPYOracle_ABI, 
  SPYVault_ABI, 
  SPYDAOGovernor_ABI 
} from '@/lib/contracts';

export function useContracts(provider: BrowserProvider | null) {
  const contracts = useMemo(() => {
    if (!provider) return null;

    return {
      mockUSD: new Contract(CONTRACTS.MockUSD, MockUSD_ABI, provider),
      oracle: new Contract(CONTRACTS.MockSPYOracle, MockSPYOracle_ABI, provider),
      vault: new Contract(CONTRACTS.SPYVault, SPYVault_ABI, provider),
      governor: new Contract(CONTRACTS.SPYDAOGovernor, SPYDAOGovernor_ABI, provider),
    };
  }, [provider]);

  return contracts;
}

export function useContractsWithSigner(provider: BrowserProvider | null, address: string | null) {
  const contracts = useMemo(() => {
    if (!provider || !address) return null;

    return {
      mockUSD: async () => {
        const signer = await provider.getSigner(address);
        return new Contract(CONTRACTS.MockUSD, MockUSD_ABI, signer);
      },
      oracle: async () => {
        const signer = await provider.getSigner(address);
        return new Contract(CONTRACTS.MockSPYOracle, MockSPYOracle_ABI, signer);
      },
      vault: async () => {
        const signer = await provider.getSigner(address);
        return new Contract(CONTRACTS.SPYVault, SPYVault_ABI, signer);
      },
      governor: async () => {
        const signer = await provider.getSigner(address);
        return new Contract(CONTRACTS.SPYDAOGovernor, SPYDAOGovernor_ABI, signer);
      },
    };
  }, [provider, address]);

  return contracts;
}

// Utility functions
export const formatToken = (value: bigint, decimals: number = 18) => {
  const result = formatUnits(value, decimals);
  console.log(`🔍 DEBUG formatToken: ${value.toString()} with ${decimals} decimals → "${result}"`);
  return result;
};

export const parseToken = (value: string, decimals: number = 18) => {
  return parseUnits(value, decimals);
};
