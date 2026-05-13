import { ethers } from 'ethers';
import 'dotenv/config';

const CONTRACT = '0x3D078d15B4dF4Bc3d5D048444A82875BE511011d';
const NEW_PRICE = ethers.parseEther('0.1');
const ABI = [
  'function setPrice(uint256 newPrice) external',
  'function subscriptionPrice() view returns (uint256)',
  'function owner() view returns (address)',
];

async function main() {
  const provider = new ethers.JsonRpcProvider('https://evmrpc.0g.ai', undefined, {
    staticNetwork: new ethers.Network('0G-Mainnet', 16661),
  });
  let pk = process.env.ZG_PRIVATE_KEY;
  if (!pk.startsWith('0x')) pk = '0x' + pk;
  const signer = new ethers.Wallet(pk, provider);
  const contract = new ethers.Contract(CONTRACT, ABI, signer);

  const current = await contract.subscriptionPrice();
  console.log(`Current price: ${ethers.formatEther(current)} 0G`);
  console.log(`Setting to: ${ethers.formatEther(NEW_PRICE)} 0G`);

  const tx = await contract.setPrice(NEW_PRICE);
  console.log(`Tx: ${tx.hash}`);
  await tx.wait();
  console.log(`✅ Price updated! Explorer: https://chainscan.0g.ai/tx/${tx.hash}`);
}

main().catch(e => { console.error('Failed:', e.message); process.exitCode = 1; });
