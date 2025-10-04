const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Basic flow: ProjectRegistry + LoanEscrow (ETH)", function () {
  let deployer, artist, investor, other;
  let ProjectRegistry, projectRegistry;
  let LoanEscrow, loanEscrow;

  beforeEach(async () => {
    [deployer, artist, investor, other] = await ethers.getSigners();

    ProjectRegistry = await ethers.getContractFactory("ProjectRegistry");
    projectRegistry = await ProjectRegistry.connect(deployer).deploy(deployer.address);
    await projectRegistry.waitForDeployment();

    LoanEscrow = await ethers.getContractFactory("LoanEscrow");
  });

  it("should create project, approve, create escrow, fund and release funds (ETH)", async function () {
    // Artist creates a project (must pay creation fee)
    const creationFee = await projectRegistry.projectCreationFee();
    const fundingGoal = ethers.parseEther("1.0");
    const now = (await ethers.provider.getBlock("latest")).timestamp;

    const txCreate = await projectRegistry
      .connect(artist)
      .createProject(
        "Projeto Teste",
        "Descricao",
        "ipfs://demo",
        fundingGoal,
        now + 7 * 24 * 3600,
        now + 365 * 24 * 3600,
        500, // interestRate 5%
        false,
        { value: creationFee }
      );
    const rc = await txCreate.wait();
    const projectId = 1;

    const project = await projectRegistry.getProject(projectId);
    expect(project.artist).to.equal(artist.address);
    expect(project.fundingGoal).to.equal(fundingGoal);

    // Owner approves project
    await projectRegistry.connect(deployer).approveProject(projectId);
    const afterApprove = await projectRegistry.getProject(projectId);
    expect(afterApprove.status).to.equal(1n); // APPROVED (enum index)

    // Deploy LoanEscrow (acceptedToken = address(0) for ETH)
    const projectRegistryAddr = await projectRegistry.getAddress();
    loanEscrow = await LoanEscrow.connect(deployer).deploy(
      projectRegistryAddr,
      deployer.address,
      "0x0000000000000000000000000000000000000000"
    );
  await loanEscrow.waitForDeployment();

  // Transfer ownership of ProjectRegistry to LoanEscrow so it can call owner-only updates
  const loanEscrowAddr = await loanEscrow.getAddress();
  await projectRegistry.connect(deployer).transferOwnership(loanEscrowAddr);

  // Create escrow for the project (now LoanEscrow is owner of ProjectRegistry)
  await loanEscrow.connect(other).createEscrow(projectId);

    // Investor deposits ETH equal to funding goal
    await loanEscrow.connect(investor).depositFunds(projectId, 0, { value: fundingGoal });

    const escrowData = await loanEscrow.getEscrowData(projectId);
    const totalRaised = escrowData[0];
    expect(totalRaised).to.equal(fundingGoal);

    // Artist releases funds
    await loanEscrow.connect(artist).releaseFunds(projectId);

    const updatedProject = await projectRegistry.getProject(projectId);
    // ACTIVE = 4
    expect(updatedProject.status).to.equal(4n);
  });
});
