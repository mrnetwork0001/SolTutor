// ============================================================
// SolTutor — Backend Server
// Powered by MemoriaDA Protocol
// ============================================================

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { uploadMemoryBlob } from './storageUpload.js';
import { ensureAgentRegistered, anchorMemoryRoot } from './registryAnchor.js';
import OpenAI from 'openai';

const app = express();
const PORT = process.env.PORT || 3003;

const openai = new OpenAI({
  apiKey: process.env.ZG_CHAT_API_KEY || 'dummy',
  baseURL: process.env.ZG_CHAT_BASE_URL || 'https://router-api-testnet.integratenetwork.work/v1',
});

const AGENT_ID = 'soltutor_agent_v1';
const FRAMEWORK = 'SolidityTutor';
let memoryCount = 0;

app.use(cors({ origin: true }));
app.use(express.json({ limit: '5mb' }));

// ── Health ──────────────────────────────────────────────
app.get('/api/status', (req, res) => {
  res.json({ status: 'ok', agent: AGENT_ID, memoryCount });
});

// ── AI Chat ─────────────────────────────────────────────
app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages) return res.status(400).json({ error: 'messages required' });

    const completion = await openai.chat.completions.create({
      model: process.env.ZG_CHAT_MODEL || 'qwen/qwen-2.5-7b-instruct',
      messages,
      max_tokens: 800,
      temperature: 0.7,
    });

    res.json({
      content: completion.choices[0].message.content,
      model: completion.model,
    });
  } catch (err) {
    console.error('[Chat] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── Store Learning Memory on 0G Storage + Chain ─────────
app.post('/api/memory/store', async (req, res) => {
  try {
    const { content, embedding, metadata } = req.body;
    if (!content) return res.status(400).json({ error: 'content required' });

    const network = process.env.ZG_NETWORK || 'testnet';

    const memoryPayload = {
      protocol: 'memoria-da',
      version: '1.0.0',
      app: 'solidity-tutor',
      timestamp: new Date().toISOString(),
      agentId: AGENT_ID,
      content,
      embedding: embedding || [],
      metadata: {
        ...metadata,
        topic: metadata?.topic || 'general',
        difficulty: metadata?.difficulty || 'beginner',
      },
    };

    console.log('[Memory] Uploading to 0G Storage...');
    const uploadResult = await uploadMemoryBlob(JSON.stringify(memoryPayload), network);
    console.log(`[Memory] Stored ✓ root: ${uploadResult.rootHash.slice(0, 16)}...`);

    await ensureAgentRegistered(AGENT_ID, FRAMEWORK, network);

    memoryCount++;
    console.log('[Memory] Anchoring on 0G Chain...');
    const anchorResult = await anchorMemoryRoot(AGENT_ID, uploadResult.rootHash, memoryCount, network);
    console.log(`[Memory] Anchored ✓ ${anchorResult.blockLabel} | ${anchorResult.explorerUrl}`);

    res.json({
      rootHash: uploadResult.rootHash,
      blobSize: uploadResult.blobSize,
      blockLabel: anchorResult.blockLabel,
      explorerUrl: anchorResult.explorerUrl,
      txHash: anchorResult.txHash,
      memoryCount,
    });
  } catch (err) {
    console.error('[Memory] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── Start ───────────────────────────────────────────────
app.listen(PORT, () => {
  console.log('');
  console.log('═══════════════════════════════════════════');
  console.log('  SOLTUTOR — Solidity Tutor Backend');
  console.log('  Powered by MemoriaDA Protocol');
  console.log('═══════════════════════════════════════════');
  console.log(`  Listening: http://localhost:${PORT}`);
  console.log(`  Agent ID:  ${AGENT_ID}`);
  console.log(`  Network:   ${process.env.ZG_NETWORK || 'testnet'}`);
  console.log('');
});
