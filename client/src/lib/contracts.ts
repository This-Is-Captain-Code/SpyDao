// Contract addresses and ABIs for SPY DAO on Rayls

export const CONTRACTS = {
  network: "rayls",
  chainId: 123123, // Rayls Testnet chain ID
  rpcUrl: "https://devnet-rpc.rayls.com",
  deployer: "0xaFEf2f5626961ba219Cd9Eb1D7A1f1B08896DD08",
  MockUSD: "0xB6c7B1ef0947596FC2d8eBE577b97f34cBBD2Fb1",
  MockSPYOracle: "0x19a881AF139D665bD857Aedf6EDcBc0dBee52765",
  SPYVault: "0x2181BaAAb16e8a4E08c7fFAB8DA1780B53eD05D2",
  SPYDAOGovernor: "0x4DD81784392EC93a7e88e190Baca21EfF486895D",
} as const;

// MockUSD ABI
export const MockUSD_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) returns (bool)",
  "function mint(address to, uint256 amount)",
  "function faucet()",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)",
] as const;

// MockSPYOracle ABI
export const MockSPYOracle_ABI = [
  "function latestAnswer() view returns (uint256)",
  "function setPrice(uint256 newPrice)",
  "event PriceUpdated(uint256 oldPrice, uint256 newPrice)",
] as const;

// SPYVault ABI
export const SPYVault_ABI = [
  // ERC20 functions
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) returns (bool)",
  
  // ERC4626 functions
  "function asset() view returns (address)",
  "function totalAssets() view returns (uint256)",
  "function convertToShares(uint256 assets) view returns (uint256)",
  "function convertToAssets(uint256 shares) view returns (uint256)",
  "function maxDeposit(address) view returns (uint256)",
  "function previewDeposit(uint256 assets) view returns (uint256)",
  "function deposit(uint256 assets, address receiver) returns (uint256)",
  "function maxMint(address) view returns (uint256)",
  "function previewMint(uint256 shares) view returns (uint256)",
  "function mint(uint256 shares, address receiver) returns (uint256)",
  "function maxWithdraw(address owner) view returns (uint256)",
  "function previewWithdraw(uint256 assets) view returns (uint256)",
  "function withdraw(uint256 assets, address receiver, address owner) returns (uint256)",
  "function maxRedeem(address owner) view returns (uint256)",
  "function previewRedeem(uint256 shares) view returns (uint256)",
  "function redeem(uint256 shares, address receiver, address owner) returns (uint256)",
  
  // ERC20Votes functions
  "function getVotes(address account) view returns (uint256)",
  "function getPastVotes(address account, uint256 blockNumber) view returns (uint256)",
  "function delegates(address account) view returns (address)",
  "function delegate(address delegatee)",
  "function delegateBySig(address delegatee, uint256 nonce, uint256 expiry, uint8 v, bytes32 r, bytes32 s)",
  
  // Vault-specific functions
  "function spyOracle() view returns (address)",
  "function syntheticShareBalance() view returns (uint256)",
  "function ignoreSynthetic() view returns (bool)",
  "function BROKER_WALLET() view returns (address)",
  "function pendingWithdrawalAmount() view returns (uint256)",
  "function pendingWithdrawalTime() view returns (uint256)",
  "function maxSingleWithdrawal() view returns (uint256)",
  "function isKYCCompleted(address) view returns (bool)",
  "function isSanctionsBlocked(address) view returns (bool)",
  "function globalPause() view returns (bool)",
  
  // Admin functions
  "function setSyntheticHoldings(uint256 newBalance, string reason)",
  "function setIgnoreSynthetic(bool ignore)",
  "function setMaxSingleWithdrawal(uint256 newMax)",
  "function scheduleBrokerWithdrawal(uint256 assets)",
  "function executeBrokerWithdrawal()",
  "function cancelWithdrawal()",
  "function setComplianceStatus(address account, bool kycCompleted, bool blocked, string reason)",
  "function setGlobalPause(bool paused)",
  
  // Events
  "event Deposit(address indexed sender, address indexed owner, uint256 assets, uint256 shares)",
  "event Withdraw(address indexed sender, address indexed receiver, address indexed owner, uint256 assets, uint256 shares)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)",
  "event DelegateChanged(address indexed delegator, address indexed fromDelegate, address indexed toDelegate)",
  "event DelegateVotesChanged(address indexed delegate, uint256 previousBalance, uint256 newBalance)",
  "event ComplianceStatusUpdated(address indexed account, bool kycCompleted, bool isBlocked, string reason)",
  "event GlobalPauseSet(bool paused)",
  "event SyntheticHoldingsUpdated(uint256 oldBalance, uint256 newBalance, string reason)",
] as const;

