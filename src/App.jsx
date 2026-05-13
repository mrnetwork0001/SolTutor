import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Activity, Wifi, WifiOff, Zap, Menu, X } from 'lucide-react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useReadContract } from 'wagmi';
import LandingPage from './components/LandingPage';
import Sidebar from './components/Sidebar';
import ChatPanel from './components/ChatPanel';
import PaywallModal from './components/PaywallModal';
import { sendChat, storeMemory, getStatus } from './services/apiClient';
import memoryStore from './services/memoryStore';
import {
  SOLTUTOR_ACCESS_ABI,
  SOLTUTOR_ACCESS_ADDRESS,
  formatTimeRemaining,
} from './services/accessService';
import { Routes, Route, useNavigate } from 'react-router-dom';
import './App.css';

/* ── System Prompt: SolTutor (Solidity Mode) ─────────── */
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

/* ── System Prompt: 0G Scout (Explorer Mode) ─────────── */
const OG_SCOUT_SYSTEM_PROMPT = {
  role: 'system',
  content: `You are 0G Scout - an expert AI guide for the 0G ecosystem. You help users understand and navigate everything related to 0G Labs.

IMPORTANT - You have PERMANENT MEMORY powered by MemoriaDA on 0G Chain. You CAN and DO remember past conversations with each user. Every conversation is stored on decentralized storage and recalled for you automatically. When a user asks "do you have memory?" or "can you remember?", answer YES - you have persistent, onchain memory. Never deny having memory.

Your style:
- Friendly, clear, and encouraging
- Use simple analogies for complex concepts
- Always include practical next steps: links, commands, or actions
- Reference past conversations when provided as context
- Use markdown formatting with headers, bullets, and code blocks
- Keep responses under 300 words unless showing technical walkthroughs
- Always end with a follow-up question or suggested next topic

## VERIFIED 0G KNOWLEDGE BASE (Source: docs.0g.ai, May 2026)
Use ONLY the facts below when answering. If a user asks something not covered here, say "I'd recommend checking the official docs at https://docs.0g.ai for the latest on that topic."

### 0G Overview
- 0G (Zero Gravity) is a decentralized AI operating system with modular storage, compute, data availability, and the fastest EVM L1 chain.
- Official tagline: "Build the Future of Decentralized AI"
- Key services: 0G Chain, 0G Storage, 0G DA, 0G Compute
- GitHub: https://github.com/0gfoundation
- Foundation: https://0gfoundation.ai
- Website: https://0g.ai
- Builder Hub: https://build.0g.ai
- 0G Hub: https://hub.0g.ai

### 0G Chain
- EVM-compatible L1 blockchain optimized for AI applications.
- Existing Ethereum/Solidity code deploys without changes.
- Modular architecture: separate Consensus Layer and Execution Layer.
- Consensus: Optimized CometBFT (formerly Tendermint), PoS with BFT.
- Performance: 11,000 TPS per shard, sub-second finality.
- Validator selection: VRF (Verifiable Random Function) for fair selection.
- Scaling roadmap: DAG-based consensus, shared security model, parallel tx processing.
- Mainnet name: Aristotle. Testnet name: Galileo.
- Mainnet Chain ID: 16661. Testnet Chain ID: 16602.
- Validators earn: block rewards, transaction fees, staking yields proportional to stake size.

### Galileo Testnet (VERIFIED ENDPOINTS)
- Chain Explorer: https://chainscan-galileo.0g.ai
- Storage Explorer: https://storagescan-galileo.0g.ai
- Faucet: https://faucet.0g.ai (also: https://cloud.google.com/application/web3/faucet/0g/galileo)
- EVM RPC (dev only, not production): https://evmrpc-testnet.0g.ai
- 3rd party RPCs (recommended for production): QuickNode, ThirdWeb, Ankr, dRPC
- Faucet limit: 0.1 0G token per wallet per day. Request more via Discord.
- Ecosystem Explorer (testnet activity): https://explorer.0g.ai/testnet/home

### Galileo Contract Addresses
- 0G Storage Flow: 0x22E03a6A89B950F1c82ec5e74F8eCa321a105296
- 0G Storage Mine: 0x00A9E9604b0538e06b268Fb297Df333337f9593b
- 0G Storage Reward: 0xA97B57b4BdFEA2D0a25e535bd849ad4e6C440A69
- 0G DA Entrance: 0xE75A073dA5bb7b0eC622170Fd268f35E675a957B

### Mainnet (Aristotle)
- Chain Explorer: https://chainscan.0g.ai
- Storage Explorer: https://storagescan.0g.ai
- EVM RPC: https://evmrpc.0g.ai
- Ecosystem Explorer: https://explorer.0g.ai
- Network ID: 16661

### 0G Storage
- Decentralized blob storage with Merkle proof verification.
- Available SDKs: Go SDK and TypeScript SDK.
- TypeScript SDK: npm install @0gfoundation/0g-storage-ts-sdk ethers (ethers is a required peer dep).
- Key classes: ZgFile (filesystem), Blob/ZgBlob (browser), MemData (in-memory upload).
- Upload flow: Create file/blob → call merkleTree() → call indexer.upload() → get rootHash.
- Download: indexer.download(rootHash, outputPath, withProof).
- Turbo indexer (recommended): https://indexer-storage-testnet-turbo.0g.ai
- Two storage networks: Turbo (faster, higher fees) and Standard (slower, lower fees).
- Encryption: AES-256 and ECIES supported (client-side, v1.2.6+). Network never sees plaintext.
- Key-Value storage also available via Batcher class.
- Browser support: Use Blob class (aliased as ZgBlob to avoid native Blob collision). Requires polyfills (vite-plugin-node-polyfills).
- indexer.download() does NOT work in browsers (uses fs). Use StorageNode.downloadSegmentByTxSeq() instead.
- TypeScript Starter Kit: https://github.com/0gfoundation/0g-storage-ts-starter-kit
- Go Starter Kit: https://github.com/0gfoundation/0g-storage-go-starter-kit

### 0G Compute (AI Serving)
- Decentralized GPU marketplace for AI workloads.
- Service types: Chatbot (LLMs), Text-to-Image (Stable Diffusion), Speech-to-Text (Whisper).
- Two access paths: Router (recommended, single API endpoint, API key) and Direct (per-provider, wallet signing).
- Router: OpenAI-compatible API at https://pc.0g.ai. Single unified balance.
- Direct: SDK @0gfoundation/0g-compute-ts-sdk. Requires Node.js >= 22.
- CLI tool: 0g-compute-cli (inference list-providers, inference serve, ui start-web).
- TEE verification: TeeML (model runs inside TEE) and TeeTLS (proxy to centralized LLM via TEE).
- Local proxy: 0g-compute-cli inference serve --provider <ADDR> (runs OpenAI-compatible server on localhost:3000).
- Marketplace UI: https://compute-marketplace.0g.ai/inference
- TypeScript Starter Kit: https://github.com/0gfoundation/0g-compute-ts-starter-kit
- Minimum deposit for ledger: 3 0G. Minimum per-provider sub-account: 1 0G.

### 0G DA (Data Availability)
- Scalable data availability for any chain. Comparable to Celestia/EigenDA.
- Integration guide: https://docs.0g.ai/developer-hub/building-on-0g/da-integration
- Rollup integrations: OP Stack on 0G DA supported.

### Validator Node
- Purpose: Process transactions, maintain consensus, earn rewards.
- Hardware: Linux/macOS, stable internet, Ethereum RPC endpoint.
- Testnet (Galileo): Latest release v3.0.4 from https://github.com/0gfoundation/0gchain-NG/releases
- Mainnet (Aristotle): Latest release v1.0.4 from https://github.com/0gfoundation/0gchain-Aristotle/releases
- Requires restaking via Symbiotic contracts on Ethereum (mainnet: Ethereum, testnet: HoleSky).
- Key files to backup: priv_validator_key.json, node_key.json.
- Validator activation: typically 30-60 minutes after initialization.

### Wallet Setup (MetaMask)
- Step 1: Add network → Network Name: 0G Galileo Testnet, RPC URL: https://evmrpc-testnet.0g.ai, Chain ID: 16602, Symbol: 0G.
- Step 2: Visit https://faucet.0g.ai → enter wallet address → receive 0.1 0G tokens.
- Step 3: Start building: Deploy contracts, use Storage SDK, access Compute, integrate DA.

### Community
- Discord: https://discord.gg/0glabs
- Telegram: https://t.me/zgcommunity
- Twitter/X: https://x.com/0g_labs
- Blog: https://0g.ai/blog
- Community projects: https://github.com/0gfoundation/awesome-0g

### MemoriaDA Protocol
- Permanent memory layer for AI agents, built on 0G Storage + 0G Chain.
- This app (SolTutor) runs on MemoriaDA - every conversation is stored on 0G.
- Registry Contract (Galileo): 0x85d31A4a95035708972Ffbe1Be6f1c31a350b7f3
- GitHub: https://memoriada.xyz
- Pattern: Upload memory blob to 0G Storage → get rootHash → anchor rootHash onchain via MemoriaDA Registry.`
};

