// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import "./ISPYPublicOracle.sol";

/// @title SPYVault
/// @notice ERC-4626 vault over a USD-like token, with governance (ERC20Votes),
///         synthetic SPY exposure, broker withdrawal pipeline, and a basic
///         compliance layer (KYC, sanctions, pause).
contract SPYVault is ERC4626, ERC20Permit, ERC20Votes, AccessControl {
    using SafeERC20 for IERC20;

    // --- Roles ---

    bytes32 public constant EXECUTOR_ROLE   = keccak256("EXECUTOR_ROLE");
    bytes32 public constant COMPLIANCE_ROLE = keccak256("COMPLIANCE_ROLE");

    // --- Oracle & synthetic exposure ---

    ISPYPublicOracle public immutable spyOracle;
    uint256 public syntheticShareBalance; // "units" of SPY exposure

    /// @notice If true, ignore synthetic exposure in totalAssets() (emergency mode)
    bool public ignoreSynthetic;

    /// @notice Hard upper bound for oracle price to avoid insane values.
    ///         Assumes oracle has 8 decimals: 1,000,000 USD per SPY.
    uint256 public constant MAX_ORACLE_PRICE = 1_000_000 * 1e8;

    // --- Broker withdrawal state ---

    address public immutable BROKER_WALLET;

    uint256 public pendingWithdrawalAmount;
    uint256 public pendingWithdrawalTime;

    /// @notice Delay between scheduling and executing broker withdrawals
    uint256 public constant WITHDRAWAL_DELAY = 2 days;

    /// @notice Max per-withdrawal amount in underlying units (configurable)
    uint256 public maxSingleWithdrawal;

    // --- Compliance state ---

    /// @notice Whether address has successfully completed KYC/CDD off-chain.
    mapping(address => bool) public isKYCCompleted;

    /// @notice Whether address is blocked (e.g. sanctions, fraud).
    mapping(address => bool) public isSanctionsBlocked;

    /// @notice Global pause for emergencies (regulatory or security).
    bool public globalPause;

    // --- Events ---

    event ComplianceStatusUpdated(
        address indexed account,
        bool kycCompleted,
        bool isBlocked,
        string reason
    );

    event GlobalPauseSet(bool paused);

    event ScheduledBrokerWithdrawal(
        uint256 amount,
        uint256 executeAfter
    );

    event ExecutedBrokerWithdrawal(
        uint256 amount,
        address indexed brokerWallet
    );

    event CancelledBrokerWithdrawal();

    event SyntheticHoldingsUpdated(
        uint256 oldBalance,
        uint256 newBalance,
        string reason
    );

    event SyntheticAccountingModeSet(bool ignoreSynthetic);

    event MaxSingleWithdrawalUpdated(uint256 oldValue, uint256 newValue);

    // --- Modifiers ---

    modifier notPaused() {
        require(!globalPause, "Vault is paused");
        _;
    }

    modifier onlyCompliant(address account) {
        require(isKYCCompleted[account], "KYC required");
        require(!isSanctionsBlocked[account], "Address blocked");
        _;
    }

    // --- Constructor ---

    /// @param _asset            Underlying ERC20 (USD-like token)
    /// @param _oracle           SPY price oracle (8 decimal answer)
    /// @param _executor         Address with EXECUTOR_ROLE
    /// @param _brokerWallet     Broker hotwallet that receives underlying
    /// @param _complianceOfficer Address with COMPLIANCE_ROLE
    /// @param _maxSingleWithdrawal Max per-withdrawal amount in underlying units
    constructor(
        IERC20 _asset,
        address _oracle,
        address _executor,
        address _brokerWallet,
        address _complianceOfficer,
        uint256 _maxSingleWithdrawal
    )
        ERC20("SPY DAO Share", "spDAO")
        ERC4626(_asset)
        ERC20Permit("SPY DAO Share")
    {
        require(_oracle != address(0), "Invalid oracle");
        require(_brokerWallet != address(0), "Invalid broker wallet");
        require(_complianceOfficer != address(0), "Invalid compliance");
        require(_maxSingleWithdrawal > 0, "Invalid max withdrawal");

        spyOracle = ISPYPublicOracle(_oracle);
        BROKER_WALLET = _brokerWallet;
        maxSingleWithdrawal = _maxSingleWithdrawal;

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(EXECUTOR_ROLE, _executor);
        _grantRole(COMPLIANCE_ROLE, _complianceOfficer);

        // Optional: deployer can also act as compliance operator initially.
        _grantRole(COMPLIANCE_ROLE, msg.sender);
    }

    // ============================================================
    //                  ASSET ACCOUNTING / ORACLE
    // ============================================================

    /// @notice Total assets = on-chain USD balance + synthetic SPY value,
    ///         unless ignoreSynthetic is enabled or oracle fails/sanitized.
    function totalAssets() public view override returns (uint256) {
        uint256 onChainUSD = IERC20(asset()).balanceOf(address(this));

        if (ignoreSynthetic) {
            // Emergency mode: treat vault as holding only on-chain USD.
            return onChainUSD;
        }

        uint256 offChainValue = 0;

        // Avoid bricking on oracle failure; treat as 0 exposure if bad.
        try spyOracle.latestAnswer() returns (uint256 price) {
            if (price > 0 && price <= MAX_ORACLE_PRICE) {
                // oracle has 8 decimals; syntheticShareBalance is in SPY units
                offChainValue = (price * syntheticShareBalance) / 1e8;
            }
        } catch {
            // Revert or error -> offChainValue stays 0
        }

        return onChainUSD + offChainValue;
    }

    /// @notice Update synthetic holdings (up or down), e.g. after broker trades.
    /// @dev Still a trusted operation; controlled by EXECUTOR_ROLE.
    function setSyntheticHoldings(uint256 newBalance, string calldata reason)
        external
        onlyRole(EXECUTOR_ROLE)
        notPaused
    {
        uint256 old = syntheticShareBalance;
        syntheticShareBalance = newBalance;

        emit SyntheticHoldingsUpdated(old, newBalance, reason);
    }

    /// @notice Switch between "include synthetic" and "on-chain-only" modes.
    function setIgnoreSynthetic(bool ignore)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        ignoreSynthetic = ignore;
        emit SyntheticAccountingModeSet(ignore);
    }

    // ============================================================
    //                      BROKER WITHDRAWALS
    // ============================================================

    /// @notice Set new max per-withdrawal amount in underlying units.
    function setMaxSingleWithdrawal(uint256 newMax)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        require(newMax > 0, "Invalid max withdrawal");
        uint256 old = maxSingleWithdrawal;
        maxSingleWithdrawal = newMax;
        emit MaxSingleWithdrawalUpdated(old, newMax);
    }

    /// @notice Schedule a broker withdrawal with a fixed delay.
    function scheduleBrokerWithdrawal(uint256 assets)
        external
        onlyRole(EXECUTOR_ROLE)
        notPaused
    {
        require(assets <= maxSingleWithdrawal, "Exceeds max withdrawal");
        require(pendingWithdrawalTime == 0, "Pending withdrawal exists");
        require(
            assets <= IERC20(asset()).balanceOf(address(this)),
            "Insufficient balance"
        );

        pendingWithdrawalAmount = assets;
        pendingWithdrawalTime = block.timestamp + WITHDRAWAL_DELAY;

        emit ScheduledBrokerWithdrawal(assets, pendingWithdrawalTime);
    }

    /// @notice Execute a previously scheduled broker withdrawal.
    function executeBrokerWithdrawal()
        external
        onlyRole(EXECUTOR_ROLE)
        notPaused
    {
        require(block.timestamp >= pendingWithdrawalTime, "Delay not met");
        require(pendingWithdrawalAmount > 0, "No pending");

        uint256 amount = pendingWithdrawalAmount;

        // Re-check balance at execution time
        require(
            amount <= IERC20(asset()).balanceOf(address(this)),
            "Insufficient balance at execute"
        );

        delete pendingWithdrawalAmount;
        delete pendingWithdrawalTime;

        IERC20(asset()).safeTransfer(BROKER_WALLET, amount);

        emit ExecutedBrokerWithdrawal(amount, BROKER_WALLET);
    }

    /// @notice Cancel any pending broker withdrawal.
    function cancelWithdrawal()
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        delete pendingWithdrawalAmount;
        delete pendingWithdrawalTime;

        emit CancelledBrokerWithdrawal();
    }

    // ============================================================
    //                         COMPLIANCE
    // ============================================================

    /// @notice Update KYC / sanctions status for an account.
    /// @dev Called by off-chain compliance ops / oracle after checks.
    function setComplianceStatus(
        address account,
        bool kycCompleted,
        bool blocked,
        string calldata reason
    )
        external
        onlyRole(COMPLIANCE_ROLE)
    {
        isKYCCompleted[account]     = kycCompleted;
        isSanctionsBlocked[account] = blocked;

        emit ComplianceStatusUpdated(account, kycCompleted, blocked, reason);
    }

    /// @notice Global pause/unpause for regulatory or security events.
    function setGlobalPause(bool paused_)
        external
        onlyRole(COMPLIANCE_ROLE)
    {
        globalPause = paused_;
        emit GlobalPauseSet(paused_);
    }

    // ============================================================
    //                  ERC4626 ENTRYPOINTS (GATED)
    // ============================================================

    function deposit(uint256 assets, address receiver)
        public
        override
        notPaused
        onlyCompliant(msg.sender)
        onlyCompliant(receiver)
        returns (uint256)
    {
        return super.deposit(assets, receiver);
    }

    function mint(uint256 shares, address receiver)
        public
        override
        notPaused
        onlyCompliant(msg.sender)
        onlyCompliant(receiver)
        returns (uint256)
    {
        return super.mint(shares, receiver);
    }

    function withdraw(
        uint256 assets,
        address receiver,
        address owner
    )
        public
        override
        notPaused
        onlyCompliant(msg.sender)
        onlyCompliant(receiver)
        onlyCompliant(owner)
        returns (uint256)
    {
        return super.withdraw(assets, receiver, owner);
    }

    function redeem(
        uint256 shares,
        address receiver,
        address owner
    )
        public
        override
        notPaused
        onlyCompliant(msg.sender)
        onlyCompliant(receiver)
        onlyCompliant(owner)
        returns (uint256)
    {
        return super.redeem(shares, receiver, owner);
    }

    // ============================================================
    //                  ERC20 / VOTES / PERMIT OVERRIDES
    // ============================================================

    /// @notice Prevent transfers from/to sanctioned addresses.
    function _update(address from, address to, uint256 amount)
        internal
        override(ERC20, ERC20Votes)
    {
        if (from != address(0)) {
            require(!isSanctionsBlocked[from], "From blocked");
        }
        if (to != address(0)) {
            require(!isSanctionsBlocked[to], "To blocked");
        }

        super._update(from, to, amount);
    }

    function decimals()
        public
        view
        override(ERC20, ERC4626)
        returns (uint8)
    {
        return super.decimals();
    }

    function nonces(address owner)
        public
        view
        override(ERC20Permit, Nonces)
        returns (uint256)
    {
        return super.nonces(owner);
    }
}
