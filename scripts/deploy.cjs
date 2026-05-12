// ============================================================
// SolTutor — Deploy SolTutorAccess Contract
// Target: 0G Galileo Testnet (chainId 16602)
// ============================================================

const hre = require('hardhat');

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log('');
  console.log('═══════════════════════════════════════════');
  console.log('  SOLTUTOR — Contract Deployment');
  console.log('═══════════════════════════════════════════');
  console.log(`  Deployer:  ${deployer.address}`);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log(`  Balance:   ${hre.ethers.formatEther(balance)} A0GI`);
  console.log('');

  console.log('  Deploying SolTutorAccess...');
  const SolTutorAccess = await hre.ethers.getContractFactory('SolTutorAccess');
  const contract = await SolTutorAccess.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log(`  ✓ Deployed at: ${address}`);
  console.log(`  ✓ Explorer:    https://chainscan-galileo.0g.ai/address/${address}`);
  console.log('');
  console.log(`  Subscription Price: 1 A0GI / 30 days`);
  console.log('');
  console.log('  Add this to your .env:');
  console.log(`  SOLTUTOR_ACCESS_ADDRESS=${address}`);
  console.log('═══════════════════════════════════════════');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Deployment failed:', error);
    process.exit(1);
  });
