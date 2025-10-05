const { ethers } = require("hardhat");

async function main() {
  console.log("Iniciando deploy dos contratos...");

  const signers = await ethers.getSigners();
  const deployer = signers[0];
  const feeRecipient = deployer.address;

  console.log("Deployer:", deployer.address);
  console.log("Fee Recipient:", feeRecipient);

  // 1. Deploy do ProjectRegistry
  const ProjectRegistry = await ethers.getContractFactory("ProjectRegistry");
  const projectRegistry = await ProjectRegistry.deploy(feeRecipient);
  await projectRegistry.deployed();
  console.log("ProjectRegistry deployed at:", projectRegistry.address);

  // 2. Deploy do LoanEscrow
  const LoanEscrow = await ethers.getContractFactory("LoanEscrow");
  const acceptedToken = "0x0000000000000000000000000000000000000000"; // ETH/MATIC na Amoy testnet
  const loanEscrow = await LoanEscrow.deploy(
    projectRegistry.address,
    feeRecipient,
    acceptedToken
  );
  await loanEscrow.deployed();
  console.log("LoanEscrow deployed at:", loanEscrow.address);

  // 3. Deploy do RepaymentManager
  const RepaymentManager = await ethers.getContractFactory("RepaymentManager");
  const paymentToken = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174"; // USDC na testnet (ajuste se necessário)
  const priceFeed = "0xAB594600376Ec9fD91F8e885dADF0CE036862dE0";     // Chainlink MATIC/USD feed (ajuste se necessário)

  const repaymentManager = await RepaymentManager.deploy(
    projectRegistry.address,
    loanEscrow.address,
    paymentToken,
    priceFeed
  );
  await repaymentManager.deployed();
  console.log("RepaymentManager deployed at:", repaymentManager.address);

  // 4. Deploy do ReputationManager
  const ReputationManager = await ethers.getContractFactory("ReputationManager");

  const reputationManager = await ReputationManager.deploy(
    projectRegistry.address,
    repaymentManager.address
  );
  await reputationManager.deployed();
  console.log("ReputationManager deployed at:", reputationManager.address);

  console.log("\n🎉 Todos os contratos foram deployados com sucesso!\n");
  console.log("Endereços dos contratos:");
  console.log("ProjectRegistry:", projectRegistry.address);
  console.log("LoanEscrow:", loanEscrow.address);
  console.log("RepaymentManager:", repaymentManager.address);
  console.log("ReputationManager:", reputationManager.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
