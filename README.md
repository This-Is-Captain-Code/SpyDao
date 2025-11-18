````markdown
# SPY DAO – Democratizing Index Fund Governance

An on-chain governance system that gives SPY-style index investors a structured way to coordinate how their underlying voting rights should be used, with a vault and governor that are designed from day one with compliance and risk controls in mind.

---

## 🎯 Problem

Index funds manage **trillions** in assets, but investors typically surrender their governance rights.

When the S&P 500 votes on climate policies, compensation, or governance reforms, ordinary SPY holders don’t vote directly – large asset managers vote on their behalf. This creates a massive **principal–agent problem**: the people who own the capital often don’t control how it’s used.

---

## 🚀 Solution

**SPY DAO** is a delegated governance vault that:

1. **Issues liquid shares** (`spDAO`) representing proportional SPY-style exposure via an ERC-4626 vault.
2. **Aggregates voting power** from all depositors into a single on-chain Governor contract.
3. **Democratically decides** how to vote on S&P 500 shareholder proposals.
4. **Rewards participation** by distributing tokens (e.g. stablecoins) to voters who show up.
5. **Builds in compliance & risk controls** at the contract level:
   - KYC gating for deposits/withdrawals.
   - Sanctions blocking on transfers.
   - Oracle sanity checks and emergency modes.
   - Time-delayed broker withdrawals with configurable limits.

ZK-TLS proofs and fully trustless broker integrations are part of the **future roadmap**, not this MVP.

---

## 🏗️ Architecture (MVP)

