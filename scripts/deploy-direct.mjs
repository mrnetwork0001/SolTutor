// ============================================================
// SolTutor — Deploy SolTutorAccess Contract (Direct ethers.js)
// Target: 0G Galileo Testnet (chainId 16602)
// ============================================================

import 'dotenv/config';
import { ethers } from 'ethers';
import { readFileSync } from 'fs';

const RPC_URL = 'https://evmrpc-testnet.0g.ai';
const PRIVATE_KEY = process.env.ZG_PRIVATE_KEY;

async function main() {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

  console.log('');
  console.log('═══════════════════════════════════════════');
  console.log('  SOLTUTOR — Contract Deployment');
  console.log('═══════════════════════════════════════════');
  console.log(`  Deployer:  ${wallet.address}`);

  const balance = await provider.getBalance(wallet.address);
  console.log(`  Balance:   ${ethers.formatEther(balance)} A0GI`);
  console.log('');

  // Read compiled artifact
  const artifact = JSON.parse(
    readFileSync('./artifacts/contracts/SolTutorAccess.sol/SolTutorAccess.json', 'utf8')
  );

  console.log('  Deploying SolTutorAccess...');
  const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet);
  const contract = await factory.deploy();
  console.log(`  Tx sent:   ${contract.deploymentTransaction().hash}`);

  await contract.waitForDeployment();
  const address = await contract.getAddress();

  console.log(`  ✓ Deployed at: ${address}`);
  console.log(`  ✓ Explorer:    https://chainscan-galileo.0g.ai/address/${address}`);
  console.log('');
  console.log(`  Subscription Price: 1 A0GI / 30 days`);
  console.log('');
  console.log('  Update SOLTUTOR_ACCESS_ADDRESS in:');
  console.log('  src/services/accessService.js');
  console.log(`  → ${address}`);
  console.log('═══════════════════════════════════════════');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Deployment failed:', error);
    process.exit(1);
  });
