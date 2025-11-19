import { useState, useEffect, useCallback } from 'react';
import { BrowserProvider } from 'ethers';
import { useContracts, useContractsWithSigner, formatToken, parseToken } from './use-contracts';
import { useToast } from './use-toast';

interface VaultData {
  spDAOBalance: string;
  spDAOBalanceRaw: bigint;
  mUSDBalance: string;
  mUSDBalanceRaw: bigint;
  totalAssets: string;
  spyPrice: string;
  syntheticShares: string;
  isKYCCompleted: boolean;
  isBlocked: boolean;
  isPaused: boolean;
  delegate: string;
  votingPower: string;
  mUSDAllowance: bigint;
}

export function useVault(provider: BrowserProvider | null, address: string | null) {
  const [data, setData] = useState<VaultData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const contracts = useContracts(provider);
  const contractsWithSigner = useContractsWithSigner(provider, address);
  const { toast } = useToast();

  const fetchVaultData = useCallback(async () => {
    if (!contracts || !address) {
      setData(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [
        spDAOBalance,
        mUSDBalance,
        totalAssets,
        spyPrice,
        syntheticShares,
        isKYC,
        isBlocked,
        isPaused,
        delegate,
        votingPower,
        allowance,
      ] = await Promise.all([
        contracts.vault.balanceOf(address),
        contracts.mockUSD.balanceOf(address),
        contracts.vault.totalAssets(),
        contracts.oracle.latestAnswer(),
        contracts.vault.syntheticShareBalance(),
        contracts.vault.isKYCCompleted(address),
        contracts.vault.isSanctionsBlocked(address),
        contracts.vault.globalPause(),
        contracts.vault.delegates(address),
        contracts.vault.getVotes(address),
        contracts.mockUSD.allowance(address, contracts.vault.target),
      ]);

      setData({
        spDAOBalance: formatToken(spDAOBalance, 18),
        spDAOBalanceRaw: spDAOBalance,
        mUSDBalance: formatToken(mUSDBalance, 6),
        mUSDBalanceRaw: mUSDBalance,
        totalAssets: formatToken(totalAssets, 6),
        spyPrice: formatToken(spyPrice, 8),
        syntheticShares: formatToken(syntheticShares, 0),
        isKYCCompleted: isKYC,
        isBlocked,
        isPaused,
        delegate: delegate.toLowerCase() === address.toLowerCase() ? '' : delegate,
        votingPower: formatToken(votingPower, 18),
        mUSDAllowance: allowance,
      });
    } catch (err: any) {
      console.error('Error fetching vault data:', err);
      setError(err.message || 'Failed to fetch vault data');
    } finally {
      setIsLoading(false);
    }
  }, [contracts, address]);

  useEffect(() => {
    fetchVaultData();
  }, [fetchVaultData]);

  const claimFromFaucet = useCallback(async () => {
    if (!contractsWithSigner) {
      toast({
        title: "Error",
        description: "Please connect your wallet",
        variant: "destructive",
      });
      return;
    }

    try {
      const contract = await contractsWithSigner.mockUSD();
      const tx = await contract.faucet();
      
      toast({
        title: "Transaction Submitted",
        description: "Claiming 1000 mUSD from faucet...",
      });

      await tx.wait();
      
      toast({
        title: "Success",
        description: "1000 mUSD claimed from faucet!",
      });

      await fetchVaultData();
    } catch (err: any) {
      console.error('Error claiming from faucet:', err);
      toast({
        title: "Error",
        description: err.message || "Failed to claim from faucet",
        variant: "destructive",
      });
    }
  }, [contractsWithSigner, toast, fetchVaultData]);

  const approveUSD = useCallback(async (amount: string) => {
    if (!contractsWithSigner || !contracts) {
      toast({
        title: "Error",
        description: "Please connect your wallet",
        variant: "destructive",
      });
      return;
    }

    try {
      const contract = await contractsWithSigner.mockUSD();
      const amountBigInt = parseToken(amount, 6);
      const tx = await contract.approve(contracts.vault.target, amountBigInt);
      
      toast({
        title: "Transaction Submitted",
        description: "Approving mUSD...",
      });

      await tx.wait();
      
      toast({
        title: "Success",
        description: "mUSD approved successfully!",
      });

      await fetchVaultData();
    } catch (err: any) {
      console.error('Error approving USD:', err);
      toast({
        title: "Error",
        description: err.message || "Failed to approve mUSD",
        variant: "destructive",
      });
    }
  }, [contractsWithSigner, contracts, toast, fetchVaultData]);

  const deposit = useCallback(async (amount: string) => {
    if (!contractsWithSigner || !address) {
      toast({
        title: "Error",
        description: "Please connect your wallet",
        variant: "destructive",
      });
      return;
    }

    try {
      const contract = await contractsWithSigner.vault();
      const amountBigInt = parseToken(amount, 6);
      const tx = await contract.deposit(amountBigInt, address);
      
      toast({
        title: "Transaction Submitted",
        description: "Depositing into vault...",
      });

      await tx.wait();
      
      toast({
        title: "Success",
        description: `Deposited ${amount} mUSD into SPY Vault!`,
      });

      await fetchVaultData();
    } catch (err: any) {
      console.error('Error depositing:', err);
      toast({
        title: "Error",
        description: err.message || "Failed to deposit into vault",
        variant: "destructive",
      });
    }
  }, [contractsWithSigner, address, toast, fetchVaultData]);

  const withdraw = useCallback(async (amount: string) => {
    if (!contractsWithSigner || !address) {
      toast({
        title: "Error",
        description: "Please connect your wallet",
        variant: "destructive",
      });
      return;
    }

    try {
      const contract = await contractsWithSigner.vault();
      const amountBigInt = parseToken(amount, 6);
      const tx = await contract.withdraw(amountBigInt, address, address);
      
      toast({
        title: "Transaction Submitted",
        description: "Withdrawing from vault...",
      });

      await tx.wait();
      
      toast({
        title: "Success",
        description: `Withdrew ${amount} mUSD from SPY Vault!`,
      });

      await fetchVaultData();
    } catch (err: any) {
      console.error('Error withdrawing:', err);
      toast({
        title: "Error",
        description: err.message || "Failed to withdraw from vault",
        variant: "destructive",
      });
    }
  }, [contractsWithSigner, address, toast, fetchVaultData]);

  const delegateVotes = useCallback(async (delegatee: string) => {
    if (!contractsWithSigner) {
      toast({
        title: "Error",
        description: "Please connect your wallet",
        variant: "destructive",
      });
      return;
    }

    try {
      const contract = await contractsWithSigner.vault();
      const tx = await contract.delegate(delegatee);
      
      toast({
        title: "Transaction Submitted",
        description: "Delegating voting power...",
      });

      await tx.wait();
      
      toast({
        title: "Success",
        description: "Voting power delegated successfully!",
      });

      await fetchVaultData();
    } catch (err: any) {
      console.error('Error delegating:', err);
      toast({
        title: "Error",
        description: err.message || "Failed to delegate voting power",
        variant: "destructive",
      });
    }
  }, [contractsWithSigner, toast, fetchVaultData]);

  const completeKYC = useCallback(async () => {
    if (!contractsWithSigner || !address) {
      toast({
        title: "Error",
        description: "Please connect your wallet",
        variant: "destructive",
      });
      return;
    }

    try {
      const contract = await contractsWithSigner.vault();
      const tx = await contract.setComplianceStatus(address, true, false, "Self-approved for testing");
      
      toast({
        title: "Transaction Submitted",
        description: "Completing KYC verification...",
      });

      await tx.wait();
      
      toast({
        title: "Success",
        description: "KYC verification completed! You can now deposit/withdraw.",
      });

      await fetchVaultData();
    } catch (err: any) {
      console.error('Error completing KYC:', err);
      
      let errorMessage = "Failed to complete KYC.";
      
      if (err.message?.includes("AccessControl")) {
        errorMessage = "You don't have COMPLIANCE_ROLE permissions. Only the contract admin can approve KYC.";
      } else if (err.message?.includes("user rejected")) {
        errorMessage = "Transaction rejected by user.";
      } else if (err.shortMessage) {
        errorMessage = err.shortMessage;
      }
      
      toast({
        title: "KYC Approval Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [contractsWithSigner, address, toast, fetchVaultData]);

  return {
    data,
    isLoading,
    error,
    refresh: fetchVaultData,
    claimFromFaucet,
    approveUSD,
    deposit,
    withdraw,
    delegateVotes,
    completeKYC,
  };
}