const FREE_MEMORY_LIMIT = 3;

export default function App() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [currentTopic, setCurrentTopic] = useState(null);
  const [loading, setLoading] = useState(false);
  const [globalMemoryCount, setGlobalMemoryCount] = useState(0);
  const [backendOnline, setBackendOnline] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [appMode, setAppMode] = useState('solidity'); // 'solidity' | '0g-explorer'
  const [completedTopics, setCompletedTopics] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('soltutor_completed') || '[]');
    } catch { return []; }
  });

  const messagesRef = useRef(messages);
  messagesRef.current = messages;

  // ── Wallet State ──────────────────────────────────
  const { address, isConnected } = useAccount();

  // ── Per-wallet message count (localStorage-backed) ─
  const getWalletKey = (addr) => `soltutor_msg_${addr?.toLowerCase()}`;

  const [userMessageCount, setUserMessageCount] = useState(0);

  // Sync message count when wallet changes
  useEffect(() => {
    if (address) {
      try {
        const count = parseInt(localStorage.getItem(getWalletKey(address)) || '0', 10);
        setUserMessageCount(count);
      } catch { setUserMessageCount(0); }
    } else {
      setUserMessageCount(0);
    }
  }, [address]);

  // Persist message count per-wallet
  useEffect(() => {
    if (address && userMessageCount > 0) {
      try {
        localStorage.setItem(getWalletKey(address), String(userMessageCount));
      } catch {}
    }
  }, [userMessageCount, address]);

  // ── Check Onchain Subscription ───────────────────
  const { data: isSubscribed, refetch: recheckSubscription } = useReadContract({
    address: SOLTUTOR_ACCESS_ADDRESS,
    abi: SOLTUTOR_ACCESS_ABI,
    functionName: 'isSubscribed',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
      refetchInterval: 5000,
      refetchOnMount: 'always',
      refetchOnReconnect: 'always',
    },
  });

  const { data: timeLeft } = useReadContract({
    address: SOLTUTOR_ACCESS_ADDRESS,
    abi: SOLTUTOR_ACCESS_ABI,
    functionName: 'timeRemaining',
    args: address ? [address] : undefined,
    query: { enabled: !!address && isPro },
  });

  // Sync onchain subscription status → isPro
  useEffect(() => {
    if (isSubscribed === true) {
      setIsPro(true);
      setShowPaywall(false);
      console.log('[Subscription] Active subscription detected onchain. Unlocking app.');
    }
  }, [isSubscribed]);

  // Re-check subscription when wallet reconnects
  useEffect(() => {
    if (isConnected && address) {
      recheckSubscription();
    }
  }, [isConnected, address, recheckSubscription]);

  // ── Determine if locked (free tier exhausted) ─────
  const isLocked = isConnected && userMessageCount >= FREE_MEMORY_LIMIT && !isPro;

  // Show paywall when limit is hit
  useEffect(() => {
    if (isLocked) {
      setShowPaywall(true);
    }
  }, [isLocked]);

  // ── Persist user message count ────────────────────
  useEffect(() => {
    if (address && userMessageCount > 0) {
      try {
        localStorage.setItem(getWalletKey(address), String(userMessageCount));
      } catch {}
    }
  }, [userMessageCount, address]);

  // ── Check Backend Status ─────────────────────────
  useEffect(() => {
    const check = async () => {
      try {
        const data = await getStatus();
        setBackendOnline(data.status === 'ok');
        if (data.memoryCount) setGlobalMemoryCount(data.memoryCount);
      } catch {
        setBackendOnline(false);
      }
    };
    check();
    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, []);

  // ── Track Completed Topics ───────────────────────
  useEffect(() => {
    try {
      localStorage.setItem('soltutor_completed', JSON.stringify(completedTopics));
    } catch {}
  }, [completedTopics]);

  // ── Handle Mode Change ───────────────────────────
  const handleModeChange = useCallback((mode) => {
    if (mode === appMode) return;
    setAppMode(mode);
    setMessages([]);       // Clear chat on mode switch
    setCurrentTopic(null); // Reset topic selection
  }, [appMode]);

  // ── Handle Send ──────────────────────────────────
  const handleSend = useCallback(async (userText) => {
    if (loading) return;

    // Must be connected to chat
    if (!isConnected) return;

    // Block if locked
    if (isLocked) {
      setShowPaywall(true);
      return;
    }

    // 1. Add user message
    const userMsg = { role: 'user', content: userText };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      // 2. Generate embedding & search past lessons
      const embedding = memoryStore.generateEmbedding(userText);
      const searchResults = memoryStore.search(embedding, 5);
      const relevant = searchResults.filter((m) => m.similarity > 0.25);

      // 3. Build context prompt
      const contextPrompt = memoryStore.buildContextPrompt(relevant);

      // 4. Assemble messages for API - dynamically select system prompt
      const activeSystemPrompt = appMode === '0g-explorer' ? OG_SCOUT_SYSTEM_PROMPT : SYSTEM_PROMPT;
      const apiMessages = [activeSystemPrompt];
      if (contextPrompt) {
        apiMessages.push({ role: 'system', content: contextPrompt });
      }

      // Include recent conversation (last 10 messages)
      const recentMessages = [...messagesRef.current, userMsg]
        .filter((m) => m.role !== 'system')
        .slice(-10)
        .map((m) => ({ role: m.role, content: m.content }));

      apiMessages.push(...recentMessages);

      // 5. Call backend
      const response = await sendChat(apiMessages);

      // 6. Add assistant message with memory badge
      const assistantMsg = {
        role: 'assistant',
        content: response.content,
        memoryCount: relevant.length,
        anchor: null,
      };
      setMessages((prev) => [...prev, assistantMsg]);

      // Increment per-wallet message counter (for free tier gating)
      setUserMessageCount((prev) => prev + 1);

      // 7. Mark topic as completed if selected
      if (currentTopic && !completedTopics.includes(currentTopic)) {
        setCompletedTopics((prev) => [...prev, currentTopic]);
      }

      // 8. Background: store memory on 0G (tagged with user wallet + mode)
      const conversationText = `User: ${userText}\nTutor: ${response.content}`;
      try {
        const storeResult = await storeMemory(conversationText, embedding, {
          topic: currentTopic || 'general',
          difficulty: 'beginner',
          model: response.model,
          userWallet: address || 'anonymous',
          mode: appMode,
        });

        // Update the last assistant message with anchor info
        setMessages((prev) => {
          const updated = [...prev];
          const lastBot = updated.length - 1;
          if (updated[lastBot]?.role === 'assistant') {
            updated[lastBot] = {
              ...updated[lastBot],
              anchor: {
                blockLabel: storeResult.blockLabel,
                explorerUrl: storeResult.explorerUrl,
                txHash: storeResult.txHash,
              },
            };
          }
          return updated;
        });

        // 9. Save locally
        memoryStore.addMemory({
          rootHash: storeResult.rootHash,
          content: conversationText,
          embedding,
          metadata: { topic: currentTopic || 'general', userWallet: address, mode: appMode },
        });
        setGlobalMemoryCount(Math.max(memoryStore.count, storeResult.memoryCount));
      } catch (err) {
        console.warn('[Memory] Store failed (non-blocking):', err.message);
      }
    } catch (err) {
      console.error('[Chat] Error:', err.message);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `⚠️ **Error:** ${err.message}\n\nMake sure the backend server is running (\`npm run server\`) and your API key is configured in \`.env\`.`,
          memoryCount: 0,
          anchor: null,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [loading, currentTopic, completedTopics, isLocked, isPro, isConnected, address, appMode]);

  // ── Handle Topic Selection ───────────────────────
  const handleTopicSelect = useCallback((topicId, prompt) => {
    if (!isConnected) return;
    if (isLocked) {
      setShowPaywall(true);
      return;
    }
    setCurrentTopic(topicId);
    handleSend(prompt);
  }, [handleSend, isLocked, isConnected]);

  // ── Handle Quiz Answer ───────────────────────────
  const handleQuizAnswer = useCallback((answer) => {
    handleSend(`My answer: ${answer}`);
  }, [handleSend]);

  // ── Handle Upgrade Complete ──────────────────────
  const handleUpgradeComplete = useCallback(() => {
    setIsPro(true);
    setShowPaywall(false);
  }, []);

  return (
    <Routes>
      <Route path="/" element={<LandingPage onLaunch={() => navigate('/app')} />} />
      <Route path="/app" element={
        <div className="app">
          {/* ── Clay Background Blobs ──────────────── */}
          <div className="clay-blobs" aria-hidden="true">
            <div className="clay-blob clay-blob--violet" />
            <div className="clay-blob clay-blob--pink" />
            <div className="clay-blob clay-blob--blue" />
          </div>
          {/* ── Top Bar ───────────────────────────────── */}
          <header className="topbar">
            <div className="topbar-left">
              <button className="topbar-hamburger" onClick={() => setMobileMenuOpen(p => !p)} aria-label="Toggle menu">
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
              <button className="topbar-brand-btn" onClick={() => navigate('/')}>
                <span className="topbar-title">
                  {appMode === '0g-explorer' ? '🔭 0G Scout' : '🎓 SolTutor'}
                </span>
              </button>
              <span className="topbar-divider">|</span>
              <span className="topbar-subtitle">
                {appMode === '0g-explorer' ? '0G Ecosystem Explorer' : 'AI Solidity Tutor'}
              </span>
            </div>
            <div className="topbar-right">
              <div className={`topbar-status ${backendOnline ? 'online' : 'offline'}`}>
                {backendOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
                <span>{backendOnline ? '0G Active' : 'Offline'}</span>
              </div>
              {isPro && (
                <div className="topbar-badge pro-badge">
                  <Zap size={12} fill="currentColor" />
                  <span>NEURAL LINK ON</span>
                </div>
              )}
              <div className="topbar-network">
                <Activity size={14} />
                <span>Galileo Testnet</span>
              </div>
              {/* ── RainbowKit Connect Button ──────── */}
              <div className="topbar-connect">
                <ConnectButton
                  chainStatus="icon"
                  accountStatus="avatar"
                  showBalance={false}
                />
              </div>
            </div>
          </header>

          {/* ── Main Layout ──────────────────────────── */}
          <div className="app-layout">
            {/* Mobile sidebar backdrop */}
            {mobileMenuOpen && <div className="sidebar-backdrop" onClick={() => setMobileMenuOpen(false)} />}
            <Sidebar
              currentTopic={currentTopic}
              onTopicSelect={(id, prompt) => { handleTopicSelect(id, prompt); setMobileMenuOpen(false); }}
              memoryCount={globalMemoryCount}
              userMessageCount={userMessageCount}
              lessonsCompleted={completedTopics.length}
              isPro={isPro}
              freeLimit={FREE_MEMORY_LIMIT}
              isLocked={isLocked}
              isConnected={isConnected}
              onShowPaywall={() => setShowPaywall(true)}
              timeLeft={timeLeft}
              walletAddress={address}
              appMode={appMode}
              onModeChange={(m) => { handleModeChange(m); setMobileMenuOpen(false); }}
              mobileOpen={mobileMenuOpen}
            />
            <main className="main-content">
              <ChatPanel
                messages={messages}
                onSend={handleSend}
                loading={loading}
                onQuizAnswer={handleQuizAnswer}
                isLocked={isLocked}
                isConnected={isConnected}
                appMode={appMode}
              />
            </main>
          </div>

          {/* ── Paywall Modal ────────────────────────── */}
          {showPaywall && (
            <PaywallModal
              memoryCount={userMessageCount}
              freeLimit={FREE_MEMORY_LIMIT}
              onUpgradeComplete={handleUpgradeComplete}
            />
          )}
        </div>
      } />
    </Routes>
  );
}
