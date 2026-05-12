// ============================================================
// SolTutor — Withdraw Revenue from SolTutorAccess Contract
// Only the contract owner (deployer) can call this.
// ============================================================

import 'dotenv/config';
import { ethers } from 'ethers';
import { readFileSync } from 'fs';

const RPC_URL = 'https://evmrpc-testnet.0g.ai';
const PRIVATE_KEY = process.env.ZG_PRIVATE_KEY;

async function main() {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

  // Read compiled artifact
  const artifact = JSON.parse(
    readFileSync('./artifacts/contracts/SolTutorAccess.sol/SolTutorAccess.json', 'utf8')
  );

  const CONTRACT_ADDRESS = '0x2AE191e794F00920383471A8d8b12b696147b659';
  const contract = new ethers.Contract(CONTRACT_ADDRESS, artifact.abi, wallet);

  console.log('');
  console.log('═══════════════════════════════════════════');
  console.log('  SOLTUTOR — Revenue Withdrawal');
  console.log('═══════════════════════════════════════════');
  console.log(`  Owner:     ${wallet.address}`);
  console.log(`  Contract:  ${CONTRACT_ADDRESS}`);

  // Check contract balance
  const contractBalance = await provider.getBalance(CONTRACT_ADDRESS);
  console.log(`  Balance:   ${ethers.formatEther(contractBalance)} A0GI`);

  if (contractBalance === 0n) {
    console.log('\n  No funds to withdraw.');
    console.log('═══════════════════════════════════════════');
    return;
  }

  // Withdraw
  console.log('\n  Withdrawing...');
  const tx = await contract.withdraw();
  console.log(`  Tx sent:   ${tx.hash}`);
  await tx.wait();

  const newBalance = await provider.getBalance(wallet.address);
  console.log(`  ✓ Withdrawn! Wallet balance: ${ethers.formatEther(newBalance)} A0GI`);
  console.log(`  ✓ Explorer: https://chainscan-galileo.0g.ai/tx/${tx.hash}`);
  console.log('═══════════════════════════════════════════');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Withdrawal failed:', error.message);
    process.exit(1);
  });
