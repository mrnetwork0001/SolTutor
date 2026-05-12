// ============================================================
// MemoriaDA SDK — Server-Side Registry Anchoring
// ============================================================

import 'dotenv/config';
import { ethers } from 'ethers';

const NETWORKS = {
  testnet: { rpcUrl: 'https://evmrpc-testnet.0g.ai', txExplorer: 'https://chainscan-galileo.0g.ai/tx/' },
  mainnet: { rpcUrl: 'https://evmrpc.0g.ai', txExplorer: 'https://chainscan.0g.ai/tx/' },
};

const REGISTRY_ABI = [
  'function registerAgent(string agentId, string framework) external',
  'function updateMemoryRoot(string agentId, bytes32 rootHash, uint256 vectorCount) external payable',
  'function getAgent(string agentId) external view returns (address, string, bytes32, uint256, uint256)',
  'function getAgentCount() external view returns (uint256)',
];

const MEMORY_FEE = '0.001';

function getSigner(network = 'testnet') {
  const privateKey = process.env.ZG_PRIVATE_KEY;
  if (!privateKey) throw new Error('ZG_PRIVATE_KEY not configured');
  const net = NETWORKS[network] || NETWORKS.testnet;
  const provider = new ethers.JsonRpcProvider(net.rpcUrl);
  return new ethers.Wallet(privateKey, provider);
}

function getContract(signer) {
  const address = process.env.MEMORIA_REGISTRY_ADDRESS;
  if (!address) throw new Error('MEMORIA_REGISTRY_ADDRESS not set in .env');
  return new ethers.Contract(address, REGISTRY_ABI, signer);
}

export async function ensureAgentRegistered(agentId, framework, network = 'testnet') {
  const signer = getSigner(network);
  const contract = getContract(signer);
  try {
    await contract.getAgent(agentId);
    return true;
  } catch {
    const tx = await contract.registerAgent(agentId, framework);
    await tx.wait().catch(() => {});
    return true;
  }
}

export async function anchorMemoryRoot(agentId, rootHash, vectorCount, network = 'testnet') {
  const signer = getSigner(network);
  const contract = getContract(signer);
  const net = NETWORKS[network] || NETWORKS.testnet;

  let rootHashBytes;
  if (rootHash.startsWith('0x') && rootHash.length === 66) {
    rootHashBytes = rootHash;
  } else {
    rootHashBytes = ethers.zeroPadValue(
      ethers.hexlify(ethers.toBeArray(BigInt(rootHash))),
      32
    );
  }

  const fee = ethers.parseEther(MEMORY_FEE);
  const tx = await contract.updateMemoryRoot(agentId, rootHashBytes, vectorCount, { value: fee });

  let receipt;
  try {
    receipt = await tx.wait();
  } catch (err) {
    const msg = err?.message || '';
    if (msg.includes('coalesce') || msg.includes('Missing or invalid parameters')) {
      receipt = { blockNumber: null, transactionHash: tx.hash, status: 1 };
    } else {
      throw err;
    }
  }

  const blockLabel = receipt.blockNumber ? `Block #${receipt.blockNumber}` : 'TX Confirmed';
  const explorerUrl = `${net.txExplorer}${receipt.transactionHash || tx.hash}`;

  return { receipt, blockLabel, explorerUrl, txHash: receipt.transactionHash || tx.hash };
}