```text
┌─────────────────────────────────────────────────────────────┐
│                         USERS (Rayls)                      │
│                                                             │
│  1. Faucet MockUSD                                          │
│  2. Deposit into SPYVault → Receive spDAO                   │
│  3. Delegate / vote in SPYDAOGovernor                       │
│  4. Claim governance rewards in MockUSD                     │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                     ON-CHAIN (Rayls)                       │
│                                                             │
│  MockUSD          – 6-decimals test USD token               │
│  MockSPYOracle    – mock SPY price feed (8 decimals)        │
│                                                             │
│  SPYVault (ERC4626 + ERC20Votes + AccessControl)            │
│    • totalAssets = on-chain USD + synthetic SPY exposure    │
│    • KYC + sanctions gating                                 │
│    • Global pause                                           │
│    • Broker withdrawal pipeline (delay + caps)              │
│                                                             │
│  SPYDAOGovernor (Governor + GovernorVotes)                  │
│    • Proposals for S&P 500 shareholder votes                │
│    • Voting power = spDAO voting weight                     │
│    • Voter reward mechanism using REWARD_TOKEN (MockUSD)    │
└─────────────────────────────────────────────────────────────┘
````

Future extension (not in MVP code yet):

```text
┌─────────────────────────────────────────────────────────────┐
│          ZK-TLS Verifier (VoteExecutionProof.sol)           │
│  • Verifies broker API calls with zero-knowledge proofs     │
│  • Anchors off-chain execution back on-chain                │
└─────────────────────────────────────────────────────────────┘
```

---

## 🧩 Core Components

### `SPYVault.sol` (ERC-4626 + Governance + Compliance)

The main vault that wraps a USD-like token and mints governance-enabled shares (**spDAO**).

**Standards & base contracts**

* `ERC4626` – vault over `MockUSD` (underlying asset).
* `ERC20` – share token: **SPY DAO Share** (`spDAO`).
* `ERC20Permit` – gasless approvals.
* `ERC20Votes` – snapshot-based voting power for governance.
* `AccessControl` – roles for admin, executor, and compliance.

**Roles**

* `DEFAULT_ADMIN_ROLE`

  * Manages other roles.
  * Can update `maxSingleWithdrawal`.
  * Can toggle synthetic accounting mode (`setIgnoreSynthetic`).
* `EXECUTOR_ROLE`

  * Updates synthetic SPY exposure (`setSyntheticHoldings`).
  * Schedules and executes broker withdrawals.
* `COMPLIANCE_ROLE`

  * Manages KYC and sanctions flags.
  * Controls global pause (`setGlobalPause`).

**Synthetic exposure & price oracle**

* `ISPYPublicOracle` – interface with `latestAnswer() -> uint256` (SPY price, 8 decimals).
* `MockSPYOracle` – simple mock implementation for devnet with:

  * `setPrice(uint256 newPrice)` to adjust SPY price (for testing).
* `syntheticShareBalance` – tracks how much synthetic SPY exposure the vault models (trusted).
* `totalAssets()`:

  * Always counts on-chain USD: `IERC20(asset()).balanceOf(address(this))`.
  * Tries to add synthetic value:

    * Calls `spyOracle.latestAnswer()` in a `try/catch`.
    * Rejects 0 or absurd prices (`> MAX_ORACLE_PRICE`).
    * Computes `offChainValue = price * syntheticShareBalance / 1e8`.
  * If `ignoreSynthetic == true` or oracle fails, `totalAssets()` falls back to on-chain USD only.

This design reflects the reality that underlying SPY execution happens off-chain, but the vault needs an on-chain model of value that doesn’t break if the oracle misbehaves.

**Broker withdrawal pipeline**

To mirror sending funds to a broker/custodian that actually buys SPY, the vault defines a controlled withdrawal flow:

* `BROKER_WALLET` – broker hot wallet receiving underlying asset.
* `WITHDRAWAL_DELAY = 2 days` – minimum delay from scheduling to execution.
* `maxSingleWithdrawal` – per-withdrawal cap in underlying token units.

Flow:

1. `scheduleBrokerWithdrawal(uint256 assets)`

   * `EXECUTOR_ROLE` only, vault not paused.
   * Requires:

     * `assets <= maxSingleWithdrawal`.
     * No existing pending withdrawal.
     * `assets <= current on-chain balance`.
   * Sets `pendingWithdrawalAmount` and `pendingWithdrawalTime = now + WITHDRAWAL_DELAY`.
   * Emits `ScheduledBrokerWithdrawal(amount, executeAfter)`.

2. `executeBrokerWithdrawal()`

   * `EXECUTOR_ROLE` only, vault not paused.
   * Requires:

     * `block.timestamp >= pendingWithdrawalTime`.
     * `pendingWithdrawalAmount > 0`.
     * Vault still has enough balance at execution.
   * Transfers underlying to `BROKER_WALLET`.
   * Clears pending state.
   * Emits `ExecutedBrokerWithdrawal(amount, brokerWallet)`.

3. `cancelWithdrawal()`

   * `DEFAULT_ADMIN_ROLE` only.
   * Clears pending state.
   * Emits `CancelledBrokerWithdrawal()`.

This makes withdrawals to the broker **visible, delayed, capped, and cancellable**, instead of arbitrary pushes.

---

### `SPYDAOGovernor.sol` (Governor + Voting Rewards)

The Governor coordinates how SPY DAO votes on S&P 500 shareholder proposals and rewards participation.

**Base contracts**

* `Governor`
* `GovernorCountingSimple`
* `GovernorVotes` (uses `spDAO` as voting token)

**Parameters**

* `VOTING_DELAY = 1` block.
* `VOTING_PERIOD = 45_000` blocks (~1 week on Rayls, depending on block time).
* `QUORUM = 10 * 1e18` (10 spDAO, assuming 18-decimals share token).

**Proposal metadata**

```solidity
struct SP500Proposal {
    string companyTicker;          // e.g. "AAPL"
    uint256 shareholderProposalId; // from Broadridge / Say / etc.
    bool voteFor;                  // what the DAO recommends (for/against)
    uint256 totalVotes;            // total voting weight participating
    bool executed;                 // set on Governor execution
}
```

* `mapping(uint256 => SP500Proposal) public sp500Proposals;`
* `mapping(uint256 => mapping(address => bool)) public hasClaimedReward;`

**Creating an S&P 500 vote**

```solidity
function proposeSP500Vote(
    string memory companyTicker,
    uint256 shareholderProposalId,
    bool voteFor,
    string memory description
) external returns (uint256)
```

* Creates an advisory proposal (no on-chain side effects).
* Stores metadata in `sp500Proposals[proposalId]`.
* Underlying Governor mechanics handle voting windows and states.

**Voting & tracking participation**

Overrides `_castVote` to track participation:

* Calls parent `_castVote` to record the vote.
* Increments `proposal.totalVotes` by the voter’s weight.
* Emits `SP500VoteCast(proposalId, ticker, support == 1, voter, weight)`.

**Reward token & economics**

* `IERC20 public immutable REWARD_TOKEN;`
  In the MVP, this is the **MockUSD** token.
* `REWARD_PER_VOTE = 1e16` (0.01 units per 1e18 voting weight).

Rewards are linear in voting weight:

```solidity
reward = (votingWeight * REWARD_PER_VOTE) / 1e18;
```

**Claiming rewards**

```solidity
function claimRewards(uint256 proposalId) external
```

Checks:

* Voting period has ended.
* Caller hasn’t already claimed for this proposal.
* There were votes (`proposal.totalVotes > 0`).
* Caller had voting power at the proposal snapshot (via `getVotes`).

If all checks pass:

* Transfers reward from Governor to caller.
* Increments `totalRewardsDistributed`.
* Marks `hasClaimedReward[proposalId][msg.sender] = true`.
* Emits `RewardsClaimed(proposalId, voter, reward)`.

**Funding the reward pool**

```solidity
function distributeRewards(uint256 amount) external {
    REWARD_TOKEN.safeTransferFrom(msg.sender, address(this), amount);
}
```

Anyone can fund future rewards by transferring `MockUSD` into the Governor.

---

### `MockUSD.sol`

A minimal mock stablecoin used for both:

* Vault underlying.
* Governance rewards.

Features:

* Name: **Mock USD**, symbol: **mUSD**.
* `decimals() = 6`.
* Mints 1,000,000 mUSD to deployer on construction.
* `mint(address to, uint256 amount)` – unrestricted mint (testing only).
* `faucet()` – mints 1,000 mUSD to caller for easy local testing.

---

### `ISPYPublicOracle.sol` & `MockSPYOracle.sol`

* `ISPYPublicOracle` – interface with `latestAnswer() external view returns (uint256)`.
* `MockSPYOracle` – simple mock implementation with:

  * `_price` stored internally (8 decimals).
  * `latestAnswer()` returning `_price`.
  * `setPrice(uint256 newPrice)` to adjust price (open to anyone in this MVP).
  * `PriceUpdated(oldPrice, newPrice)` event for observability.

---

## 🧱 Compliance Considerations in the Design

The contracts are intentionally structured to be compatible with a more regulated environment:

1. **KYC gating on capital flows**

   * All `deposit`, `mint`, `withdraw`, `redeem` operations require:

     * `isKYCCompleted[account] == true` for caller, receiver, and owner (where applicable).
   * KYC flags managed by `COMPLIANCE_ROLE` via `setComplianceStatus`.

2. **Sanctions / block lists**

   * `isSanctionsBlocked[account]` prevents:

     * Vault entry/exit via deposit/withdraw/redeem.
     * Transfers of spDAO tokens in `_update` (both `from` and `to`).
   * This allows implementing sanctions lists, fraud blocks, and off-chain compliance screening.

3. **Global pause switch**

   * `globalPause` can be toggled by `COMPLIANCE_ROLE`.
   * When `true`, all deposit/mint/withdraw/redeem operations revert.
   * Gives a clear “circuit breaker” in case of regulatory or technical incidents.

4. **Oracle risk controls**

   * `totalAssets()` uses a `try/catch` around `spyOracle.latestAnswer()`.
   * Discards zero or out-of-bound prices (`> MAX_ORACLE_PRICE`).
   * If the oracle fails or misbehaves, the vault falls back to on-chain USD only, instead of exploding NAV.

5. **Emergency accounting mode**

   * Admin can call `setIgnoreSynthetic(true)` to tell the vault:

     * Treat synthetic SPY exposure as zero.
     * Only use on-chain USD for NAV until things are stable again.

6. **Supervised broker withdrawals**

   * Withdrawals to the broker are:

     * **Delayed** (2-day minimum).
     * **Capped** per withdrawal (`maxSingleWithdrawal`).
     * **Visible** via events.
     * **Cancellable** by admin.
   * This aligns with a world where regulated custodians and brokers are involved, and large flows shouldn’t be instantaneous or invisible.

7. **Auditability**

   * Key actions emit structured events:

     * `ComplianceStatusUpdated`
     * `GlobalPauseSet`
     * `SyntheticHoldingsUpdated`
     * `SyntheticAccountingModeSet`
     * `ScheduledBrokerWithdrawal` / `ExecutedBrokerWithdrawal` / `CancelledBrokerWithdrawal`
     * `SP500VoteCast`, `ProposalExecuted`, `RewardsClaimed`
   * These make it easier to build dashboards and off-chain audit trails.

---

## 🚀 Getting Started (MVP)

### Prerequisites

* Node.js **18+**
* `npm`
* Access to **Rayls Devnet RPC**
* A funded Rayls Devnet account (private key) for deployment

### 1. Clone & install

```bash
git clone <repository-url>
cd SpyDao
npm install
```

### 2. Configure environment

Create a `.env` file in the project root:

```bash
PRIVATE_KEY=0xYOUR_PRIVATE_KEY   # Deployer key (Rayls devnet)
RAYLS_RPC=https://devnet-rpc.rayls.com
PUBLIC_KEY=0xYourPublicAddress   # (optional, informational)
```

Make sure `.env` is in `.gitignore` (it already is in this repo).

### 3. Compile contracts

```bash
npx hardhat compile
```

This compiles:

* `SPYVault`
* `SPYDAOGovernor`
* `MockUSD`
* `MockSPYOracle`
* `ISPYPublicOracle` interface

### 4. Deploy to Rayls Devnet

Use the provided Hardhat deployment script:

```bash
npx hardhat run scripts/deploy.js --network rayls
```

The script will:

1. Deploy `MockUSD`.
2. Deploy `MockSPYOracle` with an initial SPY price.
3. Deploy `SPYVault`, wired to:

   * `MockUSD` as underlying asset.
   * `MockSPYOracle` as oracle.
   * Deployer as `EXECUTOR_ROLE`, `BROKER_WALLET`, and initial `COMPLIANCE_ROLE`.
4. Deploy `SPYDAOGovernor`, wired to:

   * `SPYVault` as voting token.
   * `MockUSD` as `REWARD_TOKEN`.

### Deployed Addresses (Rayls Devnet)

Deployer: `0xaFEf2f5626961ba219Cd9Eb1D7A1f1B08896DD08`

| Contract        | Address                                      | Explorer Link                                                                 |
|----------------|----------------------------------------------|-------------------------------------------------------------------------------|
| MockUSD        | `0xB6c7B1ef0947596FC2d8eBE577b97f34cBBD2Fb1` | https://devnet-explorer.rayls.com/address/0xB6c7B1ef0947596FC2d8eBE577b97f34cBBD2Fb1 |
| MockSPYOracle  | `0x19a881AF139D665bD857Aedf6EDcBc0dBee52765` | https://devnet-explorer.rayls.com/address/0x19a881AF139D665bD857Aedf6EDcBc0dBee52765 |
| SPYVault       | `0x2181BaAAb16e8a4E08c7fFAB8DA1780B53eD05D2` | https://devnet-explorer.rayls.com/address/0x2181BaAAb16e8a4E08c7fFAB8DA1780B53eD05D2 |
| SPYDAOGovernor | `0x4DD81784392EC93a7e88e190Baca21EfF486895D` | https://devnet-explorer.rayls.com/address/0x4DD81784392EC93a7e88e190Baca21EfF486895D |

#### Deployed addresses (for frontend)

```json
{
  "network": "rayls",
  "deployer": "0xaFEf2f5626961ba219Cd9Eb1D7A1f1B08896DD08",
  "MockUSD": "0xB6c7B1ef0947596FC2d8eBE577b97f34cBBD2Fb1",
  "MockSPYOracle": "0x19a881AF139D665bD857Aedf6EDcBc0dBee52765",
  "SPYVault": "0x2181BaAAb16e8a4E08c7fFAB8DA1780B53eD05D2",
  "SPYDAOGovernor": "0x4DD81784392EC93a7e88e190Baca21EfF486895D"
}

