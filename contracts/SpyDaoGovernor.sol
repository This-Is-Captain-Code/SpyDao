// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/governance/Governor.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorCountingSimple.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotes.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorTimelockControl.sol";

/**
 * @title SPYDAOGovernor
 * @notice On-chain voting for S&P 500 shareholder proposals
 * @dev Uses spDAO shares as voting power
 */
contract SPYDAOGovernor is Governor, GovernorVotes, GovernorCountingSimple {
    uint256 public constant VOTING_DELAY = 1; // 1 block
    uint256 public constant VOTING_PERIOD = 45_000; // ~1 week
    uint256 public constant QUORUM = 10 * 1e18; // 10 spDAO shares
    
    // Maps proposalId to off-chain company/proposal details
    mapping(uint256 => SPS00Proposal) public sp500Proposals;
    
    struct SPS00Proposal {
        string companyTicker;
        uint256 shareholderProposalId;
        bool voteFor; // What the DAO decided
    }
    
    event SP500VoteCast(uint256 proposalId, string ticker, bool vote);
    
    constructor(IVotes _spDAOToken)
        Governor("SPY DAO Governor")
        GovernorVotes(_spDAOToken)
    {}
    
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
        
        sp500Proposals[proposalId] = SPS00Proposal({
            companyTicker: companyTicker,
            shareholderProposalId: shareholderProposalId,
            voteFor: voteFor
        });
        
        return proposalId;
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
        // No on-chain execution; just emit event for off-chain executor
        SPS00Proposal memory prop = sp500Proposals[proposalId];
        emit SP500VoteCast(proposalId, prop.companyTicker, prop.voteFor);
    }
}
