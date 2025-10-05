const path = require('path');
const dotenv = require('dotenv');
const { JsonRpcProvider, Wallet, formatEther } = require('ethers');

// Load .env from the contracts directory if it exists (preferred), else fallback to repo root
const envPath = path.join(__dirname, '..', '.env');
dotenv.config({ path: envPath });

(async () => {
  let PK = process.env.PRIVATE_KEY;
  // accept several RPC env names including POLYGON_AMOY_RPC used in this repo
  const RPC = process.env.AMOY_RPC || process.env.POLYGON_AMOY_RPC || process.env.RPC_URL || process.env.POLYGON_MUMBAI_RPC || process.env.POLYGON_RPC || process.env.PROVIDER_URL;

  if (!PK) {
    console.error('ERRO: PRIVATE_KEY não encontrada em', envPath);
    process.exit(1);
  }

  // ethers expects 0x-prefixed private key
  if (!PK.startsWith('0x')) PK = '0x' + PK;

  if (!RPC) {
    console.error('ERRO: URL RPC não encontrada. Defina POLYGON_AMOY_RPC ou AMOY_RPC ou RPC_URL em', envPath);
    process.exit(1);
  }

  try {
  const provider = new JsonRpcProvider(RPC);
  const wallet = new Wallet(PK, provider);
  const address = await wallet.getAddress();
  const balance = await provider.getBalance(address);
  console.log('Deployer address:', address);
  console.log('Saldo:', formatEther(balance), 'ETH (nativo da chain)');
  if (balance === 0n) console.log('\nSaldo zero — envie fundos via faucet da testnet antes de tentar deploy.');
  process.exit(0);
  } catch (err) {
    console.error('Erro ao checar saldo:', err.message || err);
    process.exit(1);
  }
})();
