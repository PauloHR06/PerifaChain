const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("RepaymentManager + ReputationManager flows", function () {
  let deployer, artist, investor, oracle;
  let ProjectRegistry, LoanEscrow, RepaymentManager, ReputationManager;
  let projectRegistry, loanEscrow, repaymentManager, reputationManager;
  let mockToken, priceFeed;

  beforeEach(async () => {
    [deployer, artist, investor, oracle] = await ethers.getSigners();

    // Deploy ProjectRegistry
    ProjectRegistry = await ethers.getContractFactory("ProjectRegistry");
    projectRegistry = await ProjectRegistry.connect(deployer).deploy(deployer.address);
    await projectRegistry.waitForDeployment();

    // Deploy LoanEscrow (ETH)
    LoanEscrow = await ethers.getContractFactory("LoanEscrow");
    loanEscrow = await LoanEscrow.connect(deployer).deploy(
      projectRegistry.getAddress ? await projectRegistry.getAddress() : projectRegistry.target,
      deployer.address,
      "0x0000000000000000000000000000000000000000"
    );
    await loanEscrow.waitForDeployment();

  // (Do not transfer ownership here) LoanEscrow needs to be owner when creating escrows,
  // but tests will transfer ownership at the correct time to preserve approveProject rights.

    // Deploy mocks
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    mockToken = await MockERC20.connect(deployer).deploy("MockUSDC", "mUSDC");
    await mockToken.waitForDeployment();

    const MockV3 = await ethers.getContractFactory("MockV3Aggregator");
    priceFeed = await MockV3.connect(deployer).deploy(2000 * 10 ** 8); // 2000 USD
    await priceFeed.waitForDeployment();

    // Deploy RepaymentManager
    RepaymentManager = await ethers.getContractFactory("RepaymentManager");
    repaymentManager = await RepaymentManager.connect(deployer).deploy(
      await projectRegistry.getAddress(),
      await loanEscrow.getAddress(),
      await mockToken.getAddress(),
      await priceFeed.getAddress()
    );
    await repaymentManager.waitForDeployment();

    // Deploy ReputationManager
    ReputationManager = await ethers.getContractFactory("ReputationManager");
    reputationManager = await ReputationManager.connect(deployer).deploy(
      await projectRegistry.getAddress(),
      await repaymentManager.getAddress()
    );
    await reputationManager.waitForDeployment();
  });

  it("should schedule repayment and accept traditional and royalty payments", async function () {
    // Create and approve a project
    const creationFee = await projectRegistry.projectCreationFee();
    const now = (await ethers.provider.getBlock("latest")).timestamp;
    const fundingGoal = ethers.parseEther("1.0");

    await projectRegistry.connect(artist).createProject(
      "Proj",
      "Desc",
      "ipfs://demo",
      fundingGoal,
      now + 7 * 24 * 3600,
      now + 365 * 24 * 3600,
      500,
      true,
      { value: creationFee }
    );
    await projectRegistry.connect(deployer).approveProject(1);

  // Transfer ownership so LoanEscrow can update project status, then create escrow and fund it (investor pays ETH)
  await projectRegistry.connect(deployer).transferOwnership(await loanEscrow.getAddress());
  await loanEscrow.connect(deployer).createEscrow(1);
    const fundingGoalWei = fundingGoal;
    await loanEscrow.connect(investor).depositFunds(1, 0, { value: fundingGoalWei });

    // Artist releases funds
    await loanEscrow.connect(artist).releaseFunds(1);

    // Mint tokens to artist (to simulate repayment in USDC-like token)
    await mockToken.connect(deployer).mint(artist.address, ethers.parseUnits("1000", 6));
    await mockToken.connect(deployer).mint(investor.address, ethers.parseUnits("1000", 6));

    // Create repayment schedule (now fundsReleased == true and project is ACTIVE)
    await repaymentManager.connect(deployer).scheduleRepayment(1);

    // Artist makes traditional payment
    await mockToken.connect(artist).approve(await repaymentManager.getAddress(), ethers.parseUnits("100", 6));
    await repaymentManager.connect(artist).makeTraditionalPayment(1, ethers.parseUnits("100", 6));

    // Owner authorizes oracle and oracle reports royalty payment
    await repaymentManager.connect(deployer).addAuthorizedOracle(oracle.address);
    await repaymentManager.connect(oracle).processRoyaltyPayment(
      1,
      ethers.parseUnits("50", 6),
      "spotify",
      ethers.keccak256(ethers.toUtf8Bytes("oracle-proof"))
    );

    // Check repayment status
    const status = await repaymentManager.getRepaymentStatus(1);
    expect(status.totalPaid).to.be.gt(0n);
  });
});
