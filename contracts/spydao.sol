// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title RaylsVault
 * @notice ERC4626 compliant vault for Rayls chain with admin withdrawal functionality
 * @dev Extends standard ERC4626 with additional admin controls
 */
contract RaylsVault is ERC4626, Ownable {
    using SafeERC20 for IERC20;

    // Events
    event AdminWithdrawal(address indexed admin, uint256 assets, address indexed to);
    event EmergencyWithdrawal(address indexed admin, uint256 assets, address indexed to);

    /**
     * @notice Constructor to initialize the vault
     * @param asset_ The underlying ERC20 asset (Mock USD address)
     * @param name_ Name of the vault share token
     * @param symbol_ Symbol of the vault share token
     * @param initialOwner Address of the initial owner/admin
     */
    constructor(
        IERC20 asset_,
        string memory name_,
        string memory symbol_,
        address initialOwner
    ) ERC4626(asset_) ERC20(name_, symbol_) Ownable(initialOwner) {}

    /**
     * @notice Deposit assets into the vault and receive shares
     * @param assets Amount of assets to deposit
     * @param receiver Address to receive the vault shares
     * @return shares Amount of shares minted
     */
    function deposit(uint256 assets, address receiver) 
        public 
        virtual 
        override 
        returns (uint256 shares) 
    {
        require(assets > 0, "RaylsVault: Cannot deposit 0");
        require(receiver != address(0), "RaylsVault: Invalid receiver");

        shares = super.deposit(assets, receiver);
    }

    /**
     * @notice User withdraws their assets by burning shares
     * @param assets Amount of assets to withdraw
     * @param receiver Address to receive the assets
     * @param owner Address of the share owner
     * @return shares Amount of shares burned
     */
    function withdraw(
        uint256 assets,
        address receiver,
        address owner
    ) public virtual override returns (uint256 shares) {
        require(assets > 0, "RaylsVault: Cannot withdraw 0");
        require(receiver != address(0), "RaylsVault: Invalid receiver");

        shares = super.withdraw(assets, receiver, owner);
    }

    /**
     * @notice Admin function to withdraw specific amount of assets
     * @dev Only callable by contract owner
     * @param assets Amount of assets to withdraw
     * @param to Address to send the withdrawn assets
     */
    function adminWithdraw(uint256 assets, address to) 
        external 
        onlyOwner 
    {
        require(assets > 0, "RaylsVault: Cannot withdraw 0");
        require(to != address(0), "RaylsVault: Invalid recipient");
        require(assets <= totalAssets(), "RaylsVault: Insufficient assets");

        IERC20(asset()).safeTransfer(to, assets);

        emit AdminWithdrawal(msg.sender, assets, to);
    }

    /**
     * @notice Emergency admin withdrawal of all assets
     * @dev Only callable by contract owner. Use with caution!
     * @param to Address to send all assets
     */
    function emergencyWithdrawAll(address to) 
        external 
        onlyOwner 
    {
        require(to != address(0), "RaylsVault: Invalid recipient");

        uint256 totalBalance = totalAssets();
        require(totalBalance > 0, "RaylsVault: No assets to withdraw");

        IERC20(asset()).safeTransfer(to, totalBalance);

        emit EmergencyWithdrawal(msg.sender, totalBalance, to);
    }

    /**
     * @notice Get the maximum amount of assets an owner can withdraw
     * @param owner Address of the share owner
     * @return Maximum withdrawable assets
     */
    function maxWithdraw(address owner) 
        public 
        view 
        virtual 
        override 
        returns (uint256) 
    {
        uint256 ownerAssets = convertToAssets(balanceOf(owner));
        uint256 vaultAssets = totalAssets();
        return ownerAssets > vaultAssets ? vaultAssets : ownerAssets;
    }

    /**
     * @notice Get the total assets held by the vault
     * @return Total amount of underlying assets
     */
    function totalAssets() 
        public 
        view 
        virtual 
        override 
        returns (uint256) 
    {
        return IERC20(asset()).balanceOf(address(this));
    }
}