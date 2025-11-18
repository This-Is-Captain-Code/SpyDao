// scripts/deploy.js
import hre from "hardhat";
import { ethers } from "ethers";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  const rpcUrl = process.env.RAYLS_RPC;
  const privateKey = process.env.PRIVATE_KEY;

  if (!rpcUrl || !privateKey) {
    throw new Error("Missing RAYLS_RPC or PRIVATE_KEY in .env");
  }

  // Use ethers v6 directly
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);
  const deployer = await wallet.getAddress();

  console.log("Deployer:", deployer);

  //
  // 1) Deploy MockUSD
  //
  const mockUsdArtifact = await hre.artifacts.readArtifact("MockUSD");
  const MockUSDFactory = new ethers.ContractFactory(
    mockUsdArtifact.abi,
    mockUsdArtifact.bytecode,
    wallet
  );

  const mockUsd = await MockUSDFactory.deploy();
  await mockUsd.waitForDeployment();
  const mockUsdAddress = await mockUsd.getAddress();
  console.log("MockUSD deployed at:", mockUsdAddress);

  //
  // 2) Deploy MockSPYOracle
  //
  const mockOracleArtifact = await hre.artifacts.readArtifact("MockSPYOracle");
  const MockOracleFactory = new ethers.ContractFactory(
    mockOracleArtifact.abi,
    mockOracleArtifact.bytecode,
    wallet
  );

  // Example price: 500 * 1e8 = $500 with 8 decimals
  const initialPrice = 500n * 10n ** 8n;

  const mockOracle = await MockOracleFactory.deploy(initialPrice);
  await mockOracle.waitForDeployment();
  const mockOracleAddress = await mockOracle.getAddress();
  console.log("MockSPYOracle deployed at:", mockOracleAddress);

  //
  // 3) Deploy SPYVault
  //
  const spyVaultArtifact = await hre.artifacts.readArtifact("SPYVault");
  const SPYVaultFactory = new ethers.ContractFactory(
    spyVaultArtifact.abi,
    spyVaultArtifact.bytecode,
    wallet
  );

  const executor = deployer;
  const brokerWallet = deployer;
  const complianceOfficer = deployer;
  // Underlying is 6 decimals, so 100_000 * 1e6
  const maxSingleWithdrawal = 100_000n * 10n ** 6n;

  const spyVault = await SPYVaultFactory.deploy(
    mockUsdAddress,
    mockOracleAddress,
    executor,
    brokerWallet,
    complianceOfficer,
    maxSingleWithdrawal
  );
  await spyVault.waitForDeployment();
  const spyVaultAddress = await spyVault.getAddress();
  console.log("SPYVault deployed at:", spyVaultAddress);

  //
  // 4) Deploy SPYDAOGovernor
  //
  // Governance token = SPYVault (IVotes)
  // Reward token     = MockUSD
  const governorArtifact = await hre.artifacts.readArtifact("SPYDAOGovernor");
  const GovernorFactory = new ethers.ContractFactory(
    governorArtifact.abi,
    governorArtifact.bytecode,
    wallet
  );

  const governor = await GovernorFactory.deploy(
    spyVaultAddress,
    mockUsdAddress
  );
  await governor.waitForDeployment();
  const governorAddress = await governor.getAddress();
  console.log("SPYDAOGovernor deployed at:", governorAddress);

  //
  // 5) Print JSON to paste into your frontend
  //
  console.log("\n==== Deployed addresses (for frontend) ====");
  console.log(
    JSON.stringify(
      {
        network: "rayls",
        deployer,
        MockUSD: mockUsdAddress,
        MockSPYOracle: mockOracleAddress,
        SPYVault: spyVaultAddress,
        SPYDAOGovernor: governorAddress,
      },
      null,
      2
    )
  );
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
