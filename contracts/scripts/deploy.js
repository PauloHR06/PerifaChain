const { ethers, upgrades } = require("hardhat");

async function main() {
    console.log("Iniciando deploy dos contratos...");
    
    const signers = await ethers.getSigners();
    const deployer = signers[0];
    // Fallbacks: se não houver signers suficientes, usar variáveis de ambiente ou deployer
    const feeRecipient = signers[1] || { address: process.env.FEE_RECIPIENT_ADDRESS || (deployer && deployer.address) };
    const oracle1 = signers[2] || { address: process.env.ORACLE1_ADDRESS || (deployer && deployer.address) };
    const oracle2 = signers[3] || { address: process.env.ORACLE2_ADDRESS || (deployer && deployer.address) };
    console.log("Deployer:", deployer ? deployer.address : "<none>");
    console.log("Fee Recipient:", feeRecipient.address ? feeRecipient.address : feeRecipient);
    
    // 1. Deploy do ProjectRegistry
    console.log("\\n Deploying ProjectRegistry...");
    const ProjectRegistry = await ethers.getContractFactory("ProjectRegistry");
    const projectRegistry = await ProjectRegistry.deploy(feeRecipient.address);
    await projectRegistry.deployed();
    console.log("ProjectRegistry deployed at:", projectRegistry.address);
    
    // 2. Deploy do LoanEscrow
    console.log("\\n Deploying LoanEscrow...");
    const LoanEscrow = await ethers.getContractFactory("LoanEscrow");
    // Para Polygon testnet, usar address(0) para aceitar MATIC
    // Para mainnet, usar endereço do USDC: 0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174
    const acceptedToken = "0x0000000000000000000000000000000000000000"; // ETH/MATIC
    const loanEscrow = await LoanEscrow.deploy(
        projectRegistry.address,
        feeRecipient.address,
        acceptedToken
    );
    await loanEscrow.deployed();
    console.log("LoanEscrow deployed at:", loanEscrow.address);
    
    // 3. Deploy do RepaymentManager
    console.log("\\n Deploying RepaymentManager...");
    const RepaymentManager = await ethers.getContractFactory("RepaymentManager");
    // USDC no Polygon: 0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174
    const paymentToken = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174";
    // Chainlink MATIC/USD feed: 0xAB594600376Ec9fD91F8e885dADF0CE036862dE0
    const priceFeed = "0xAB594600376Ec9fD91F8e885dADF0CE036862dE0";
    
    const repaymentManager = await RepaymentManager.deploy(
        projectRegistry.address,
        loanEscrow.address,
        paymentToken,
        priceFeed
    );
    await repaymentManager.deployed();
    console.log("RepaymentManager deployed at:", repaymentManager.address);
    
    // 4. Deploy do ReputationManager
    console.log("\\n Deploying ReputationManager...");
    const ReputationManager = await ethers.getContractFactory("ReputationManager");
    const reputationManager = await ReputationManager.deploy(
        projectRegistry.address,
        repaymentManager.address
    );
    await reputationManager.deployed();
    console.log("ReputationManager deployed at:", reputationManager.address);
    
    // 5. Configurações iniciais
    console.log("\\n Configurando contratos...");
    
    // Permitir que RepaymentManager atualize status de projetos
    const PROJECT_MANAGER_ROLE = await projectRegistry.DEFAULT_ADMIN_ROLE();
    await projectRegistry.grantRole(PROJECT_MANAGER_ROLE, repaymentManager.address);
    console.log("RepaymentManager autorizado no ProjectRegistry");
    
    // Adicionar oráculos autorizados
    await repaymentManager.addAuthorizedOracle(oracle1.address);
    await reputationManager.addSocialOracle(oracle1.address);
    await reputationManager.addSocialOracle(oracle2.address);
    console.log("Oráculos autorizados adicionados");
    
    // 6. Verificação dos contratos (apenas para redes públicas)
    if (network.name !== "hardhat" && network.name !== "localhost") {
        console.log("\\nAguardando confirmações para verificação...");
        await projectRegistry.deployTransaction.wait(6);
        await loanEscrow.deployTransaction.wait(6);
        await repaymentManager.deployTransaction.wait(6);
        await reputationManager.deployTransaction.wait(6);
        
        console.log("\\nVerificando contratos no Polygonscan...");
        await hre.run("verify:verify", {
            address: projectRegistry.address,
            constructorArguments: [feeRecipient.address],
        });
        
        await hre.run("verify:verify", {
            address: loanEscrow.address,
            constructorArguments: [
                projectRegistry.address,
                feeRecipient.address,
                acceptedToken
            ],
        });
        
        await hre.run("verify:verify", {
            address: repaymentManager.address,
            constructorArguments: [
                projectRegistry.address,
                loanEscrow.address,
                paymentToken,
                priceFeed
            ],
        });
        
        await hre.run("verify:verify", {
            address: reputationManager.address,
            constructorArguments: [
                projectRegistry.address,
                repaymentManager.address
            ],
        });
    }
    
    // 7. Salvar endereços em arquivo JSON
    const deploymentInfo = {
        network: network.name,
        timestamp: new Date().toISOString(),
        contracts: {
            ProjectRegistry: projectRegistry.address,
            LoanEscrow: loanEscrow.address,
            RepaymentManager: repaymentManager.address,
            ReputationManager: reputationManager.address
        },
        configuration: {
            feeRecipient: feeRecipient.address,
            acceptedToken: acceptedToken,
            paymentToken: paymentToken,
            priceFeed: priceFeed
        }
    };
    
    const fs = require('fs');
    fs.writeFileSync(
        `deployments/${network.name}-deployment.json`,
        JSON.stringify(deploymentInfo, null, 2)
    );
    
    console.log("\\n🎉 Deploy completed successfully!");
    console.log("Deployment info saved to:", `deployments/${network.name}-deployment.json`);
    console.log("\\nContract Addresses:");
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