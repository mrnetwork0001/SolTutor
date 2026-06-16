import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── Configuration ───────────────────────────────────────────
const API_BASE_URL = process.env.SOLTUTOR_API_URL || `http://localhost:${process.env.PORT || 3003}`;
const MEMORY_FILE = path.join(__dirname, 'simulator_memories.json');
const LOG_FILE = path.join(__dirname, 'simulator.log');

// Simulated Student Wallet (default is a deterministic simulated learner wallet)
const SIMULATED_WALLET = process.env.SOLTUTOR_SIMULATOR_WALLET || '0xDeAd00000000000000000000000000000001337D';

// Interval to run: Default is 10 minutes (600,000 ms)
const INTERVAL_MS = parseInt(process.env.SOLTUTOR_SIMULATOR_INTERVAL_MS, 10) || 10 * 60 * 1000;

// Curated list of Solidity questions/prompts
const SOLIDITY_PROMPTS = [
  { topic: 'basics', question: 'What are state variables in Solidity and how do they differ from memory/local variables?' },
  { topic: 'functions', question: 'Explain the difference between view and pure functions with examples.' },
  { topic: 'mappings', question: 'How do mappings work in Solidity? Can we iterate over them?' },
  { topic: 'constructors', question: 'What is the purpose of constructors in a contract? Can they be public/internal?' },
  { topic: 'modifiers', question: 'How do function modifiers work? Write a simple onlyOwner modifier.' },
  { topic: 'inheritance', question: 'Explain inheritance in Solidity and how to use the "virtual" and "override" keywords.' },
  { topic: 'ether-transfer', question: 'What is the difference between transfer, send, and call for sending Ether, and which is best practice?' },
  { topic: 'reentrancy', question: 'Explain the reentrancy vulnerability and how the Checks-Effects-Interactions pattern prevents it.' },
  { topic: 'guard', question: 'What is a ReentrancyGuard and how does it use a modifier to prevent external calls from re-entering?' },
  { topic: 'errors', question: 'How do custom errors save gas compared to require statements with error strings?' },
  { topic: 'memory-pointers', question: 'Explain the difference between storage and memory pointers in Solidity functions.' },
  { topic: 'events', question: 'What are events in Solidity, and what is the maximum number of indexed parameters they can have?' },
  { topic: 'gas-optimization', question: 'How can we optimize gas by caching state variables in memory within a function?' },
  { topic: 'transient-storage', question: 'Explain transient storage introduced in EIP-1153 and its use cases.' },
  { topic: 'calls', question: 'What is the difference between call, delegatecall, and staticcall?' },
  { topic: 'erc20', question: 'Explain the ERC-20 standard\'s approve and transferFrom flow.' },
  { topic: 'erc721', question: 'What is an ERC-721 token and how does it keep track of token ownership?' },
  { topic: 'proxies', question: 'Explain the proxy pattern (like ERC-1967) and how delegatecall is used for upgradable contracts.' },
  { topic: 'security', question: 'What are the security implications of using tx.origin for authorization?' },
  { topic: 'selfdestruct', question: 'How does the selfdestruct opcode work, and what changed with it in the Cancun upgrade?' },
  { topic: 'flashloans', question: 'What is flash loan arbitrage, and what risks are associated with price oracle manipulation?' },
  { topic: 'shadow-variables', question: 'Explain how shadow variables or variable shadowing can cause bugs in Solidity.' },
  { topic: 'testing', question: 'How do we write unit tests for Solidity contracts using Foundry?' },
  { topic: 'visibility', question: 'What is the difference between external and public visibility modifiers?' },
  { topic: 'signatures', question: 'Explain how cryptographic signatures (ECDSA) are verified on-chain in Solidity using ecrecover.' }
];

// System prompt mirroring the main application
const SYSTEM_PROMPT = {
  role: 'system',
  content: `You are SolTutor - an expert Solidity and Web3 development tutor. You teach through conversation, code examples, and quizzes.

IMPORTANT - You have PERMANENT MEMORY powered by MemoriaDA on 0G Chain. You CAN and DO remember past conversations with each student. Every lesson is stored on decentralized storage and recalled for you automatically. When a student asks "do you have memory?" or "can you remember?", answer YES - you have persistent, onchain memory that lets you recall their past lessons, struggles, and progress across sessions. Never deny having memory.

Your teaching style:
- Start with clear explanations using simple analogies
- Always include working Solidity code examples in markdown code blocks (\`\`\`solidity)
- After explaining a concept, ask the student a question or give a mini-quiz
- When you recall past lessons (provided as context), reference them naturally: "Last time we covered X, and you had trouble with Y. Let's build on that."
- Be encouraging but honest about mistakes
- Suggest best practices and common pitfalls

Topics you cover: Solidity basics, storage/memory, events, modifiers, security patterns (reentrancy, overflow), gas optimization, ERC-20, ERC-721, proxy patterns, DeFi patterns, and testing.

Keep responses focused and under 250 words unless showing code. Use markdown formatting.`
};