// SPYDAOGovernor ABI
export const SPYDAOGovernor_ABI = [
  // Governor functions
  "function name() view returns (string)",
  "function version() view returns (string)",
  "function votingDelay() view returns (uint256)",
  "function votingPeriod() view returns (uint256)",
  "function quorum(uint256 blockNumber) view returns (uint256)",
  "function proposalThreshold() view returns (uint256)",
  "function hashProposal(address[] targets, uint256[] values, bytes[] calldatas, bytes32 descriptionHash) pure returns (uint256)",
  "function state(uint256 proposalId) view returns (uint8)",
  "function proposalSnapshot(uint256 proposalId) view returns (uint256)",
  "function proposalDeadline(uint256 proposalId) view returns (uint256)",
  "function proposalProposer(uint256 proposalId) view returns (address)",
  
  // Voting functions
  "function getVotes(address account, uint256 blockNumber) view returns (uint256)",
  "function hasVoted(uint256 proposalId, address account) view returns (bool)",
  "function castVote(uint256 proposalId, uint8 support) returns (uint256)",
  "function castVoteWithReason(uint256 proposalId, uint8 support, string reason) returns (uint256)",
  "function castVoteBySig(uint256 proposalId, uint8 support, uint8 v, bytes32 r, bytes32 s) returns (uint256)",
  
  // Proposal functions
  "function propose(address[] targets, uint256[] values, bytes[] calldatas, string description) returns (uint256)",
  "function execute(address[] targets, uint256[] values, bytes[] calldatas, bytes32 descriptionHash) payable returns (uint256)",
  "function cancel(address[] targets, uint256[] values, bytes[] calldatas, bytes32 descriptionHash) returns (uint256)",
  
  // Custom functions
  "function proposeSP500Vote(string companyTicker, uint256 shareholderProposalId, bool voteFor, string description) returns (uint256)",
  "function sp500Proposals(uint256) view returns (string companyTicker, uint256 shareholderProposalId, bool voteFor, uint256 totalVotes, bool executed)",
  "function hasClaimedReward(uint256 proposalId, address voter) view returns (bool)",
  "function claimRewards(uint256 proposalId)",
  "function distributeRewards(uint256 amount)",
  "function availableRewards(uint256 proposalId, address user) view returns (uint256)",
  "function REWARD_TOKEN() view returns (address)",
  "function totalRewardsDistributed() view returns (uint256)",
  "function REWARD_PER_VOTE() view returns (uint256)",
  "function VOTING_DELAY() view returns (uint256)",
  "function VOTING_PERIOD() view returns (uint256)",
  "function QUORUM() view returns (uint256)",
  
  // Events
  "event ProposalCreated(uint256 proposalId, address proposer, address[] targets, uint256[] values, string[] signatures, bytes[] calldatas, uint256 startBlock, uint256 endBlock, string description)",
  "event VoteCast(address indexed voter, uint256 proposalId, uint8 support, uint256 weight, string reason)",
  "event ProposalExecuted(uint256 indexed proposalId, string ticker, bool voteFor)",
  "event SP500VoteCast(uint256 indexed proposalId, string ticker, bool vote, address indexed voter, uint256 weight)",
  "event RewardsClaimed(uint256 indexed proposalId, address indexed voter, uint256 reward)",
] as const;

// Proposal state enum
export enum ProposalState {
  Pending,
  Active,
  Canceled,
  Defeated,
  Succeeded,
  Queued,
  Expired,
  Executed,
}

// Vote support enum
export enum VoteSupport {
  Against = 0,
  For = 1,
  Abstain = 2,
}

// Helper function to get proposal state name
export function getProposalStateName(state: ProposalState): string {
  return ProposalState[state];
}

// Helper function to format vote support
export function getVoteSupportName(support: VoteSupport): string {
  return VoteSupport[support];
}
