// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/governance/Governor.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorCountingSimple.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotes.sol";
import "@openzeppelin/contracts/governance/utils/IVotes.sol";
import "@openzeppelin/contracts/governance/IGovernor.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title SPYDAOGovernor
 * @notice On-chain voting for S&P 500 shareholder proposals with reward mechanism
 * @dev Uses spDAO (SPYVault shares) as voting power and distributes rewards to active participants
 */
contract SPYDAOGovernor is Governor, GovernorVotes, GovernorCountingSimple {
    using SafeERC20 for IERC20;

    // --- Governance params ---

    uint256 public constant VOTING_DELAY  = 1;        // 1 block
    uint256 public constant VOTING_PERIOD = 45_000;   // ~1 week
    uint256 public constant QUORUM        = 10 * 1e18; // 10 spDAO shares

    // --- Reward mechanism ---

    IERC20  public immutable REWARD_TOKEN;          // usually underlying token (mUSD)
    uint256 public totalRewardsDistributed;
    uint256 public constant REWARD_PER_VOTE = 1e16; // 0.01 units per 1e18 voting weight

    // --- Proposal metadata ---

    struct SP500Proposal {
        string  companyTicker;         // e.g., "AAPL"
        uint256 shareholderProposalId; // ID from proxy-voting provider
        bool    voteFor;               // what the DAO recommends (for / against)
        uint256 totalVotes;            // aggregate voting weight (for rewards)
        bool    executed;              // whether we emitted final decision
    }

    // proposalId => metadata
    mapping(uint256 => SP500Proposal) public sp500Proposals;

    // proposalId => voter => claimed?
    mapping(uint256 => mapping(address => bool)) public hasClaimedReward;

    // --- Events ---

    event SP500VoteCast(
        uint256 indexed proposalId,
        string  ticker,
        bool    vote,
        address indexed voter,
        uint256 weight
    );

    event RewardsClaimed(
        uint256 indexed proposalId,
        address indexed voter,
        uint256 reward
    );

    event ProposalExecuted(
        uint256 indexed proposalId,
        string  ticker,
        bool    voteFor
    );

    // --- Constructor ---

    constructor(IVotes _spDAOToken, address _rewardToken)
        Governor("SPY DAO Governor")
        GovernorVotes(_spDAOToken)
    {
        require(_rewardToken != address(0), "Invalid reward token");
        REWARD_TOKEN = IERC20(_rewardToken);
    }

    // ============================================================
    //                     PROPOSAL CREATION
    // ============================================================

    /**
     * @notice Create a proposal for an S&P 500 shareholder vote
     * @param companyTicker e.g., "AAPL"
     * @param shareholderProposalId ID from proxy-voting provider
     * @param voteFor true = vote FOR, false = vote AGAINST
     * @param description Human-readable description shown in UI
     */
    function proposeSP500Vote(
    string memory companyTicker,
    uint256 shareholderProposalId,
    bool voteFor,
    string memory description
) external returns (uint256) {
    // No real on-chain execution; we just create a minimal proposal
    // with a dummy self-call payload for Governor’s internal machinery.
    address[] memory targets = new address[](1);
    uint256[] memory values = new uint256[](1);
    bytes[] memory calldatas = new bytes[](1);

    targets[0] = address(this); // dummy target, never actually called
    values[0] = 0;
    calldatas[0] = abi.encode(companyTicker, shareholderProposalId, voteFor);

    uint256 proposalId = propose(targets, values, calldatas, description);

    sp500Proposals[proposalId] = SP500Proposal({
        companyTicker:         companyTicker,
        shareholderProposalId: shareholderProposalId,
        voteFor:               voteFor,
        totalVotes:            0,
        executed:              false
    });

    return proposalId;
}


    // ============================================================
    //                    VOTING & REWARDS HOOK
    // ============================================================

    /**
     * @notice Override _castVote to track participation for rewards
     */
    function _castVote(
        uint256 proposalId,
        address account,
        uint8 support,
        string memory reason,
        bytes memory params
    ) internal override returns (uint256) {
        // Use Governor's core logic first (checks, vote counting)
        uint256 votes = super._castVote(proposalId, account, support, reason, params);

        if (votes > 0) {
            SP500Proposal storage proposal = sp500Proposals[proposalId];
            proposal.totalVotes += votes;

            emit SP500VoteCast(
                proposalId,
                proposal.companyTicker,
                support == 1, // 1 = For, per GovernorCountingSimple
                account,
                votes
            );
        }

        return votes;
    }

    // ============================================================
    //                     REWARD CLAIM LOGIC
    // ============================================================

    /**
     * @notice Claim rewards for participating in governance
     * @param proposalId The proposal to claim rewards for
     */
    function claimRewards(uint256 proposalId) external {
        // Only allow claims once the proposal is no longer active/pending
        IGovernor.ProposalState s = state(proposalId);
        require(
            s != IGovernor.ProposalState.Pending &&
            s != IGovernor.ProposalState.Active,
            "Voting not ended"
        );

        require(!hasClaimedReward[proposalId][msg.sender], "Already claimed");

        SP500Proposal memory proposal = sp500Proposals[proposalId];
        require(proposal.totalVotes > 0, "No votes cast");

        // Voting weight at snapshot (standard Governor behavior)
        uint256 snapshotBlock = proposalSnapshot(proposalId);
        uint256 votingWeight = getVotes(msg.sender, snapshotBlock);
        require(votingWeight > 0, "No voting power");

        uint256 reward = (votingWeight * REWARD_PER_VOTE) / 1e18;
        require(REWARD_TOKEN.balanceOf(address(this)) >= reward, "Insufficient rewards");

        hasClaimedReward[proposalId][msg.sender] = true;
        totalRewardsDistributed += reward;

        REWARD_TOKEN.safeTransfer(msg.sender, reward);
        emit RewardsClaimed(proposalId, msg.sender, reward);
    }

    /**
     * @notice Fund the rewards pool
     * @param amount Amount of REWARD_TOKEN to add
     */
    function distributeRewards(uint256 amount) external {
        REWARD_TOKEN.safeTransferFrom(msg.sender, address(this), amount);
    }

    /**
     * @notice View helper: how many rewards a user could claim if eligible
     */
    function availableRewards(uint256 proposalId, address user)
        external
        view
        returns (uint256)
    {
        if (hasClaimedReward[proposalId][user]) return 0;

        IGovernor.ProposalState s = state(proposalId);
        // If still pending/active, treat as 0 available (not unlocked yet)
        if (s == IGovernor.ProposalState.Pending || s == IGovernor.ProposalState.Active) {
            return 0;
        }

        SP500Proposal memory proposal = sp500Proposals[proposalId];
        if (proposal.totalVotes == 0) return 0;

        uint256 snapshotBlock = proposalSnapshot(proposalId);
        uint256 votingWeight = getVotes(user, snapshotBlock);
        if (votingWeight == 0) return 0;

        return (votingWeight * REWARD_PER_VOTE) / 1e18;
    }

    // ============================================================
    //                     GOVERNOR OVERRIDES
    // ============================================================

    function votingDelay()
        public
        view
        override
        returns (uint256)
    {
        return VOTING_DELAY;
    }

    function votingPeriod()
        public
        view
        override
        returns (uint256)
    {
        return VOTING_PERIOD;
    }

    function quorum(uint256 /* blockNumber */)
        public
        view
        override
        returns (uint256)
    {
        return QUORUM;
    }

    /// @notice No proposal threshold: any nonzero voting power can propose
    function proposalThreshold()
        public
        view
        override
        returns (uint256)
    {
        return 0;
    }

    /**
     * @notice Governor's internal execute hook — we don't actually execute calls,
     *         we just mark the proposal executed and emit a summary event for off-chain use.
     */
    function _executeOperations(
        uint256 proposalId,
        address[] memory /* targets */,
        uint256[] memory /* values */,
        bytes[] memory /* calldatas */,
        bytes32 /* descriptionHash */
    ) internal override {
        SP500Proposal storage proposal = sp500Proposals[proposalId];
        proposal.executed = true;

        emit SP500VoteCast(
            proposalId,
            proposal.companyTicker,
            proposal.voteFor,
            address(this),
            proposal.totalVotes
        );
        emit ProposalExecuted(proposalId, proposal.companyTicker, proposal.voteFor);
    }
}
