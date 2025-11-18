import { useState, useEffect, useCallback } from 'react';
import { BrowserProvider } from 'ethers';
import { useContracts, useContractsWithSigner, formatToken } from './use-contracts';
import { useToast } from './use-toast';
import { ProposalState, VoteSupport, getProposalStateName } from '@/lib/contracts';

export interface SP500Proposal {
  id: string;
  companyTicker: string;
  shareholderProposalId: string;
  voteFor: boolean;
  totalVotes: string;
  executed: boolean;
  state: ProposalState;
  stateName: string;
  snapshot: string;
  deadline: string;
  proposer: string;
  hasVoted: boolean;
  availableReward: string;
  hasClaimed: boolean;
}

export function useGovernance(provider: BrowserProvider | null, address: string | null) {
  const [proposals, setProposals] = useState<SP500Proposal[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalRewards, setTotalRewards] = useState<string>('0');
  const [rewardPerVote, setRewardPerVote] = useState<string>('0');
  const contracts = useContracts(provider);
  const contractsWithSigner = useContractsWithSigner(provider, address);
  const { toast } = useToast();

  const fetchProposals = useCallback(async () => {
    if (!contracts || !address) {
      setProposals([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Fetch governance constants
      const [totalRewardsDistributed, rewardPerVote] = await Promise.all([
        contracts.governor.totalRewardsDistributed(),
        contracts.governor.REWARD_PER_VOTE(),
      ]);

      setTotalRewards(formatToken(totalRewardsDistributed, 6));
      setRewardPerVote(formatToken(rewardPerVote, 6));

      // For hackathon, we'll listen to events to get proposals
      // In production, you'd want to use a subgraph or indexer
      const filter = contracts.governor.filters.ProposalCreated();
      const events = await contracts.governor.queryFilter(filter, -10000); // Last 10000 blocks

      const proposalPromises = events.map(async (event: any) => {
        const proposalId = event.args[0].toString();

        const [
          sp500Data,
          state,
          snapshot,
          deadline,
          proposer,
          hasVoted,
          availableReward,
          hasClaimed,
        ] = await Promise.all([
          contracts.governor.sp500Proposals(proposalId),
          contracts.governor.state(proposalId),
          contracts.governor.proposalSnapshot(proposalId),
          contracts.governor.proposalDeadline(proposalId),
          contracts.governor.proposalProposer(proposalId),
          contracts.governor.hasVoted(proposalId, address),
          contracts.governor.availableRewards(proposalId, address),
          contracts.governor.hasClaimedReward(proposalId, address),
        ]);

        return {
          id: proposalId,
          companyTicker: sp500Data.companyTicker,
          shareholderProposalId: sp500Data.shareholderProposalId.toString(),
          voteFor: sp500Data.voteFor,
          totalVotes: formatToken(sp500Data.totalVotes, 18),
          executed: sp500Data.executed,
          state: Number(state) as ProposalState,
          stateName: getProposalStateName(Number(state) as ProposalState),
          snapshot: snapshot.toString(),
          deadline: deadline.toString(),
          proposer,
          hasVoted,
          availableReward: formatToken(availableReward, 6),
          hasClaimed,
        };
      });

      const fetchedProposals = await Promise.all(proposalPromises);
      setProposals(fetchedProposals.reverse()); // Most recent first
    } catch (err: any) {
      console.error('Error fetching proposals:', err);
      setError(err.message || 'Failed to fetch proposals');
    } finally {
      setIsLoading(false);
    }
  }, [contracts, address]);

  useEffect(() => {
    fetchProposals();
  }, [fetchProposals]);

  const createProposal = useCallback(async (
    ticker: string,
    proposalId: string,
    voteFor: boolean,
    description: string
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
      const contract = await contractsWithSigner.governor();
      const tx = await contract.proposeSP500Vote(ticker, proposalId, voteFor, description);
      
      toast({
        title: "Transaction Submitted",
        description: "Creating proposal...",
      });

      await tx.wait();
      
      toast({
        title: "Success",
        description: "Proposal created successfully!",
      });

      await fetchProposals();
    } catch (err: any) {
      console.error('Error creating proposal:', err);
      toast({
        title: "Error",
        description: err.message || "Failed to create proposal",
        variant: "destructive",
      });
    }
  }, [contractsWithSigner, toast, fetchProposals]);

  const castVote = useCallback(async (proposalId: string, support: VoteSupport, reason?: string) => {
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
      const tx = reason 
        ? await contract.castVoteWithReason(proposalId, support, reason)
        : await contract.castVote(proposalId, support);
      
      toast({
        title: "Transaction Submitted",
        description: "Casting vote...",
      });

      await tx.wait();
      
      toast({
        title: "Success",
        description: "Vote cast successfully!",
      });

      await fetchProposals();
    } catch (err: any) {
      console.error('Error casting vote:', err);
      toast({
        title: "Error",
        description: err.message || "Failed to cast vote",
        variant: "destructive",
      });
    }
  }, [contractsWithSigner, toast, fetchProposals]);

  const claimReward = useCallback(async (proposalId: string) => {
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
      const tx = await contract.claimRewards(proposalId);
      
      toast({
        title: "Transaction Submitted",
        description: "Claiming rewards...",
      });

      await tx.wait();
      
      toast({
        title: "Success",
        description: "Rewards claimed successfully!",
      });

      await fetchProposals();
    } catch (err: any) {
      console.error('Error claiming rewards:', err);
      toast({
        title: "Error",
        description: err.message || "Failed to claim rewards",
        variant: "destructive",
      });
    }
  }, [contractsWithSigner, toast, fetchProposals]);

  return {
    proposals,
    isLoading,
    error,
    totalRewards,
    rewardPerVote,
    refresh: fetchProposals,
    createProposal,
    castVote,
    claimReward,
  };
}
