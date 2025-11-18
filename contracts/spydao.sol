// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

interface ISPYPublicOracle {
    function latestAnswer() external view returns (uint256);
}

contract SPYVault is ERC4626, ERC20Permit, ERC20Votes, AccessControl {
    using SafeERC20 for IERC20;

    bytes32 public constant EXECUTOR_ROLE = keccak256("EXECUTOR_ROLE");

    ISPYPublicOracle public immutable spyOracle;
    uint256 public syntheticShareBalance;

    address public immutable BROKER_WALLET;
    uint256 public pendingWithdrawalAmount;
    uint256 public pendingWithdrawalTime;

    uint256 public constant WITHDRAWAL_DELAY = 2 days;
    uint256 public constant MAX_SINGLE_WITHDRAWAL = 100_000 * 1e6;

    constructor(
        IERC20 _mockUSD,
        address _oracle,
        address _executor,
        address _brokerWallet
    )
        ERC20("SPY DAO Share", "spDAO")
        ERC4626(_mockUSD)
        ERC20Permit("SPY DAO Share")
    {
        require(_brokerWallet != address(0), "Invalid broker wallet");
        require(_oracle != address(0), "Invalid oracle");

        spyOracle = ISPYPublicOracle(_oracle);
        BROKER_WALLET = _brokerWallet;

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(EXECUTOR_ROLE, _executor);
    }

    function totalAssets() public view override returns (uint256) {
        uint256 onChainUSD = IERC20(asset()).balanceOf(address(this));
        uint256 offChainValue =
            (spyOracle.latestAnswer() * syntheticShareBalance) / 1e8;
        return onChainUSD + offChainValue;
    }

    function scheduleBrokerWithdrawal(uint256 assets)
        external
        onlyRole(EXECUTOR_ROLE)
    {
        require(assets <= MAX_SINGLE_WITHDRAWAL, "Exceeds max withdrawal");
        require(pendingWithdrawalTime == 0, "Pending withdrawal exists");
        require(assets <= IERC20(asset()).balanceOf(address(this)), "Insufficient balance");

        pendingWithdrawalAmount = assets;
        pendingWithdrawalTime = block.timestamp + WITHDRAWAL_DELAY;
    }

    function executeBrokerWithdrawal()
        external
        onlyRole(EXECUTOR_ROLE)
    {
        require(block.timestamp >= pendingWithdrawalTime, "Delay not met");
        require(pendingWithdrawalAmount > 0, "No pending");

        uint256 amount = pendingWithdrawalAmount;

        delete pendingWithdrawalAmount;
        delete pendingWithdrawalTime;

        IERC20(asset()).safeTransfer(BROKER_WALLET, amount);
    }

    function cancelWithdrawal()
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        delete pendingWithdrawalAmount;
        delete pendingWithdrawalTime;
    }

    function increaseSyntheticHoldings(uint256 shares)
        external
        onlyRole(EXECUTOR_ROLE)
    {
        syntheticShareBalance += shares;
    }

    function decimals()
        public
        view
        override(ERC20, ERC4626)
        returns (uint8)
    {
        return super.decimals();
    }

    function _update(address from, address to, uint256 amount)
        internal
        override(ERC20, ERC20Votes)
    {
        super._update(from, to, amount);
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
