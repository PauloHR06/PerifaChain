require('dotenv').config();
const hre = require('hardhat');

async function main() {
  console.log('Estimando custo de deploy (apenas estimativa)...');
  const networkName = hre.network.name;
  console.log('Network:', networkName);

  const provider = hre.ethers.provider;

  // Parameters used in deploy.js
  const feeRecipient = process.env.FEE_RECIPIENT_ADDRESS || (await hre.ethers.getSigners())[0].address;
  const acceptedToken = '0x0000000000000000000000000000000000000000';
  const paymentToken = '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174';
  const priceFeed = '0xAB594600376Ec9fD91F8e885dADF0CE036862dE0';

  async function estimate(factoryName, constructorArgs = []) {
    const Factory = await hre.ethers.getContractFactory(factoryName);
    const unsignedTx = Factory.getDeployTransaction(...constructorArgs);
    // provider.estimateGas expects a tx-like object
    const gas = await provider.estimateGas(unsignedTx);
    // Use getFeeData (works with ethers v6 / Hardhat provider)
    const feeData = await provider.getFeeData();
    // gasPrice might be undefined on EIP-1559 networks; prefer gasPrice, else use maxFeePerGas
    const gasPriceBn = feeData.gasPrice ?? feeData.maxFeePerGas ?? feeData.maxPriorityFeePerGas;
    if (!gasPriceBn) throw new Error('Não foi possível obter gasPrice/maxFeePerGas do provider');
    const gasPrice = BigInt(gasPriceBn.toString());
    const cost = BigInt(gas) * gasPrice;
    return { gas: gas.toString(), gasPrice: gasPrice.toString(), cost };
  }

  const results = {};
  results.ProjectRegistry = await estimate('ProjectRegistry', [feeRecipient]);
  results.LoanEscrow = await estimate('LoanEscrow', [/* projectRegistry placeholder */ '0x0000000000000000000000000000000000000000', feeRecipient, acceptedToken]);
  results.RepaymentManager = await estimate('RepaymentManager', ['0x0000000000000000000000000000000000000000', '0x0000000000000000000000000000000000000000', paymentToken, priceFeed]);
  results.ReputationManager = await estimate('ReputationManager', ['0x0000000000000000000000000000000000000000', '0x0000000000000000000000000000000000000000']);

  let totalCost = 0n;
  for (const name of Object.keys(results)) {
    const r = results[name];
    console.log(`\n${name}:`);
    console.log('  gas:', r.gas);
    console.log('  gasPrice (wei):', r.gasPrice);
    console.log('  cost (wei):', r.cost.toString());
    totalCost += BigInt(r.cost.toString());
  }

  const { formatEther } = require('ethers');
  console.log('\nEstimated total cost (wei):', totalCost.toString());
  console.log('Estimated total cost (native):', formatEther(totalCost.toString()));
  console.log('\nRecomendação: envie pelo menos 1.5x deste valor para cobrir variações e confirmações.');
}

main().catch((e) => {
  console.error('Erro durante a estimativa:', e.message || e);
  process.exit(1);
});
