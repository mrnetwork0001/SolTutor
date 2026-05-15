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

// AI Client — 0G Compute Router API (OpenAI-compatible)
const AI_API_KEY = process.env.ZG_CHAT_API_KEY || process.env.OPENAI_API_KEY || 'dummy';
const AI_BASE_URL = process.env.ZG_CHAT_BASE_URL || process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';
const AI_MODEL = process.env.ZG_CHAT_MODEL || process.env.OPENAI_MODEL || 'gpt-4o-mini';

const openai = new OpenAI({
  apiKey: AI_API_KEY,
  baseURL: AI_BASE_URL,
});

console.log(`[AI] Using model: ${AI_MODEL} via ${AI_BASE_URL}`);

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

    console.log(`[Chat] Sending to ${AI_MODEL} via ${AI_BASE_URL}...`);

    const completion = await openai.chat.completions.create({
      model: AI_MODEL,
      messages,
      max_tokens: 2048,  // MUST be >= 2048 for reasoning models
      temperature: 0.8,
    });

    // 0GM is a reasoning model — it puts chain-of-thought into reasoning_content
    // and the final answer into content. Handle both paths.
    const choice = completion?.choices?.[0];
    const content =
      choice?.message?.content
      || choice?.text
      || null;

    if (!content) {
      // If only reasoning was produced, extract the useful part
      const reasoning = choice?.message?.reasoning_content;
      if (reasoning) {
        console.warn('[Chat] No content but reasoning available — extracting from reasoning');
        const draftMatch = reasoning.match(/(?:Draft|Final|Response|Answer)[^:]*:\s*([\s\S]+?)(?:\n\n\d\.|\n\n\*\*|$)/i);
        const extracted = draftMatch ? draftMatch[1].trim() : reasoning.slice(-500).trim();
        return res.json({
          content: extracted,
          model: completion.model || AI_MODEL,
        });
      }

      console.error('[Chat] Empty response. Full:', JSON.stringify(completion, null, 2));
      return res.status(502).json({ error: 'AI returned an empty response. Please try again.' });
    }

    console.log(`[Chat] Response OK (${content.length} chars)`);
    res.json({
      content,
      model: completion.model || AI_MODEL,
    });
  } catch (err) {
    console.error('[Chat] Error:', err.message);
    const detail = err?.error?.message || err?.response?.data?.error?.message || err.message || 'Unknown AI error';
    res.status(500).json({ error: detail });
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

// ── Serve Frontend (production) ─────────────────────────
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.use((req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
  console.log('[SolTutor] Serving frontend from /dist');
}

// ── Start ───────────────────────────────────────────────
app.listen(PORT, () => {
  console.log('');
  console.log('═══════════════════════════════════════════');
  console.log('  SOLTUTOR - Solidity Tutor Backend');
  console.log('  Powered by MemoriaDA Protocol');
  console.log('═══════════════════════════════════════════');
  console.log(`  Listening: http://localhost:${PORT}`);
  console.log(`  Agent ID:  ${AGENT_ID}`);
  console.log(`  Network:   ${process.env.ZG_NETWORK || 'testnet'}`);
  console.log('');
});