## 🛠️ App Development (Frontend / Backend)

The repo is a full-stack Rayls app:

### Scripts

* `npm run dev` – Start dev server (frontend + backend).
* `npm run build` – Build for production.
* `npm run start` – Run production build.
* `npm run check` – TypeScript type checking.
* `npm run db:push` – Apply Drizzle schema changes.

### Tech Stack

**Frontend**

* React 18 + TypeScript
* Vite
* Tailwind CSS
* Radix UI
* Wouter
* TanStack Query
* Framer Motion

**Backend**

* Node.js + Express
* TypeScript
* Drizzle ORM
* Neon/Postgres
* WebSocket for real-time updates

**Smart Contracts**

* Solidity `^0.8.20`
* Hardhat
* OpenZeppelin contracts
* Deployed on Rayls Devnet

**Integration**

* Ethers.js for contract calls from the app.
* (Future) Broker APIs + ZK-TLS verification.

### Project Structure (high level)

```text
SpyDao/
├── server/                # Express backend
│   ├── db/                # Drizzle schema and migrations
│   ├── routes/            # REST endpoints (if used in UI)
│   └── services/          # Business logic
├── src/                   # React frontend
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   └── lib/
├── contracts/             # Solidity smart contracts
│   ├── spydao.sol         # SPYVault
│   ├── SpyDaoGovernor.sol # Governor + rewards
│   ├── mockusd.sol        # MockUSD
│   ├── ISPYPublicOracle.sol
│   └── MockSPYOracle.sol
└── scripts/               # Hardhat deploy scripts
```

