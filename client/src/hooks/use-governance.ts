import { useState, useEffect, useCallback } from 'react';
import { BrowserProvider, id, AbiCoder } from 'ethers';
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
  description: string; // Store the original description for execution
}

interface GovernanceConfig {
  votingDelay: string;
  votingPeriod: string;
  quorum: string;
  proposalThreshold: string;
}

export function useGovernance(provider: BrowserProvider | null, address: string | null) {
  const [proposals, setProposals] = useState<SP500Proposal[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalRewards, setTotalRewards] = useState<string>('0');
  const [rewardPerVote, setRewardPerVote] = useState<string>('0');
  const [config, setConfig] = useState<GovernanceConfig | null>(null);
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
      // Fetch governance constants and config
      const [totalRewardsDistributed, rewardPerVoteRaw, votingDelay, votingPeriod, quorum, proposalThreshold] = await Promise.all([
        contracts.governor.totalRewardsDistributed(),
        contracts.governor.REWARD_PER_VOTE(),
        contracts.governor.VOTING_DELAY(),
        contracts.governor.VOTING_PERIOD(),
        contracts.governor.QUORUM(),
        contracts.governor.proposalThreshold(),
      ]);

      setTotalRewards(formatToken(totalRewardsDistributed, 6));
      setRewardPerVote(formatToken(rewardPerVoteRaw, 6));
      
      setConfig({
        votingDelay: votingDelay.toString(),
        votingPeriod: votingPeriod.toString(),
        quorum: formatToken(quorum, 18),
        proposalThreshold: formatToken(proposalThreshold, 18),
      });

      // For hackathon, we'll listen to events to get proposals
      // In production, you'd want to use a subgraph or indexer
      const filter = contracts.governor.filters.ProposalCreated();
      // Query recent blocks - use current block minus a reasonable range
      const currentBlock = await contracts.governor.runner!.provider!.getBlockNumber();
      const fromBlock = Math.max(0, currentBlock - 10000); // Last 10000 blocks or from genesis
      const events = await contracts.governor.queryFilter(filter, fromBlock, currentBlock);

      const proposalPromises = events.map(async (event: any) => {
        const proposalId = event.args[0].toString();
        // ProposalCreated event args: proposalId, proposer, targets, values, signatures, calldatas, startBlock, endBlock, description
        const description = event.args[8] as string; // Description is the 9th argument (index 8)

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
          description, // Store the original description from the event
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

  const executeProposal = useCallback(async (
    proposalId: string,
    companyTicker: string,
    shareholderProposalId: string,
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
      
      // Reconstruct the EXACT calldata that was used in proposeSP500Vote
      // From SpyDaoGovernor.sol line 99-105:
      // targets[0] = address(this);
      // values[0] = 0;
      // calldatas[0] = abi.encode(companyTicker, shareholderProposalId, voteFor);
      
      const targets: string[] = [await contract.getAddress()];
      const values: bigint[] = [0n];
      
      // ABI-encode the proposal data (companyTicker, shareholderProposalId, voteFor)
      // Note: Convert shareholderProposalId string to BigInt for uint256 encoding
      const abiCoder = new AbiCoder();
      const encodedCalldata = abiCoder.encode(
        ['string', 'uint256', 'bool'],
        [companyTicker, BigInt(shareholderProposalId), voteFor]
      );
      const calldatas: string[] = [encodedCalldata];
      
      const descriptionHash = id(description); // keccak256 of description
      
      const tx = await contract.execute(targets, values, calldatas, descriptionHash);
      
      toast({
        title: "Transaction Submitted",
        description: "Executing proposal...",
      });

      await tx.wait();
      
      toast({
        title: "Success",
        description: "Proposal executed successfully!",
      });

      await fetchProposals();
    } catch (err: any) {
      console.error('Error executing proposal:', err);
      toast({
        title: "Error",
        description: err.message || "Failed to execute proposal",
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
    config,
    refresh: fetchProposals,
    createProposal,
    castVote,
    claimReward,
    executeProposal,
  };
}
