<p align="center">
  <img src="https://img.shields.io/badge/0G%20Chain-Aristotle%20Mainnet-blue?style=for-the-badge" />
  <img src="https://img.shields.io/badge/MemoriaDA-Protocol-purple?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Solidity-0.8.20-gray?style=for-the-badge&logo=solidity" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react" />
</p>

# 🎓 SolTutor — AI Solidity Tutor with Permanent Memory

> **Learn Solidity with an AI that never forgets.** Every lesson is permanently stored on the **0G decentralized network** via the **MemoriaDA Protocol** — so your tutor recalls past conversations, mistakes, and breakthroughs across sessions.

SolTutor is a full-stack Web3 education dApp that combines AI-powered tutoring with decentralized persistent memory and on-chain subscription management. **Built by the MemoriaDA team** as a flagship integration to demonstrate how any AI application can gain permanent, verifiable memory using the MemoriaDA infrastructure.

> [!IMPORTANT]
> **SolTutor is live on 0G Aristotle Mainnet.** All memory anchoring, subscription payments, and agent registration run on the production network.
>
> 🔗 **Live App:** [soltutor.memoriada.xyz](https://soltutor.memoriada.xyz)

---

## 🧬 Built by the MemoriaDA Team

SolTutor was designed and built by the **MemoriaDA** core team as a **first-party reference application** — proving that the MemoriaDA protocol is production-ready infrastructure for any AI agent that needs persistent, decentralized memory.

| | |
|---|---|
| **Why we built it** | To show that any developer can integrate MemoriaDA into a real product in days — not months. SolTutor went from zero to mainnet with full memory persistence, on-chain anchoring, and subscription gating. |
| **What it proves** | MemoriaDA handles the entire memory lifecycle: blob upload to 0G Storage → Merkle root anchoring on 0G Chain → semantic recall across sessions. Developers don't need to build any of this themselves. |
| **Protocol used** | [MemoriaDA Protocol](https://memoriada.xyz) — the universal memory layer for AI agents on 0G |
| **Registry contract** | [`0xD896D59583C137D6ca2c5e3add025e143eD1030d`](https://chainscan.0g.ai/address/0xD896D59583C137D6ca2c5e3add025e143eD1030d) on 0G Mainnet |

> If you're building an AI agent and want it to **remember everything**, MemoriaDA is the infrastructure you need. SolTutor is the proof.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| **🧠 Persistent AI Memory** | Every conversation is embedded, stored on 0G Storage, and anchored on-chain via MemoriaDA. The tutor recalls your past lessons. |
| **🔭 Dual Mode** | Toggle between **SolTutor** (Solidity tutor) and **0G Scout** (0G ecosystem explorer) — two AI agents sharing one permanent memory brain. |
| **💎 On-Chain Subscriptions** | Monthly subscription (0.1 0G / 30 days) managed by a smart contract. No centralized payment — just wallet + blockchain. |
| **🔐 Wallet-First UX** | RainbowKit wallet connection required to start. Each wallet gets 3 free trial messages before subscription is required. |
| **📚 20 Curated Tracks** | 10 Solidity tracks (basics to DeFi) + 10 0G ecosystem topics — structured paths with AI-generated quizzes. |
| **⚡ On-Chain Verification** | Every memory anchored with a block number + explorer link. Fully verifiable learning history. |
| **🎨 Claymorphism UI** | Modern claymorphism design with smooth animations, code syntax highlighting, and responsive layout. |

---

## 🏆 Hackathon Judging Guide

This section is explicitly provided to assist judges in evaluating the SolTutor submission for the 0G Aristotle Mainnet Hackathon.

### 🧩 0G Modules Used
1. **0G Storage**
2. **0G Chain (Aristotle Mainnet)**
3. **0G Compute**

### 💡 How These Modules Support the Product
* **0G Storage**: Acts as the decentralized "brain" for the AI tutor. Every time a user interacts with the AI, the conversation is embedded and uploaded as a blob to 0G Storage. This ensures that the AI's memory is permanent, decentralized, and immune to server wipes.
* **0G Chain (Aristotle Mainnet)**: Serves two critical functions:
  1. **Subscription Gating**: The `SolTutorAccess.sol` smart contract is deployed directly on the 0G Chain. It handles decentralized subscription payments (0.1 A0GI for 30 days) and on-chain access verification.
  2. **Memory Anchoring**: The Merkle root hash of every memory blob uploaded to 0G Storage is anchored on the 0G Chain via the MemoriaDA Registry contract, guaranteeing that the learning history is immutable and publicly verifiable.
* **0G Compute**: AI inference is powered by the 0G Compute Router API using the `0GM-1.0-35B-A3B` model — a 35B-parameter MoE reasoning model hosted entirely on the 0G network. Zero dependency on external AI providers (no OpenAI, no Anthropic). The entire AI stack runs natively on 0G.

### 🧪 Reviewer Notes & Testing Instructions
* **Live Testing**: You can evaluate the live production application at [soltutor.memoriada.xyz](https://soltutor.memoriada.xyz).
* **No Initial Funds Required**: Every new wallet connected receives **3 FREE messages**. This allows judges to test the AI tutor, verify the 0G memory storage flow, and see the on-chain anchoring without needing any mainnet A0GI tokens.
* **Network Setup**: Ensure your wallet (e.g., MetaMask) is connected to the **0G Aristotle Mainnet** (Chain ID: `16661`, RPC: `https://evmrpc.0g.ai`). The application will automatically prompt you to add or switch to this network upon connecting.
* **Testing the Paywall**: Once the 3 free messages are exhausted, a paywall will appear. To proceed, a user requires 0.1 A0GI on the mainnet. If you wish to continue testing without subscribing, simply connect a different wallet address to receive a fresh set of free messages.
* **Local Reproduction**: Detailed instructions to spin up the entire stack locally are provided in the *Getting Started* section below.

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React + Vite)               │
│  ┌──────────┐  ┌──────────┐  ┌─────────────┐           │
│  │ ChatPanel│  │ Sidebar  │  │PaywallModal │           │
│  └────┬─────┘  └──────────┘  └──────┬──────┘           │
│       │                              │                   │
│  ┌────▼──────────────────────────────▼──────┐           │
│  │            App.jsx (State Manager)        │           │
│  │  • Wallet: RainbowKit + wagmi            │           │
│  │  • Routing: react-router-dom (/ + /app)  │           │
│  │  • Memory: Local embedding + search       │           │
│  │  • Gating: Per-wallet free tier counter   │           │
│  └────┬──────────────────────────────┬──────┘           │
└───────┼──────────────────────────────┼───────────────────┘
        │                              │
        ▼                              ▼
┌───────────────┐           ┌─────────────────────┐
│  Backend API  │           │  0G Aristotle       │
│  (Express.js) │           │  Mainnet            │
│  PORT: 3003   │           │                     │
│               │           │  SolTutorAccess.sol │
│  • /api/chat  │──────┐    │  (Subscriptions)    │
│  • /api/store │      │    │                     │
│  • /api/status│      │    │  MemoriaDA Registry │
└───────┬───────┘      │    │  (Memory Anchoring) │
        │              │    └─────────────────────┘
        ▼              ▼
┌───────────────┐  ┌────────────────────────┐
│  0G Storage   │  │  0G Compute            │
│  (Blobs)      │  │  Router API            │
│  Memory data  │  │  Model: 0GM-1.0-35B-A3B│
│  stored on 0G │  │  AI inference on 0G    │
└───────────────┘  └────────────────────────┘
```

---

## 📁 Project Structure

```
SolidityTutor/
├── contracts/
│   └── SolTutorAccess.sol          # On-chain subscription smart contract
├── scripts/
│   ├── deploy-mainnet.js           # Deploy contract to 0G Mainnet
│   ├── deploy-direct.mjs           # Deploy contract to 0G Testnet
│   ├── setPrice.mjs                # Update subscription price on-chain
│   └── withdraw.mjs                # Withdraw subscription revenue
├── server/
│   ├── index.js                    # Express backend (chat + memory storage)
│   ├── storageUpload.js            # 0G Storage blob upload
│   └── registryAnchor.js           # MemoriaDA registry anchoring
├── src/
│   ├── main.jsx                    # App entry (BrowserRouter + WalletProvider)
│   ├── App.jsx                     # Main app logic + routing (/ and /app)
│   ├── WalletProvider.jsx          # RainbowKit + wagmi + 0G chain config
│   ├── components/
│   │   ├── LandingPage.jsx         # Marketing landing page
│   │   ├── ChatPanel.jsx           # Chat interface with code highlighting
│   │   ├── Sidebar.jsx             # Topic navigator + Neural Link status
│   │   ├── PaywallModal.jsx        # Subscription paywall overlay
│   │   ├── CodeBlock.jsx           # Syntax-highlighted code renderer
│   │   └── ProgressBar.jsx         # Reusable progress component
│   ├── services/
│   │   ├── apiClient.js            # Backend API client
│   │   ├── memoryStore.js          # Client-side memory + embedding engine
│   │   └── accessService.js        # Contract ABI, address, pricing config
│   └── *.css                       # Claymorphism design system
├── .env                            # Environment variables
├── hardhat.config.cjs              # Hardhat config for 0G
├── vite.config.js                  # Vite build config
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 22
- **MetaMask** or any WalletConnect-compatible wallet
- **0G Mainnet** 0G tokens
- **0G Compute Router API Key** (get one at [0G Compute](https://router-api.0g.ai))

### 1. Clone & Install

```bash
git clone https://github.com/mrnetwork0001/SolTutor.git
cd SolTutor
npm install
```

### 2. Configure Environment

Create a `.env` file in the project root:

```env
# 0G Network — Server-side signing (Developer Pays model)
ZG_PRIVATE_KEY=0xYOUR_PRIVATE_KEY
ZG_NETWORK=mainnet

# MemoriaDA Registry Contract (deployed on 0G Mainnet)
MEMORIA_REGISTRY_ADDRESS=0xD896D59583C137D6ca2c5e3add025e143eD1030d

# AI Inference — 0G Compute Router API
ZG_CHAT_API_KEY=your-0g-compute-api-key
ZG_CHAT_BASE_URL=https://router-api.0g.ai/v1
ZG_CHAT_MODEL=0GM-1.0-35B-A3B

PORT=3003
```

### 3. Deploy the Subscription Contract

```bash
# Compile the contract
npx hardhat compile --config hardhat.config.cjs

# Deploy to 0G Mainnet
node scripts/deploy-mainnet.js
```

Copy the deployed address and update it in `src/services/accessService.js`:
```javascript
export const SOLTUTOR_ACCESS_ADDRESS = '0xYOUR_DEPLOYED_ADDRESS';
```

### 4. Start the Application

```bash
# Start both frontend (Vite) + backend (Express) simultaneously
npm run dev:all
```

- **Frontend**: [http://localhost:5175](http://localhost:5175)
- **Backend API**: [http://localhost:3003](http://localhost:3003)

---

## 💰 Subscription Model

### User Flow

```
Connect Wallet → 3 Free Messages → Paywall → Pay 0.1 0G → 30 Days Unlimited
```

1. **Connect** — User connects MetaMask via RainbowKit
2. **Free Trial** — 3 free messages per wallet (tracked per-wallet in localStorage)
3. **Paywall** — Full-screen overlay locks the app after free tier
4. **Subscribe** — 0.1 0G native token payment to the smart contract
5. **Unlimited** — 30 days of unlimited access; stackable renewals

### Smart Contract — `SolTutorAccess.sol`

| Function | Access | Description |
|---|---|---|
| `subscribe()` | Public | Pay subscription price for 30-day access |
| `isSubscribed(addr)` | View | Check if address has active subscription |
| `timeRemaining(addr)` | View | Seconds remaining on subscription |
| `setPrice(newPrice)` | Owner | Change subscription price on-chain |
| `setDuration(newDuration)` | Owner | Change subscription period |
| `withdraw()` | Owner | Withdraw accumulated fees to owner wallet |
| `transferOwnership(addr)` | Owner | Transfer contract ownership |

**Deployed**: [`0x3D078d15B4dF4Bc3d5D048444A82875BE511011d`](https://chainscan.0g.ai/address/0x3D078d15B4dF4Bc3d5D048444A82875BE511011d) on 0G Aristotle Mainnet

### Revenue Withdrawal

```bash
# Check contract balance and withdraw all fees
node scripts/withdraw.mjs
```

---

## 🧠 MemoriaDA Integration

SolTutor uses the **MemoriaDA Protocol** for decentralized, persistent AI memory. This is the same infrastructure available to any developer building AI agents on 0G.

### How Memory Works

1. **User sends a message** → Backend generates an AI response
2. **Embedding** — Client-side TF-IDF embedding of the conversation
3. **Storage** — Conversation text uploaded to **0G Storage** as a blob
4. **Anchoring** — Root hash anchored on-chain via **MemoriaDA Registry** contract
5. **Recall** — On subsequent messages, past memories are searched by semantic similarity and injected as context

### Memory Architecture

```
User Message → TF-IDF Embedding → Cosine Similarity Search
                                         ↓
                               Top-5 Relevant Memories
                                         ↓
                              Injected as System Context
                                         ↓
                              AI generates response with
                              "As we discussed before..."
```

Every memory is verified on-chain:
- **Block number** + **explorer link** shown on each response
- **Root hash** permanently anchored in MemoriaDA Registry
- **Data** stored on 0G decentralized storage network

> **For developers:** If you want to add this same memory capability to your AI agent, check out [MemoriaDA](https://memoriada.xyz) — the protocol handles blob upload, Merkle anchoring, and agent registration out of the box.

---

## 🤖 0G Compute Integration (AI Inference)

All AI chat inference runs through the **0G Compute Router API** — zero dependency on external AI providers.

**Implementation** — [`server/index.js`](./server/index.js)
- **Endpoint**: `https://router-api.0g.ai/v1` (OpenAI-compatible)
- **Model**: `0GM-1.0-35B-A3B` — a 35B-parameter Mixture-of-Experts reasoning model hosted on the 0G network
- **SDK**: Uses the standard `openai` npm package for seamless integration
- **Fully native to the 0G stack** — no OpenAI, no Anthropic, no external AI dependency

> **🧪 Technical Discovery: 0GM is a Reasoning Model**
>
> During integration, we discovered that `0GM-1.0-35B-A3B` operates as a **chain-of-thought reasoning model** (similar architecture to DeepSeek-R1). The model separates its output into two fields:
> - `reasoning_content` — internal chain-of-thought (hidden from the user)
> - `content` — the final synthesized answer
>
> This means the model *thinks before it responds*, producing higher-quality analysis. Our backend handles both response paths with a graceful fallback: if the model exhausts its token budget on reasoning, we extract the draft answer from the reasoning chain rather than failing.

---

## 📚 Learning Tracks

### SolTutor Mode (Solidity)

| # | Topic | Concepts Covered |
|---|---|---|
| 1 | **Basics** | Variables, Types, Functions |
| 2 | **Storage & Memory** | Data locations, gas implications |
| 3 | **Events & Logging** | Event emission, indexed params |
| 4 | **Modifiers & Access** | Access control patterns |
| 5 | **Security Patterns** | Reentrancy, overflow, exploits |
| 6 | **Gas Optimization** | Packing, batching, opcodes |
| 7 | **ERC-20 Tokens** | Fungible token standard |
| 8 | **ERC-721 NFTs** | Non-fungible token standard |
| 9 | **Proxy Patterns** | Upgradeability, delegatecall |
| 10 | **DeFi Patterns** | AMMs, lending, yield |

### 0G Scout Mode (Ecosystem)

| # | Topic | Concepts Covered |
|---|---|---|
| 1 | **0G Overview** | Architecture, modular design |
| 2 | **0G Chain** | EVM L1, consensus, performance |
| 3 | **0G Storage** | Blob upload, Merkle proofs, SDKs |
| 4 | **0G DA** | Data availability layer |
| 5 | **0G Compute** | GPU marketplace, AI serving |
| 6 | **Wallet Setup** | MetaMask config, faucets |
| 7 | **Smart Contracts** | Deploying on 0G Chain |
| 8 | **Validators** | Running nodes, staking |
| 9 | **MemoriaDA** | Memory protocol integration |
| 10 | **Ecosystem** | Community, tools, resources |

---

## 🔧 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite 8, Lucide Icons |
| **Routing** | react-router-dom v6 |
| **Wallet** | RainbowKit v2, wagmi v2, viem |
| **Styling** | Vanilla CSS (claymorphism design system) |
| **Backend** | Express.js 5, Node.js 22+ |
| **AI** | 0G Compute Router API — `0GM-1.0-35B-A3B` (35B MoE reasoning model) |
| **Storage** | 0G Storage (decentralized blobs) |
| **Smart Contract** | Solidity 0.8.20, Hardhat v3 |
| **Memory Protocol** | MemoriaDA (0G-native) |
| **Blockchain** | 0G Aristotle Mainnet (Chain ID: 16661) |

---

## 🌐 Network Configuration

| Parameter | Value |
|---|---|
| **Chain Name** | 0G Aristotle Mainnet |
| **Chain ID** | `16661` |
| **RPC URL** | `https://evmrpc.0g.ai` |
| **Block Explorer** | `https://chainscan.0g.ai` |
| **Currency** | 0G |
| **Live App** | [soltutor.memoriada.xyz](https://soltutor.memoriada.xyz) |

---

## 🛣 Roadmap

### ✅ Completed
- [x] AI-powered Solidity tutoring via 0G Compute (`0GM-1.0-35B-A3B`)
- [x] 0G Scout ecosystem explorer mode
- [x] Persistent memory via MemoriaDA + 0G Storage
- [x] On-chain subscription management (0.1 0G / 30 days)
- [x] RainbowKit wallet integration
- [x] Wallet-first UX with 3 free trial messages
- [x] 20 curated learning tracks (10 Solidity + 10 0G)
- [x] Claymorphism-themed responsive UI
- [x] 0G Aristotle Mainnet deployment
- [x] Custom domain routing (soltutor.memoriada.xyz/app)

### 🔮 Future
- [ ] Per-wallet on-chain memory indexing
- [ ] Multi-model support (Claude, Gemini, local LLMs)
- [ ] Interactive code playground (in-browser Solidity compiler)
- [ ] NFT certificates for completed learning tracks
- [ ] Leaderboard and social learning features
- [ ] Mobile-optimized PWA

---

## 🔐 Security Notes

- **Developer Pays model** — The server-side wallet pays for 0G Storage fees. Users never need to sign storage transactions.
- **Subscription funds** — Accumulated in the smart contract. Only the contract owner can withdraw.
- **Private keys** — Never exposed to the frontend. `ZG_PRIVATE_KEY` is server-side only.
- **Per-wallet tracking** — Free tier tracked per wallet address in localStorage. Switching wallets resets the counter.

---

## 📄 License

MIT

---

<p align="center">
  <strong>Built with ❤️ by the <a href="https://memoriada.xyz">MemoriaDA</a> team</strong><br/>
  <em>A first-party showcase of the MemoriaDA Protocol on <a href="https://0g.ai">0G Labs Chain</a></em><br/><br/>
  <em>SolTutor proves that MemoriaDA is production-ready infrastructure for AI agents that need permanent, decentralized memory.</em>
</p>
