#!/usr/bin/env node
require('dotenv').config();
const path = require('path');
const { JsonRpcProvider, Wallet, formatEther } = require('ethers');
const { spawn } = require('child_process');

const envPath = path.join(__dirname, '..', '.env');
// uses the same .env as other scripts
require('dotenv').config({ path: envPath });

const PK = process.env.PRIVATE_KEY ? (process.env.PRIVATE_KEY.startsWith('0x') ? process.env.PRIVATE_KEY : '0x' + process.env.PRIVATE_KEY) : null;
const RPC = process.env.POLYGON_AMOY_RPC || process.env.AMOY_RPC || process.env.RPC_URL || process.env.POLYGON_MUMBAI_RPC || process.env.PROVIDER_URL;

if (!PK) {
  console.error('Erro: PRIVATE_KEY não encontrada em', envPath);
  process.exit(1);
}
if (!RPC) {
  console.error('Erro: RPC não encontrada. Defina POLYGON_AMOY_RPC ou AMOY_RPC ou RPC_URL em', envPath);
  process.exit(1);
}

const provider = new JsonRpcProvider(RPC);
const wallet = new Wallet(PK, provider);

// threshold in native token (default 0.015)
const threshold = process.argv[2] ? parseFloat(process.argv[2]) : 0.015;
const thresholdWei = BigInt(Math.floor(threshold * 1e18));

console.log('Observando saldo do deployer:', wallet.address);
console.log('RPC:', RPC);
console.log('Threshold:', threshold, 'native');
console.log('Pressione Ctrl+C para cancelar.');

async function checkAndMaybeDeploy() {
  try {
    const balance = await provider.getBalance(wallet.address);
    console.log(new Date().toISOString(), 'Saldo atual:', formatEther(balance));
    if (balance >= thresholdWei) {
      console.log('Saldo atingiu o threshold — iniciando deploy...');
      // run deploy command in contracts folder
      const cmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
      const args = ['hardhat', 'run', 'scripts/deploy.js', '--network', 'amoy'];
      const proc = spawn(cmd, args, { cwd: path.join(__dirname, '..'), stdio: 'inherit' });
      proc.on('exit', (code) => {
        console.log('Deploy process exited with code', code);
        process.exit(code || 0);
      });
    }
  } catch (e) {
    console.error('Erro ao checar saldo:', e.message || e);
  }
}

// first check now, then every 20s
checkAndMaybeDeploy();
const iv = setInterval(checkAndMaybeDeploy, 20000);
