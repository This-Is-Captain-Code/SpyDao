// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface ISPYPublicOracle {
    /// @notice Returns SPY price with 8 decimals (e.g. 500.12 USD = 50012000000)
    function latestAnswer() external view returns (uint256);
}
