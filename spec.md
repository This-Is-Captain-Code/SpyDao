# **SPY DAO - Technical Specification**

*Democratizing Index Fund Governance through On-Chain Delegation & ZKTLS-Verified Execution*

---

## **1. Project Overview**

### **Problem Statement**
Index funds (e.g., SPY) manage trillions in assets, but investors surrender governance rights. When Tesla or Apple holds a shareholder vote, SPY holders have no voice—State Street votes for them. This is a principal-agent failure at massive scale.

### **Solution**
SPY DAO is a delegated governance vault that:**
1. **Issues liquid shares** representing proportional SPY exposure via ERC4626
2. **Aggregates voting power** from all depositors into a single on-chain DAO
3. **Democratically decides** how to vote on underlying S&P 500 shareholder proposals
4. **Trustlessly verifies** off-chain execution of votes using **ZKTLS proofs**
5. **Enables liquid delegation**—users can delegate to activist delegates, ESG-focused voters, or sell voting power

---

## **2. System Architecture**

### **High-Level Flow**
```
┌─────────────────────────────────────────────────────────────────────┐
│                           USERS (Rayls Chain)                        │
│  Deposit USDC → Receive spDAO shares → Delegate Voting Power        │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     ON-CHAIN (Rayls)                                │
│  ┌──────────┐  ┌──────────────┐  ┌──────────────────────────────┐ │
│  │ SPYVault │─▶│  SPYDAOOracle │─▶│ SPYDAOGovernor (ERC20Votes)  │ │
│  │ ERC4626  │  │ Custom Price   │  │   - Proposals from S&P500    │ │
│  └──────────┘  │ Feed (Rayls)   │  │   - Voting Power = spDAO bal │ │
│                └──────────────┘  └──────────────────────────────┘ │
│                                   │                                │
│           ┌───────────────────────┴──────────────────────────────┐ │
│           │ ZKTLS Verifier (VoteExecutionProof.sol)               │ │
│           │   - Verifies TLS proofs of broker API calls           │ │
│           │   - Anchors off-chain execution on-chain              │ │
│           └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    OFF-CHAIN (Trusted Relayer)                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ Execution Service (Node.js/Python)                           │  │
│  │  1. Polls SPYDAOGovernor for new votes                      │  │
│  │  2. Constructs broker API request (vote shares)             │  │
│  │  3. Generates ZKTLS proof of API response (TLSNotary)       │  │
│  │  4. Submits proof + result to ZKTLSVerifier                 │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                   │                                 │
│  ┌────────────────────────────────┴──────────────────────────────┐ │
│  │  Broker API (e.g., Alpaca, Tradier) - Votes on S&P500 Proxies │ │
│  └────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

---

## **3. Core Components**

### **3.1 SPYVault.sol (ERC4626)**
The vault that mints governance-wrapped shares.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";

contract SPYVault is ERC4626, ERC20Votes {
    // Custom oracle for Rayls (no native Chainlink)
    ISPYPublicOracle public immutable spyOracle;
    
    // Total "virtual" SPY shares held off-chain
    uint256 public syntheticShareBalance;
    
    constructor(
        IERC20 _asset, // USDC on Rayls
        ISPYPublicOracle _oracle
    ) ERC4626(_asset) ERC20("SPY DAO Share", "spDAO") ERC20Permit("spDAO") {
        spyOracle = _oracle;
    }
    
    /// @notice Override to include synthetic SPY exposure
    function totalAssets() public view override returns (uint256) {
        // On-chain USDC + off-chain SPY NAV
        uint256 onChainBalance = asset.balanceOf(address(this));
        uint256 offChainValue = spyOracle.latestAnswer() * syntheticShareBalance;
        return onChainBalance + offChainValue;
    }
    
    /// @notice Called by ZKTLS-verified execution service when shares are bought
    function increaseSyntheticHoldings(uint256 spyShares) external onlyExecutor {
        syntheticShareBalance += spyShares;
    }
    
    /// @notice Governance power for DAO is just share balance
    function _afterTokenTransfer(address from, address to, uint256 amount) internal override(ERC20, ERC20Votes) {
        super._afterTokenTransfer(from, to, amount);
    }
    
    function _mint(address to, uint256 amount) internal override(ERC20, ERC20Votes) {
        super._mint(to, amount);
    }
    
    function _burn(address from, uint256 amount) internal override(ERC20, ERC20Votes) {
        super._burn(from, amount);
    }
}
```

