// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/governance/Governor.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorCountingSimple.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotes.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorTimelockControl.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title SPYDAOGovernor
 * @notice On-chain voting for S&P 500 shareholder proposals with reward mechanism
 * @dev Uses spDAO shares as voting power and distributes rewards to active participants
 */
contract SPYDAOGovernor is Governor, GovernorVotes, GovernorCountingSimple {
    using SafeERC20 for IERC20;
    
    uint256 public constant VOTING_DELAY = 1; // 1 block
    uint256 public constant VOTING_PERIOD = 45_000; // ~1 week
    uint256 public constant QUORUM = 10 * 1e18; // 10 spDAO shares
    
    // Reward mechanism for active participants
    IERC20 public immutable REWARD_TOKEN; // Usually the underlying token
    uint256 public totalRewardsDistributed;
    uint256 public constant REWARD_PER_VOTE = 1e16; // 0.01 units per vote weight
    
    // Maps proposalId to off-chain company/proposal details
    mapping(uint256 => SP500Proposal) public sp500Proposals;
    
    // Maps users to their claimed rewards per proposal
    mapping(uint256 => mapping(address => bool)) public hasClaimedReward;
    
    struct SP500Proposal {
        string companyTicker;
        uint256 shareholderProposalId;
        bool voteFor; // What the DAO decided
        uint256 totalVotes; // Total voting weight for reward calculation
        bool executed;
    }
    
    event SP500VoteCast(uint256 proposalId, string ticker, bool vote, address voter, uint256 weight);
    event RewardsClaimed(uint256 proposalId, address voter, uint256 reward);
    event ProposalExecuted(uint256 proposalId, string ticker, bool voteFor);
    
    constructor(IVotes _spDAOToken, address _rewardToken)
        Governor("SPY DAO Governor")
        GovernorVotes(_spDAOToken)
    {
        REWARD_TOKEN = IERC20(_rewardToken);
    }
    
    /**
     * @notice Create a proposal for an S&P 500 shareholder vote
     * @param companyTicker e.g., "AAPL"
     * @param shareholderProposalId From Broadridge/Say API
     * @param voteFor What the DAO should vote
     * @param description Human-readable description
     */
    function proposeSP500Vote(
        string memory companyTicker,
        uint256 shareholderProposalId,
        bool voteFor,
        string memory description
    ) external returns (uint256) {
        // No on-chain execution; just records the decision
        address[] memory targets = new address[](1);
        targets[0] = address(this);
        uint256[] memory values = new uint256[](1);
        bytes[] memory calldatas = new bytes[](1);
        calldatas[0] = abi.encode(companyTicker, shareholderProposalId, voteFor);
        
        uint256 proposalId = propose(targets, values, calldatas, description);
        
        sp500Proposals[proposalId] = SP500Proposal({
            companyTicker: companyTicker,
            shareholderProposalId: shareholderProposalId,
            voteFor: voteFor,
            totalVotes: 0,
            executed: false
        });
        
        return proposalId;
    }
    
    /**
     * @notice Override _castVote to track participation for rewards
     */
    function _castVote(
        uint256 proposalId,
        address account,
        uint8 support,
        string memory reason,
        bytes memory
    ) internal override returns (uint256) {
        uint256 votes = super._castVote(proposalId, account, support, reason, bytes("")
        );
        
        if (votes > 0) {
            SP500Proposal storage proposal = sp500Proposals[proposalId];
            proposal.totalVotes += votes;
            
            emit SP500VoteCast(
                proposalId,
                proposal.companyTicker,
                support == 1,
                account,
                votes
            );
        }
        
        return votes;
    }
    
    /**
     * @notice Claim rewards for participating in governance
     * @param proposalId The proposal to claim rewards for
     */
    function claimRewards(uint256 proposalId) external {
        require(proposalId < proposalSnapshot(proposalId) + votingPeriod(proposalId), "Voting not ended");
        require(!hasClaimedReward[proposalId][msg.sender], "Already claimed");
        
        SP500Proposal memory proposal = sp500Proposals[proposalId];
        require(proposal.totalVotes > 0, "No votes cast");
        
        uint256 votingWeight = getVotes(msg.sender, proposalSnapshot(proposalId));
        require(votingWeight > 0, "No voting power");
        
        uint256 reward = (votingWeight * REWARD_PER_VOTE) / 1e18;
        require(REWARD_TOKEN.balanceOf(address(this)) >= reward, "Insufficient rewards");
        
        hasClaimedReward[proposalId][msg.sender] = true;
        totalRewardsDistributed += reward;
        
        REWARD_TOKEN.safeTransfer(msg.sender, reward);
        emit RewardsClaimed(proposalId, msg.sender, reward);
    }
    
    /**
     * @notice Distribute dividends/rewards to the governor
     * @param amount Amount of reward token to add
     */
    function distributeRewards(uint256 amount) external {
        REWARD_TOKEN.safeTransferFrom(msg.sender, address(this), amount);
    }
    
    /**
     * @notice Get available rewards for a user
     * @param proposalId The proposal to check
     * @param user Address to check rewards for
     */
    function availableRewards(uint256 proposalId, address user) external view returns (uint256) {
        if (hasClaimedReward[proposalId][user]) return 0;
        if (proposalId >= proposalSnapshot(proposalId) + votingPeriod(proposalId)) return 0;
        
        uint256 votingWeight = getVotes(user, proposalSnapshot(proposalId));
        if (votingWeight == 0) return 0;
        
        return (votingWeight * REWARD_PER_VOTE) / 1e18;
    }
    
    // ====== Governor Overrides ======
    function votingDelay() public pure override returns (uint256) { return VOTING_DELAY; }
    function votingPeriod() public pure override returns (uint256) { return VOTING_PERIOD; }
    function quorum(uint256 blockNumber) public pure override returns (uint256) { return QUORUM; }
    
    // Required overrides
    function _execute(
        uint256 proposalId,
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
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
