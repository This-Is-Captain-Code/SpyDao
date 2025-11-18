import { expect } from "chai";
import { ethers } from "hardhat";

describe("SPYDAOGovernor", function () {
  it("rewards voters after a successful proposal", async function () {
    const [deployer, voter1, voter2] = await ethers.getSigners();

    // 1) MockUSD (underlying + reward token)
    const MockUSD = await ethers.getContractFactory("MockUSD");
    const mockUsd = await MockUSD.deploy();
    await mockUsd.waitForDeployment();
    const mockUsdAddr = await mockUsd.getAddress();

    // 2) MockSPYOracle
    const MockSPYOracle = await ethers.getContractFactory("MockSPYOracle");
    const initialSpyPrice = ethers.parseUnits("500", 8);
    const oracle = await MockSPYOracle.deploy(initialSpyPrice);
    await oracle.waitForDeployment();
    const oracleAddr = await oracle.getAddress();

    // 3) SPYVault (spDAO token)
    const SPYVault = await ethers.getContractFactory("SPYVault");
    const maxSingleWithdrawal = ethers.parseUnits("100000", 6);

    const vault = await SPYVault.deploy(
      mockUsdAddr,
      oracleAddr,
      deployer.address,   // EXECUTOR_ROLE
      deployer.address,   // BROKER_WALLET
      deployer.address,   // COMPLIANCE_ROLE
      maxSingleWithdrawal
    );
    await vault.waitForDeployment();
    const vaultAddr = await vault.getAddress();

    // 4) SPYDAOGovernor
    const SPYDAOGovernor = await ethers.getContractFactory("SPYDAOGovernor");
    const governor = await SPYDAOGovernor.deploy(vaultAddr, mockUsdAddr);
    await governor.waitForDeployment();
    const governorAddr = await governor.getAddress();

    // 5) Seed reward pool
    const rewardAmount = ethers.parseUnits("10000", 6); // 10,000 mUSD
    await mockUsd.approve(governorAddr, rewardAmount);
    await governor.distributeRewards(rewardAmount);

    // 6) Fund voters with mUSD
    const voterDeposit = ethers.parseUnits("1000", 6); // 1,000 mUSD each
    await mockUsd.transfer(voter1.address, voterDeposit);
    await mockUsd.transfer(voter2.address, voterDeposit);

    // 7) Approve + deposit into vault
    await mockUsd.connect(voter1).approve(vaultAddr, voterDeposit);
    await vault.connect(voter1).deposit(voterDeposit, voter1.address);

    await mockUsd.connect(voter2).approve(vaultAddr, voterDeposit);
    await vault.connect(voter2).deposit(voterDeposit, voter2.address);

    // 8) Delegate voting power (ERC20Votes)
    await vault.connect(voter1).delegate(voter1.address);
    await vault.connect(voter2).delegate(voter2.address);

    // 9) Create SP500 proposal
    const description = "Vote FOR proposal 1 at AAPL";

    const proposalId = await governor
      .connect(voter1)
      .proposeSP500Vote.staticCall("AAPL", 1, true, description);

    await governor
      .connect(voter1)
      .proposeSP500Vote("AAPL", 1, true, description);

    // 10) Wait for voting delay
    const votingDelay = await governor.votingDelay();
    for (let i = 0n; i < votingDelay; i++) {
      await ethers.provider.send("evm_mine", []);
    }

    // 11) Cast votes: both vote "For"
    await governor.connect(voter1).castVote(proposalId, 1);
    await governor.connect(voter2).castVote(proposalId, 1);

    // 12) Mine blocks until after voting period
    const votingPeriod = await governor.votingPeriod();
    for (let i = 0n; i < votingPeriod + 2n; i++) {
      await ethers.provider.send("evm_mine", []);
    }

    // 13) Check available rewards for voter1
    const available = await governor.availableRewards(proposalId, voter1.address);
    expect(available).to.be.gt(0n);

    // 14) Claim rewards
    const beforeBalance = await mockUsd.balanceOf(voter1.address);
    await governor.connect(voter1).claimRewards(proposalId);
    const afterBalance = await mockUsd.balanceOf(voter1.address);

    expect(afterBalance).to.be.gt(beforeBalance);

    // 15) Cannot claim twice
    await expect(
      governor.connect(voter1).claimRewards(proposalId)
    ).to.be.revertedWith("Already claimed");
  });
});
