// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./ISPYPublicOracle.sol";

/// @title MockSPYOracle
/// @notice Simple on-chain mock for SPY price, used for testing / devnet
contract MockSPYOracle is ISPYPublicOracle {
    // Price with 8 decimals, e.g. 500 * 1e8 = $500
    uint256 private _price;

    event PriceUpdated(uint256 oldPrice, uint256 newPrice);

    constructor(uint256 initialPrice) {
        _price = initialPrice;
    }

    function latestAnswer() external view override returns (uint256) {
        return _price;
    }

    /// @notice Demo-only setter; anyone can change the price for hackathon use.
    function setPrice(uint256 newPrice) external {
        uint256 old = _price;
        _price = newPrice;
        emit PriceUpdated(old, newPrice);
    }
}