**Key Features:**
- **ERC4626** standard for composability
- **ERC20Votes** for snapshot governance
- **Synthetic NAV tracking**—vault value reflects off-chain holdings
- **Role-based executor**—only ZKTLS-verified service can update holdings

---

### **3.2 SPYPublicOracle.sol (Rayls-Specific)**
Since Rayls lacks native oracles, we build a **public, optimistic price feed**.

```solidity
contract SPYPublicOracle {
    uint256 public latestAnswer; // SPY price in USD (8 decimals)
    uint256 public lastUpdate;
    address public relayer;
    
    // Allow anyone to challenge a stale or manipulated price
    uint256 public constant MAX_PRICE_AGE = 1 hours;
    
    event PriceUpdated(uint256 price, uint256 timestamp);
    
    constructor(address _relayer) {
        relayer = _relayer;
    }
    
    /// @notice Relayer pushes SPY price (signed payload in production)
    function updatePrice(uint256 _price) external {
        require(msg.sender == relayer, "Only relayer");
        latestAnswer = _price;
        lastUpdate = block.timestamp;
        emit PriceUpdated(_price, block.timestamp);
    }
    
    /// @notice Users can revert if price is stale
    function isPriceValid() external view returns (bool) {
        return block.timestamp - lastUpdate < MAX_PRICE_AGE;
    }
}
```

**Hackathon Note:** For MVP, use a **mock relayer** pushing prices every hour. Long-term, integrate a decentralized oracle network (e.g., Pyth, or build a Rayls-native oracle with multiple signers).

---

### **3.3 SPYDAOGovernor.sol (Governor Module)**
Standard OZ Governor with low quorum for hackathon.

```solidility
contract SPYDAOGovernor is Governor, GovernorVotes, GovernorCountingSimple {
    constructor(IVotes _spDAOToken)
        Governor("SPY DAO Governor")
        GovernorVotes(_spDAOToken)
    {}
    
    function votingDelay() public pure override returns (uint256) { return 1; } // 1 block
    function votingPeriod() public pure override returns (uint256) { return 45_000; } // ~1 week
    function quorum(uint256 blockNumber) public pure override returns (uint256) {
        return 10 * 1e18; // 10 spDAO shares
    }
    
    function proposeSP500Vote(
        string memory companyTicker,
        uint256 shareholderProposalId,
        bool voteFor,
        string memory description
    ) public returns (uint256) {
        // Encode the off-chain vote instruction
        bytes memory callData = abi.encode(companyTicker, shareholderProposalId, voteFor);
        address executor = address(0); // No on-chain execution, just record
        return propose(executor, 0, callData, description);
    }
}
```

**Proposals are "advisory"**—they signal how the DAO wants to vote. The off-chain executor listens and acts.

---

### **3.4 ZKTLSVoteVerifier.sol (Trustless Execution Proof)**
Core innovation—verify broker API calls without leaking credentials.

```solidity
interface IZKTLSVerifier {
    /// @notice Verifies a ZK proof that a TLS session occurred with expected result
    /// @param proof ZK-SNARK proof (from TLSNotary or Empyreal)
    /// @param publicInputs Hash of [companyTicker, proposalId, voteFor, timestamp, response]
    /// @return isValid Proof is valid and matches expected vote
    function verifyVoteExecution(
        bytes calldata proof,
        bytes32[] calldata publicInputs
    ) external view returns (bool isValid);
}

contract ZKTLSVoteVerifier is IZKTLSVerifier {
    // Verification key for the ZK circuit
    bytes32 public vkHash;
    
    // Store vote commitments to prevent replay
    mapping(bytes32 => bool) public executedVotes;
    
    event VoteExecuted(
        string companyTicker,
        uint256 proposalId,
        bool voteFor,
        bytes32 commitment
    );
    
    /// @notice Submits proof that broker API voted as DAO decided
    /// @dev Executor service calls this after performing vote off-chain
    function submitExecutionProof(
        bytes calldata proof,
        bytes32[] calldata publicInputs,
        string memory companyTicker,
        uint256 proposalId,
        bool voteFor
    ) external {
        bytes32 voteCommitment = keccak256(abi.encode(companyTicker, proposalId, voteFor));
        require(!executedVotes[voteCommitment], "Vote already executed");
        
        // Verify ZK proof matches public inputs
        require(verify(proof, publicInputs), "Invalid ZKTLS proof");
        
        // Verify public inputs match the claimed vote
        require(
            publicInputs[0] == voteCommitment,
            "Proof doesn't match vote"
        );
        
        executedVotes[voteCommitment] = true;
        emit VoteExecuted(companyTicker, proposalId, voteFor, voteCommitment);
    }
    
    function verify(bytes calldata proof, bytes32[] calldata inputs) internal view returns (bool) {
        // Call ZK verifier precompile or library (e.g., Groth16)
        // In hackathon: use mock verifier for speed
        return true; // TODO: Replace with actual ZK verification
    }
}
```

