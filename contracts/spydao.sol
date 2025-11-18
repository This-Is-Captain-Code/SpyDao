// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

interface ISPYPublicOracle {
    function latestAnswer() external view returns (uint256);
}

/**
 * @title SPYVault
 * @notice ERC4626 vault that accepts MockUSDC and tracks synthetic SPY exposure
 * @dev Uses timelocked withdrawals to approved broker wallet only
 */
contract SPYVault is ERC4626, ERC20Votes, AccessControl {
    using SafeERC20 for IERC20;

    bytes32 public constant EXECUTOR_ROLE = keccak256("EXECUTOR_ROLE");
    
    ISPYPublicOracle public immutable spyOracle;
    uint256 public syntheticShareBalance; // Total SPY shares held off-chain
    
    // ====== Withdrawal Safety Controls ======
    address public immutable BROKER_WALLET;
    uint256 public pendingWithdrawalAmount;
    uint256 public pendingWithdrawalTime;
    uint256 public constant WITHDRAWAL_DELAY = 2 days;
    uint256 public constant MAX_SINGLE_WITHDRAWAL = 100_000 * 1e6; // $100k USDC max

    // Events
    event WithdrawalScheduled(uint256 amount, uint256 executableAt);
    event SyntheticHoldingsUpdated(uint256 newBalance, uint256 nav);

    /**
     * @param _mockUSDC Address of MockUSDC token (underlying asset)
     * @param _oracle Address of SPY price oracle
     * @param _executor Address of ZKTLS-verified execution service
     * @param _brokerWallet Immutable address where funds can be withdrawn for share purchases
     */
    constructor(
        IERC20 _mockUSDC,
        address _oracle,
        address _executor,
        address _brokerWallet
    ) ERC4626(_mockUSDC) ERC20("SPY DAO Share", "spDAO") ERC20Permit("spDAO") {
        require(_brokerWallet != address(0), "Invalid broker wallet");
        require(_oracle != address(0), "Invalid oracle");
        require(_executor != address(0), "Invalid executor");

        spyOracle = ISPYPublicOracle(_oracle);
        BROKER_WALLET = _brokerWallet;
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(EXECUTOR_ROLE, _executor);
    }

    /**
     * @notice Calculate total assets including off-chain SPY holdings
     * @return NAV in USDC (6 decimals)
     */
    function totalAssets() public view override returns (uint256) {
        uint256 onChainUSDC = asset().balanceOf(address(this));
        uint256 offChainValue = (spyOracle.latestAnswer() * syntheticShareBalance) / 1e8;
        return onChainUSDC + offChainValue;
    }

    /**
     * @notice Schedule withdrawal to broker wallet (timelocked)
     * @dev Only callable by executor role. Creates 2-day delay.
     * @param assets Amount of USDC to withdraw (6 decimals)
     */
    function scheduleBrokerWithdrawal(uint256 assets) external onlyRole(EXECUTOR_ROLE) {
        require(assets <= MAX_SINGLE_WITHDRAWAL, "Exceeds max withdrawal");
        require(pendingWithdrawalTime == 0, "Pending withdrawal exists");
        require(assets <= asset().balanceOf(address(this)), "Insufficient balance");

        pendingWithdrawalAmount = assets;
        pendingWithdrawalTime = block.timestamp + WITHDRAWAL_DELAY;
        
        emit WithdrawalScheduled(assets, pendingWithdrawalTime);
    }

    /**
     * @notice Execute scheduled withdrawal to broker wallet
     * @dev Only callable by executor after delay period
     */
    function executeBrokerWithdrawal() external onlyRole(EXECUTOR_ROLE) {
        require(block.timestamp >= pendingWithdrawalTime, "Delay not met");
        require(pendingWithdrawalAmount > 0, "No pending withdrawal");

        uint256 amount = pendingWithdrawalAmount;
        delete pendingWithdrawalAmount;
        delete pendingWithdrawalTime;

        IERC20(asset()).safeTransfer(BROKER_WALLET, amount);
    }

    /**
     * @notice Cancel pending withdrawal (emergency brake)
     * @dev Only admin can cancel
     */
    function cancelWithdrawal() external onlyRole(DEFAULT_ADMIN_ROLE) {
        delete pendingWithdrawalAmount;
        delete pendingWithdrawalTime;
    }

    /**
     * @notice Update synthetic SPY holdings after off-chain purchase
     * @dev Executor submits proof-of-purchase via ZKTLS, then calls this
     * @param additionalShares Number of SPY shares acquired off-chain
     */
    function increaseSyntheticHoldings(uint256 additionalShares) external onlyRole(EXECUTOR_ROLE) {
        syntheticShareBalance += additionalShares;
        emit SyntheticHoldingsUpdated(syntheticShareBalance, totalAssets());
    }

    /**
     * @notice View current synthetic holdings for transparency
     * @return Total SPY shares held off-chain
     */
    function getSyntheticHoldings() external view returns (uint256) {
        return syntheticShareBalance;
    }

    // ====== OVERRIDES FOR ERC20Votes COMPATIBILITY ======

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