// ── Helper functions ────────────────────────────────────────
function log(msg) {
  const timestamp = new Date().toISOString();
  const formatted = `[${timestamp}] ${msg}`;
  console.log(formatted);
  try {
    fs.appendFileSync(LOG_FILE, formatted + '\n');
  } catch (err) {
    console.error('Failed to write to log file:', err.message);
  }
}

// Deterministic embedding generator (matching client-side memoryStore.js)
function generateEmbedding(text, dim = 256) {
  let seed = 0;
  for (let i = 0; i < text.length; i++) {
    seed = ((seed << 5) - seed + text.charCodeAt(i)) | 0;
  }
  const emb = [];
  for (let i = 0; i < dim; i++) {
    seed = (seed * 16807) % 2147483647;
    emb.push((seed / 2147483647) * 2 - 1);
  }
  const mag = Math.sqrt(emb.reduce((s, v) => s + v * v, 0));
  return emb.map(v => v / mag);
}

// Cosine similarity
function cosineSimilarity(a, b) {
  if (a.length !== b.length) return 0;
  let dot = 0, ma = 0, mb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    ma += a[i] ** 2;
    mb += b[i] ** 2;
  }
  return dot / (Math.sqrt(ma) * Math.sqrt(mb));
}

// Load local memories
function loadMemories() {
  if (!fs.existsSync(MEMORY_FILE)) {
    return [];
  }
  try {
    const data = fs.readFileSync(MEMORY_FILE, 'utf8');
    return JSON.parse(data || '[]');
  } catch (err) {
    log(`⚠️ Error reading memories file: ${err.message}. Initializing empty.`);
    return [];
  }
}

// Save memory locally
function saveMemoryLocally(memory) {
  const memories = loadMemories();
  memories.push({
    ...memory,
    timestamp: Date.now()
  });
  // Keep last 500 memories
  const capped = memories.slice(-500);
  try {
    fs.writeFileSync(MEMORY_FILE, JSON.stringify(capped, null, 2), 'utf8');
  } catch (err) {
    log(`⚠️ Error saving memories file: ${err.message}`);
  }
}

// Build contextual prompt from matching memories
function buildContextPrompt(relevantMemories) {
  if (!relevantMemories || relevantMemories.length === 0) return '';
  const items = relevantMemories.map((m, i) =>
    `[Lesson Memory ${i + 1} | ${(m.similarity * 100).toFixed(0)}% relevant]: ${m.content.slice(0, 300)}`
  ).join('\n');
  return `Here are relevant past learning sessions from this student:\n${items}\n\nUse these to personalize your teaching - reference their past struggles and build on what they already know.`;
}

// Retrieve matching past memories from local store
function searchLocalMemories(queryEmbedding, topK = 5) {
  const memories = loadMemories();
  if (!queryEmbedding || memories.length === 0) return [];
  return memories
    .filter(m => m.embedding?.length > 0)
    .map(m => ({ ...m, similarity: cosineSimilarity(queryEmbedding, m.embedding) }))
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topK);
}

