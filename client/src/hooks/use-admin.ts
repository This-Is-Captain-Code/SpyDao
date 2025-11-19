import { useState, useEffect, useCallback } from 'react';
import { BrowserProvider } from 'ethers';
import { useContracts, useContractsWithSigner, formatToken, parseToken } from './use-contracts';
import { useToast } from './use-toast';
import { CONTRACTS } from '@/lib/contracts';

interface BrokerWithdrawalData {
  pendingAmount: string;
  pendingTime: string;
  maxSingleWithdrawal: string;
  canExecute: boolean;
  timeRemaining: number;
}

interface AdminData {
  hasAdminRole: boolean;
  hasExecutorRole: boolean;
  hasComplianceRole: boolean;
  brokerWithdrawal: BrokerWithdrawalData | null;
}

const ADMIN_ROLE = '0x0000000000000000000000000000000000000000000000000000000000000000';
const EXECUTOR_ROLE = '0x' + Buffer.from('EXECUTOR_ROLE').toString('hex').padEnd(64, '0');
const COMPLIANCE_ROLE = '0x' + Buffer.from('COMPLIANCE_ROLE').toString('hex').padEnd(64, '0');

export function useAdmin(provider: BrowserProvider | null, address: string | null) {
  const [data, setData] = useState<AdminData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const contracts = useContracts(provider);
  const contractsWithSigner = useContractsWithSigner(provider, address);
  const { toast } = useToast();

  const fetchAdminData = useCallback(async () => {
    if (!contracts || !address) {
      setData(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // For simplicity, we'll check roles using hasRole from AccessControl
      // In a production app, you'd add these functions to the ABI
      const [
        pendingAmount,
        pendingTime,
        maxWithdrawal,
      ] = await Promise.all([
        contracts.vault.pendingWithdrawalAmount(),
        contracts.vault.pendingWithdrawalTime(),
        contracts.vault.maxSingleWithdrawal(),
      ]);

      const WITHDRAWAL_DELAY = 2 * 24 * 60 * 60; // 2 days in seconds
      const now = Math.floor(Date.now() / 1000);
      const canExecute = pendingAmount > 0n && pendingTime > 0n && now >= Number(pendingTime) + WITHDRAWAL_DELAY;
      const timeRemaining = pendingTime > 0n 
        ? Math.max(0, Number(pendingTime) + WITHDRAWAL_DELAY - now)
        : 0;

      setData({
        hasAdminRole: true, // Simplified - assume deployer has all roles
        hasExecutorRole: true,
        hasComplianceRole: true,
        brokerWithdrawal: {
          pendingAmount: formatToken(pendingAmount, 6),
          pendingTime: pendingTime.toString(),
          maxSingleWithdrawal: formatToken(maxWithdrawal, 6),
          canExecute,
          timeRemaining,
        },
      });
    } catch (err: any) {
      console.error('Error fetching admin data:', err);
      setError(err.message || 'Failed to fetch admin data');
    } finally {
      setIsLoading(false);
    }
  }, [contracts, address]);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  // Oracle functions
  const setOraclePrice = useCallback(async (priceUSD: string) => {
    if (!contractsWithSigner) {
      toast({
        title: "Error",
        description: "Please connect your wallet",
        variant: "destructive",
      });
      return;
    }

    try {
      const contract = await contractsWithSigner.oracle();
      // Convert USD price to 8 decimals (e.g., 480.50 -> 48050000000)
      const priceWith8Decimals = parseToken(priceUSD, 8);
      const tx = await contract.setPrice(priceWith8Decimals);
      
      toast({
        title: "Transaction Submitted",
        description: "Setting oracle price...",
      });

      await tx.wait();
      
      toast({
        title: "Success",
        description: `Oracle price set to $${priceUSD}`,
      });

      await fetchAdminData();
    } catch (err: any) {
      console.error('Error setting oracle price:', err);
      toast({
        title: "Error",
        description: err.message || "Failed to set oracle price",
        variant: "destructive",
      });
    }
  }, [contractsWithSigner, toast, fetchAdminData]);

  // Vault admin functions
  const setSyntheticHoldings = useCallback(async (amount: string, reason: string) => {
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
      const tx = await contract.setSyntheticHoldings(amount, reason);
      
      toast({
        title: "Transaction Submitted",
        description: "Updating synthetic holdings...",
      });

      await tx.wait();
      
      toast({
        title: "Success",
        description: `Synthetic holdings updated to ${amount}`,
      });

      await fetchAdminData();
    } catch (err: any) {
      console.error('Error setting synthetic holdings:', err);
      toast({
        title: "Error",
        description: err.message || "Failed to set synthetic holdings",
        variant: "destructive",
      });
    }
  }, [contractsWithSigner, toast, fetchAdminData]);

  const scheduleBrokerWithdrawal = useCallback(async (amount: string) => {
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
      const amountBigInt = parseToken(amount, 6);
      const tx = await contract.scheduleBrokerWithdrawal(amountBigInt);
      
      toast({
        title: "Transaction Submitted",
        description: "Scheduling broker withdrawal...",
      });

      await tx.wait();
      
      toast({
        title: "Success",
        description: `Scheduled withdrawal of ${amount} mUSD (can execute in 2 days)`,
      });

      await fetchAdminData();
    } catch (err: any) {
      console.error('Error scheduling withdrawal:', err);
      toast({
        title: "Error",
        description: err.message || "Failed to schedule withdrawal",
        variant: "destructive",
      });
    }
  }, [contractsWithSigner, toast, fetchAdminData]);

  const executeBrokerWithdrawal = useCallback(async () => {
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
      const tx = await contract.executeBrokerWithdrawal();
      
      toast({
        title: "Transaction Submitted",
        description: "Executing broker withdrawal...",
      });

      await tx.wait();
      
      toast({
        title: "Success",
        description: "Broker withdrawal executed successfully!",
      });

      await fetchAdminData();
    } catch (err: any) {
      console.error('Error executing withdrawal:', err);
      toast({
        title: "Error",
        description: err.message || "Failed to execute withdrawal",
        variant: "destructive",
      });
    }
  }, [contractsWithSigner, toast, fetchAdminData]);

  const cancelBrokerWithdrawal = useCallback(async () => {
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
      const tx = await contract.cancelWithdrawal();
      
      toast({
        title: "Transaction Submitted",
        description: "Cancelling broker withdrawal...",
      });

      await tx.wait();
      
      toast({
        title: "Success",
        description: "Broker withdrawal cancelled",
      });

      await fetchAdminData();
    } catch (err: any) {
      console.error('Error cancelling withdrawal:', err);
      toast({
        title: "Error",
        description: err.message || "Failed to cancel withdrawal",
        variant: "destructive",
      });
    }
  }, [contractsWithSigner, toast, fetchAdminData]);

  const setMaxSingleWithdrawal = useCallback(async (maxAmount: string) => {
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
      const amountBigInt = parseToken(maxAmount, 6);
      const tx = await contract.setMaxSingleWithdrawal(amountBigInt);
      
      toast({
        title: "Transaction Submitted",
        description: "Updating max withdrawal limit...",
      });

      await tx.wait();
      
      toast({
        title: "Success",
        description: `Max single withdrawal set to ${maxAmount} mUSD`,
      });

      await fetchAdminData();
    } catch (err: any) {
      console.error('Error setting max withdrawal:', err);
      toast({
        title: "Error",
        description: err.message || "Failed to set max withdrawal",
        variant: "destructive",
      });
    }
  }, [contractsWithSigner, toast, fetchAdminData]);

  const setComplianceStatus = useCallback(async (
    userAddress: string,
    kycCompleted: boolean,
    blocked: boolean,
    reason: string
  ) => {
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
      const tx = await contract.setComplianceStatus(userAddress, kycCompleted, blocked, reason);
      
      toast({
        title: "Transaction Submitted",
        description: "Updating compliance status...",
      });

      await tx.wait();
      
      toast({
        title: "Success",
        description: `Compliance status updated for ${userAddress}`,
      });

      await fetchAdminData();
    } catch (err: any) {
      console.error('Error setting compliance status:', err);
      toast({
        title: "Error",
        description: err.message || "Failed to set compliance status",
        variant: "destructive",
      });
    }
  }, [contractsWithSigner, toast, fetchAdminData]);

  const setGlobalPause = useCallback(async (paused: boolean) => {
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
      const tx = await contract.setGlobalPause(paused);
      
      toast({
        title: "Transaction Submitted",
        description: paused ? "Pausing vault..." : "Unpausing vault...",
      });

      await tx.wait();
      
      toast({
        title: "Success",
        description: paused ? "Vault paused globally" : "Vault unpaused",
      });

      await fetchAdminData();
    } catch (err: any) {
      console.error('Error setting global pause:', err);
      toast({
        title: "Error",
        description: err.message || "Failed to set global pause",
        variant: "destructive",
      });
    }
  }, [contractsWithSigner, toast, fetchAdminData]);

  // Governance rewards functions
  const approveRewardToken = useCallback(async (amount: string) => {
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
      const amountBigInt = parseToken(amount, 6);
      const tx = await contract.approve(CONTRACTS.SPYDAOGovernor, amountBigInt);
      
      toast({
        title: "Transaction Submitted",
        description: "Approving mUSD for rewards...",
      });

      await tx.wait();
      
      toast({
        title: "Success",
        description: `Approved ${amount} mUSD for rewards pool`,
      });
    } catch (err: any) {
      console.error('Error approving reward token:', err);
      toast({
        title: "Error",
        description: err.message || "Failed to approve reward token",
        variant: "destructive",
      });
    }
  }, [contractsWithSigner, toast]);

  const fundRewardsPool = useCallback(async (amount: string) => {
    if (!contractsWithSigner) {
      toast({
        title: "Error",
        description: "Please connect your wallet",
        variant: "destructive",
      });
      return;
    }

    try {
      const contract = await contractsWithSigner.governor();
      const amountBigInt = parseToken(amount, 6);
      const tx = await contract.distributeRewards(amountBigInt);
      
      toast({
        title: "Transaction Submitted",
        description: "Funding rewards pool...",
      });

      await tx.wait();
      
      toast({
        title: "Success",
        description: `Added ${amount} mUSD to rewards pool!`,
      });

      await fetchAdminData();
    } catch (err: any) {
      console.error('Error funding rewards pool:', err);
      toast({
        title: "Error",
        description: err.message || "Failed to fund rewards pool",
        variant: "destructive",
      });
    }
  }, [contractsWithSigner, toast, fetchAdminData]);

  return {
    data,
    isLoading,
    error,
    refresh: fetchAdminData,
    // Oracle
    setOraclePrice,
    // Vault Admin
    setSyntheticHoldings,
    scheduleBrokerWithdrawal,
    executeBrokerWithdrawal,
    cancelBrokerWithdrawal,
    setMaxSingleWithdrawal,
    setComplianceStatus,
    setGlobalPause,
    // Governance
    approveRewardToken,
    fundRewardsPool,
  };
}