**ZKTLS Flow:**
1. Executor makes **TLS request** to broker API (e.g., `POST /vote`)
2. **TLSNotary** generates a proof: `{ "I made a request to api.broker.com", "Response was 'Vote Accepted'", "Timestamp: ..." }`
3. Proof is submitted on-chain
4. Verifier checks proof without seeing **API keys, account numbers, or full response**

---

### **3.5 VoteExecutorService (Off-Chain)**
Node.js service that bridges on-chain votes to broker API.

```javascript
// Pseudocode for hackathon implementation
import { ethers } from 'ethers';
import { TLSNotary } from 'tlsn-js'; // or Empyreal SDK

const provider = new ethers.providers.JsonRpcProvider(RAYLS_RPC);
const governor = new ethers.Contract(SPYDAO_GOVERNOR_ABI, GOVERNOR_ADDRESS, provider);

// 1. Listen for new proposals
governor.on('ProposalCreated', async (id, proposer, description) => {
  const proposal = await governor.proposals(id);
  const [ticker, proposalId, voteFor] = decodeCallData(proposal.callData);
  
  // 2. Execute vote via broker API
  const apiResponse = await brokerAPI.submitVote({
    ticker,
    proposalId,
    vote: voteFor ? 'FOR' : 'AGAINST',
    shares: await getDAOHoldings(ticker) // From synthetic balance
  });
  
  // 3. Generate ZKTLS proof
  const tlsn = new TLSNotary();
  const proof = await tlsn.notarize(apiResponse.session);
  
  // 4. Submit proof on-chain
  const verifier = new ethers.Contract(ZKTLS_VERIFIER_ABI, VERIFIER_ADDRESS, wallet);
  await verifier.submitExecutionProof(
    proof.bytes,
    proof.publicInputs,
    ticker,
    proposalId,
    voteFor
  );
});
```

---

## **4. User Flows**

### **4.1 Deposit & Mint Shares**
1. User approves USDC to SPYVault
2. Calls `deposit(amount, user)` → receives spDAO shares
3. Shares automatically grant voting power in Governor
4. Off-chain executor detects deposit → buys SPY constituents → updates `syntheticShareBalance` with ZKTLS proof

### **4.2 Delegate Voting Power**
1. User visits UI, sees "Governance Power: 150 spDAO shares"
2. Selects delegate (e.g., "Climate Activist DAO", "Maximize Shareholder Value AI")
3. Calls `delegate(delegateAddress)` on the spDAO token
4. Delegate now votes on their behalf in all S&P 500 proposals

### **4.3 Vote on Shareholder Proposal**
1. UI fetches upcoming votes from Say API / Broadridge
2. User (or delegate) sees: "Tesla Proposal 5: Approve CEO Compensation Package"
3. Submits on-chain vote via `SPYDAOGovernor.castVote(proposalId, support)`
4. After voting period, off-chain executor reads result, votes via broker, submits ZKTLS proof

### **4.4 Redeem & Withdraw**
1. User burns spDAO shares → `redeem(shares, user, user)`
2. Vault calculates proportional USDC + synthetic SPY value
3. Off-chain executor sells SPY shares → transfers USDC to vault
4. User receives USDC

---

## **5. Hackathon Scope & MVP**