// Fetch helper with timeout
async function fetchWithTimeout(resource, options = {}) {
  const { timeout = 30000 } = options;
  
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(resource, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

// ── Main Simulation Step ────────────────────────────────────
async function performSimulationStep() {
  log('----------------------------------------------------');
  log('Starting SolTutor simulation step...');

  // 1. Pick a random Solidity prompt
  const randomIndex = Math.floor(Math.random() * SOLIDITY_PROMPTS.length);
  const selectedPrompt = SOLIDITY_PROMPTS[randomIndex];
  log(`Selected Topic: [${selectedPrompt.topic.toUpperCase()}]`);
  log(`Selected Question: "${selectedPrompt.question}"`);

  // 2. Generate embedding
  const embedding = generateEmbedding(selectedPrompt.question);

  // 3. Search local history for relevant context
  const searchResults = searchLocalMemories(embedding, 5);
  const relevantMemories = searchResults.filter(m => m.similarity > 0.25);
  log(`Found ${relevantMemories.length} relevant past memories in local store.`);

  // 4. Build context and chat messages payload
  const contextPrompt = buildContextPrompt(relevantMemories);
  const apiMessages = [SYSTEM_PROMPT];
  if (contextPrompt) {
    apiMessages.push({ role: 'system', content: contextPrompt });
  }
  apiMessages.push({ role: 'user', content: selectedPrompt.question });

  // 5. Submit chat query to SolTutor server
  let tutorResponse = '';
  let modelUsed = '';
  try {
    log(`Sending chat query to SolTutor backend at ${API_BASE_URL}/api/chat...`);
    const chatRes = await fetchWithTimeout(`${API_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: apiMessages }),
      timeout: 45000 // give LLM up to 45s
    });

    if (!chatRes.ok) {
      const errText = await chatRes.text();
      throw new Error(`Chat API error (${chatRes.status}): ${errText}`);
    }

    const chatData = await chatRes.json();
    tutorResponse = chatData.content;
    modelUsed = chatData.model || 'unknown-model';
    log(`Received response from tutor (${tutorResponse.length} characters) via ${modelUsed}`);
  } catch (err) {
    log(`❌ Error calling chat API: ${err.message}`);
    return; // Exit current step, retry on next interval
  }

  // 6. Push memory upload to SolTutor server (which writes to 0G storage and anchors it on-chain)
  const conversationText = `User: ${selectedPrompt.question}\nTutor: ${tutorResponse}`;
  try {
    log(`Storing learning memory on 0G via backend at ${API_BASE_URL}/api/memory/store...`);
    const storeRes = await fetchWithTimeout(`${API_BASE_URL}/api/memory/store`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: conversationText,
        embedding,
        metadata: {
          topic: selectedPrompt.topic,
          difficulty: 'beginner',
          model: modelUsed,
          userWallet: SIMULATED_WALLET,
          mode: 'solidity'
        }
      }),
      timeout: 60000 // give 0G anchoring up to 60s
    });

    if (!storeRes.ok) {
      const errText = await storeRes.text();
      throw new Error(`Memory Store API error (${storeRes.status}): ${errText}`);
    }

    const storeData = await storeRes.json();
    log(`✓ Memory uploaded & anchored on-chain!`);
    log(`  Root Hash:    ${storeData.rootHash}`);
    log(`  Tx Hash:      ${storeData.txHash}`);
    log(`  Block Info:   ${storeData.blockLabel}`);
    log(`  Explorer URL: ${storeData.explorerUrl}`);
    log(`  Memory Count: ${storeData.memoryCount}`);

    // 7. Save memory locally
    saveMemoryLocally({
      rootHash: storeData.rootHash,
      content: conversationText,
      embedding,
      metadata: {
        topic: selectedPrompt.topic,
        userWallet: SIMULATED_WALLET,
        mode: 'solidity'
      }
    });
    log('✓ Saved memory record locally.');
  } catch (err) {
    log(`❌ Error calling store memory API: ${err.message}`);
  }
}

// ── Startup & Loop ──
async function main() {
  const once = process.argv.includes('--once');

  log('====================================================');
  log('          SOLTUTOR AUTOMATED LEARNER SIMULATOR');
  log('====================================================');
  log(`Target API URL:   ${API_BASE_URL}`);
  log(`Student Wallet:   ${SIMULATED_WALLET}`);
  log(`Interval:         ${once ? 'Run once' : `${INTERVAL_MS / 1000 / 60} minutes`}`);
  log(`Memory file:      ${MEMORY_FILE}`);
  log(`Log file:         ${LOG_FILE}`);
  log('====================================================');

  // Perform initial run
  await performSimulationStep();

  if (once) {
    log('Run-once execution complete. Exiting.');
    process.exit(0);
  }

  // Setup loop
  setInterval(async () => {
    try {
      await performSimulationStep();
    } catch (err) {
      log(`Unhandled error in simulation loop: ${err.message}`);
    }
  }, INTERVAL_MS);
}

main().catch(err => {
  log(`CRITICAL: Simulator failed to start: ${err.message}`);
  process.exit(1);
});
