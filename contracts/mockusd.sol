// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title MockUSD
 * @notice Mock USD stablecoin for testing on Rayls
 * @dev Simple ERC20 with minting capability for testing
 */
contract MockUSD is ERC20 {
    uint8 private _decimals;

    /**
     * @notice Constructor to create Mock USD
     * @dev Mints initial supply to deployer
     */
    constructor() ERC20("Mock USD", "mUSD") {
        _decimals = 6; // 6 decimals like most stablecoins
        _mint(msg.sender, 1000000 * 10**6); // Mint 1 million mUSD to deployer
    }

    /**
     * @notice Returns the number of decimals
     * @return Number of decimals (6)
     */
    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }

    /**
     * @notice Mint new tokens (for testing purposes)
     * @param to Address to mint tokens to
     * @param amount Amount of tokens to mint
     */
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }

    /**
     * @notice Faucet function - anyone can claim 1000 mUSD
     * @dev Useful for testing without needing the deployer to distribute
     */
    function faucet() external {
        _mint(msg.sender, 1000 * 10**6); // Mint 1000 mUSD
    }
}