---

## 🧪 Testing

### Smart contracts

```bash
npx hardhat test
```

(Add or extend tests in `test/` as you build out the protocol.)

### Frontend / Backend

If/when app tests are configured:

```bash
npm test        # unit/integration tests
npm run test:e2e  # end-to-end tests (if added)
```

---

## 🔐 Security & Risk Posture (MVP)

This MVP attempts to be **honest** about the trust model while still being hackathon-stage code:

* **Access Control**

  * Role-based permissions for admin, executor, and compliance operations.
  * Executor and admin are powerful; users must currently trust them not to mismanage synthetic exposure or broker withdrawals.

* **Compliance-aware flows**

  * KYC gating and sanctions blocking integrated into vault entry/exit and token transfers.
  * Global pause switch for operational or regulatory incidents.

* **Oracle & synthetic exposure**

  * Oracle responses are sanity-checked and wrapped in `try/catch`.
  * Hard cap on acceptable prices.
  * Emergency mode to ignore synthetic exposure and fall back to on-chain balances.

* **Broker risk**

  * Withdrawals to broker are delayed, capped, cancellable, and observable via events.
  * No arbitrary “drain” function; the pipeline is explicit.

* **Governance rewards**

  * Reward logic is transparent and linear in voting weight.
  * Rewards must be explicitly funded via `distributeRewards`.

For production, this would need additional work (multi-sig governance, richer oracle infrastructure, off-chain monitoring, formal review, etc.), but the MVP contracts are structured so those layers can be added without rewriting from scratch.

---

## 📄 License

MIT – see `LICENSE`.

---

## 🏆 Built at Rayls Hackathon

SPY DAO was built for the Rayls Hackathon as a prototype for bringing real-world index fund governance on-chain, with a focus on practical compliance constraints and user-aligned voting mechanisms rather than purely theoretical token voting.