### **5.1 Must-Have for Demo**
- ✅ **SPYVault (ERC4626)**: Deposit/mint, NAV calculation with mock oracle
- ✅ **SPYDAOGovernor**: Create proposals, cast votes, delegate power
- ✅ **Basic UI**: Show portfolio, active votes, delegate leaderboard
- ✅ **Mock ZKTLS Verifier**: Submit fake proofs (just verify non-empty)
- ✅ **Execution Service (Simulated)**: Console.log what *would* be executed

### **5.2 Nice-to-Have (Stretch)**
- 🔷 **Live ZKTLS**: Integrate Empyreal SDK for real TLS proofs
- 🔷 **Delegate Marketplace**: Delegate registry with reputation scores
- 🔷 **Dividend Handling**: Mirror SPY dividends to spDAO holders
- 🔷 **Corporate Actions**: Splits, mergers (use manual admin functions)

### **5.3 Do NOT Build for Hackathon**
- ❌ Real brokerage API integration (legal nightmare)
- ❌ SEC-compliant entity formation
- ❌ Multi-sig custody of shares (post-hackathon)

---

## **6. Rayls-Specific Considerations**

| Feature | Rayls Reality | Solution |
|---------|---------------|----------|
| **Oracle** | No native Chainlink | Build `SPYPublicOracle` with optimistic updates + challenges |
| **Gas Costs** | Likely low | Use full storage for UX; optimize later |
| **ZK Precompiles** | May not exist | Use groth16 verifier contract (Solidity) |
| **Bridge** | Need USDC from mainnet | Assume USDC exists, or deploy mock token |

---

## **7. Security Considerations**

### **Smart Contract Risks**
- **Oracle Manipulation**: Stale prices → unfair redemptions. Mitigation: Circuit breaker if price age > 1 hour.
- **Executor Compromise**: Malicious votes. Mitigation: Multi-sig executor, timelocked proposals.
- **ZK Proof Replay**: Same proof submitted twice. Mitigation: Commitment mapping in verifier.
- **Front-Running**: Vote outcome seen, executor frontruns. Mitigation: Commit-reveal for votes (overkill for MVP).

### **Off-Chain Risks**
- **Broker API downtime**: Executor can't vote. Mitigation: Grace period + fallback executor.
- **TLS key compromise**: ZK proof伪造. Mitigation: Use verified ZKTLS libraries only.

---

## **8. Deliverables for Hackathon Submission**

```
├── contracts/
│   ├── SPYVault.sol
│   ├── SPYPublicOracle.sol
│   ├── SPYDAOGovernor.sol
│   ├── ZKTLSVoteVerifier.sol (mock)
│   └── interfaces/
├── scripts/
│   ├── deploy.js (Rayls testnet)
│   └── oracle-relayer.js
├── backend/
│   ├── executor-service/
│   │   ├── index.js (mock broker)
│   │   └── zktls-wrapper.js
├── frontend/
│   ├── components/
│   │   ├── Deposit.tsx
│   │   ├── VoteList.tsx
│   │   └── Delegate.tsx
│   └── hooks/useGovernance.ts
├── test/
│   └── SPYVault.t.sol
└── spec.md (this file)
```

---

## **9. Future Roadmap (Post-Hackathon)**

1. **Legal Wrapper**: Form SPV or partner with tokenized asset platform (Backed Finance, Ondo)
2. **Decentralized Executor**: Multi-sig executor committee with staking & slashing
3. **Full ZKTLS Integration**: Empyreal SDK for production-ready proofs
4. **Layer 2 Scaling**: If gas costs rise, migrate to Rayls L2
5. **Cross-Chain Governance**: Bridge spDAO to Ethereum for broader DeFi composability

---

## **10. Conclusion**

SPY DAO transforms passive index investing into active governance participation. By combining **ERC4626**, **on-chain delegation**, and **ZKTLS-verified execution**, we create a trustless middle layer that restores shareholder rights to millions of investors—starting with the S&P 500.

For the Rayls hackathon, **focus on the composable vault + governance UI + ZKTLS mock**. Off-chain execution is a legal problem; on-chain verification is a *technical* problem—and that's what we solve.

---

**Contact:** Your Team Name  
**Repo:** github.com/yourname/spy-dao  
**Demo URL:** spydao.xyz (vercel)  
