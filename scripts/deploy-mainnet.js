// ============================================================
// Deploy SolTutorAccess to 0G Mainnet (Chain ID 16661)
// Usage: node scripts/deploy-mainnet.js
// ============================================================

import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  console.log('');
  console.log('═══════════════════════════════════════════');
  console.log('  SOLTUTOR — Mainnet Deployment');
  console.log('═══════════════════════════════════════════');
  console.log('');

  // Load compiled artifact
  const artifactPath = path.join(__dirname, '../artifacts/contracts/SolTutorAccess.sol/SolTutorAccess.json');

  if (!fs.existsSync(artifactPath)) {
    throw new Error('Contract not compiled. Run: npx hardhat compile --config hardhat.config.cjs');
  }

  const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));

  // 0G Mainnet config
  const rpcUrl = 'https://evmrpc.0g.ai';
  const chainId = 16661;
  const provider = new ethers.JsonRpcProvider(rpcUrl, undefined, {
    staticNetwork: new ethers.Network('0G-Mainnet', chainId),
  });

  let privateKey = process.env.ZG_PRIVATE_KEY || process.env.PRIVATE_KEY;
  if (!privateKey) throw new Error('No ZG_PRIVATE_KEY in .env');

  privateKey = String(privateKey).trim();
  if (!privateKey.startsWith('0x')) privateKey = '0x' + privateKey;

  const signer = new ethers.Wallet(privateKey, provider);
  console.log(`  Deployer:  ${signer.address}`);
  console.log(`  Network:   0G Mainnet (Chain ID ${chainId})`);
  console.log(`  RPC:       ${rpcUrl}`);
  console.log('');

  const balance = await provider.getBalance(signer.address);
  console.log(`  Balance:   ${ethers.formatEther(balance)} 0G`);
  console.log('');

  console.log('  Deploying SolTutorAccess...');
  const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, signer);
  const contract = await factory.deploy();

  console.log('  Tx sent. Waiting for confirmation...');
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log('');
  console.log('═══════════════════════════════════════════');
  console.log('  ✅ SolTutorAccess deployed to MAINNET');
  console.log('═══════════════════════════════════════════');
  console.log('');
  console.log(`  Contract:  ${address}`);
  console.log(`  Explorer:  https://chainscan.0g.ai/address/${address}`);
  console.log(`  Price:     1 A0GI / 30 days`);
  console.log('');
  console.log('  Update accessService.js:');
  console.log(`  SOLTUTOR_ACCESS_ADDRESS = '${address}'`);
  console.log('═══════════════════════════════════════════');
}

main().catch((error) => {
  console.error('Deployment failed:', error.message || error);
  process.exitCode = 1;
});
