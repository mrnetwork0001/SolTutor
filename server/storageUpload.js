// ============================================================
// MemoriaDA SDK — Server-Side 0G Storage Upload
// ============================================================

import 'dotenv/config';

const NETWORKS = {
  testnet: {
    rpcUrl: 'https://evmrpc-testnet.0g.ai',
    indexerRpc: 'https://indexer-storage-testnet-turbo.0g.ai',
  },
  mainnet: {
    rpcUrl: 'https://evmrpc.0g.ai',
    indexerRpc: 'https://indexer-storage-turbo.0g.ai',
  },
};

export async function uploadMemoryBlob(payloadJson, network = 'testnet') {
  const privateKey = process.env.ZG_PRIVATE_KEY;
  if (!privateKey) throw new Error('ZG_PRIVATE_KEY not configured in .env');

  const net = NETWORKS[network] || NETWORKS.testnet;

  const sdk = await import('@0gfoundation/0g-ts-sdk');
  const { ethers } = await import('ethers');

  const ZgBlob = sdk.Blob || sdk.ZgBlob;
  if (!ZgBlob) throw new Error('0G SDK: could not find Blob/ZgBlob export');

  const nodeBlob = new Blob([payloadJson], { type: 'application/json' });
  const zgBlob = new ZgBlob(nodeBlob);

  const [tree, treeErr] = await zgBlob.merkleTree();
  if (treeErr) throw new Error(`Merkle tree failed: ${treeErr.message}`);
  const rootHash = tree.rootHash();

  const provider = new ethers.JsonRpcProvider(net.rpcUrl);
  const signer = new ethers.Wallet(privateKey, provider);

  const indexer = new sdk.Indexer(net.indexerRpc);
  const [tx, uploadErr] = await indexer.upload(zgBlob, net.rpcUrl, signer, {});

  if (uploadErr) {
    const msg = uploadErr.message || '';
    if (
      !msg.includes('eth_getTransactionReceipt') &&
      !msg.includes('Missing or invalid parameters')
    ) {
      throw uploadErr;
    }
  }

  return { rootHash, tx: tx || null, blobSize: nodeBlob.size };
}
