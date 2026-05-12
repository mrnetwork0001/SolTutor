<p align="center">
  <img src="https://img.shields.io/badge/0G%20Chain-Galileo%20Testnet-blue?style=for-the-badge" />
  <img src="https://img.shields.io/badge/MemoriaDA-Protocol-purple?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Solidity-0.8.20-gray?style=for-the-badge&logo=solidity" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react" />
</p>

# 🎓 SolTutor — AI Solidity Tutor with Permanent Memory

> **Learn Solidity with an AI that never forgets.** Every lesson is permanently stored on the **0G decentralized network** via the **MemoriaDA Protocol** — so your tutor recalls past conversations, mistakes, and breakthroughs across sessions.

SolTutor is a full-stack Web3 education dApp that combines AI-powered tutoring with decentralized persistent memory and on-chain subscription management. Built for the **0G APAC Hackathon**.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| **🧠 Persistent AI Memory** | Every conversation is embedded, stored on 0G Storage, and anchored on-chain via MemoriaDA. The tutor recalls your past lessons. |
| **💎 On-Chain Subscriptions** | Monthly subscription (1 A0GI / 30 days) managed by a smart contract. No centralized payment — just wallet + blockchain. |
| **🔐 Wallet-First UX** | RainbowKit wallet connection required to start. Each wallet gets 3 free trial messages before subscription is required. |
| **📚 10 Curated Tracks** | Structured topics from Solidity basics to DeFi patterns, with code examples and mini-quizzes. |
| **⚡ On-Chain Verification** | Every memory anchored with a block number + explorer link. Fully verifiable learning history. |
| **🎨 Cyberpunk UI** | Dark-mode glassmorphism design with smooth animations, code syntax highlighting, and responsive layout. |

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
│  │  • Memory: Local embedding + search       │           │
│  │  • Gating: Per-wallet free tier counter   │           │
│  └────┬──────────────────────────────┬──────┘           │
└───────┼──────────────────────────────┼───────────────────┘
        │                              │
        ▼                              ▼
┌───────────────┐           ┌─────────────────────┐
│  Backend API  │           │  0G Galileo Testnet │
│  (Express.js) │           │                     │
│  PORT: 3003   │           │  SolTutorAccess.sol │
│               │           │  (Subscriptions)    │
│  • /api/chat  │           │                     │
│  • /api/store │           │  MemoriaDA Registry │
│  • /api/status│           │  (Memory Anchoring) │
└───────┬───────┘           └─────────────────────┘
        │
        ▼
┌───────────────────────┐
│  0G Storage Network   │
│  (Decentralized Blobs)│
│  Memory data stored   │
│  permanently on 0G    │
└───────────────────────┘
```

---

## 📁 Project Structure

```
SolidityTutor/
├── contracts/
│   └── SolTutorAccess.sol          # On-chain subscription smart contract
├── scripts/
│   ├── deploy-direct.mjs           # Deploy contract to 0G Galileo
│   └── withdraw.mjs                # Withdraw subscription revenue
├── server/
│   ├── index.js                    # Express backend (chat + memory storage)
│   ├── storageUpload.js            # 0G Storage blob upload
│   └── registryAnchor.js           # MemoriaDA registry anchoring
├── src/
│   ├── main.jsx                    # App entry (wrapped in WalletProvider)
│   ├── App.jsx                     # Main app logic + state management
│   ├── App.css                     # Full design system (2200+ lines)
│   ├── WalletProvider.jsx          # RainbowKit + wagmi + 0G chain config
│   ├── components/
│   │   ├── LandingPage.jsx         # Marketing landing page
│   │   ├── ChatPanel.jsx           # Chat interface with code highlighting
│   │   ├── Sidebar.jsx             # Topic navigator + Neural Link status
│   │   ├── PaywallModal.jsx        # Subscription paywall overlay
│   │   ├── CodeBlock.jsx           # Syntax-highlighted code renderer
│   │   └── ProgressBar.jsx         # Reusable progress component
│   └── services/
│       ├── apiClient.js            # Backend API client
│       ├── memoryStore.js          # Client-side memory + embedding engine
│       └── accessService.js        # Contract ABI, address, helpers
├── .env                            # Environment variables
├── hardhat.config.cjs              # Hardhat config for 0G Galileo
├── vite.config.js                  # Vite build config
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **MetaMask** or any WalletConnect-compatible wallet
- **0G Galileo Testnet** A0GI tokens ([Faucet](https://faucet.0g.ai))
- **OpenAI API Key** (or any OpenAI-compatible API)

### 1. Clone & Install

```bash
git clone https://github.com/your-username/SolidityTutor.git
cd SolidityTutor
npm install
```

### 2. Configure Environment

Create a `.env` file in the project root:

```env
# 0G Network — Server-side signing (Developer Pays model)
ZG_PRIVATE_KEY=0xYOUR_PRIVATE_KEY
ZG_NETWORK=testnet

# MemoriaDA Registry Contract (deployed on 0G Galileo Testnet)
MEMORIA_REGISTRY_ADDRESS=0x85d31A4a95035708972Ffbe1Be6f1c31a350b7f3

# AI Chat (OpenAI-compatible)
OPENAI_API_KEY=sk-your-api-key
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4o-mini

PORT=3003
```

### 3. Deploy the Subscription Contract

```bash
# Compile the contract
npx hardhat compile --config hardhat.config.cjs

# Deploy to 0G Galileo Testnet
node scripts/deploy-direct.mjs
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
Connect Wallet → 3 Free Messages → Paywall → Pay 1 A0GI → 30 Days Unlimited
```

1. **Connect** — User connects MetaMask via RainbowKit (top-right button)
2. **Free Trial** — 3 free messages per wallet (tracked per-wallet in localStorage)
3. **Paywall** — Full-screen overlay locks the app after free tier
4. **Subscribe** — 1 A0GI native token payment to the smart contract
5. **Unlimited** — 30 days of unlimited access; stackable renewals

### Smart Contract — `SolTutorAccess.sol`

| Function | Access | Description |
|---|---|---|
| `subscribe()` | Public | Pay subscription price for 30-day access |
| `isSubscribed(addr)` | View | Check if address has active subscription |
| `timeRemaining(addr)` | View | Seconds remaining on subscription |
| `setPrice(newPrice)` | Owner | Change price (for mainnet migration) |
| `setDuration(newDuration)` | Owner | Change subscription period |
| `withdraw()` | Owner | Withdraw accumulated fees to owner wallet |
| `transferOwnership(addr)` | Owner | Transfer contract ownership |

**Deployed**: [`0x2AE191e794F00920383471A8d8b12b696147b659`](https://chainscan-galileo.0g.ai/address/0x2AE191e794F00920383471A8d8b12b696147b659) on 0G Galileo Testnet

### Revenue Withdrawal

```bash
# Check contract balance and withdraw all fees
node scripts/withdraw.mjs
```

---

## 🧠 MemoriaDA Integration

SolTutor uses the **MemoriaDA Protocol** for decentralized, persistent AI memory:

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

---

## 📚 Learning Tracks

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

---

## 🔧 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite 8, Lucide Icons |
| **Wallet** | RainbowKit v2, wagmi v2, viem |
| **Styling** | Vanilla CSS (cyberpunk design system) |
| **Backend** | Express.js 5, Node.js |
| **AI** | OpenAI GPT-4o-mini (configurable) |
| **Storage** | 0G Storage (decentralized blobs) |
| **Smart Contract** | Solidity 0.8.20, Hardhat v3 |
| **Memory Protocol** | MemoriaDA (0G-native) |
| **Blockchain** | 0G Galileo Testnet (Chain ID: 16602) |

---

## 🌐 Network Configuration

| Parameter | Value |
|---|---|
| **Chain Name** | 0G Galileo Testnet |
| **Chain ID** | `16602` |
| **RPC URL** | `https://evmrpc-testnet.0g.ai` |
| **Block Explorer** | `https://chainscan-galileo.0g.ai` |
| **Currency** | A0GI |
| **Faucet** | [https://faucet.0g.ai](https://faucet.0g.ai) |

---

## 🛣 Roadmap

### ✅ Completed (Hackathon MVP)
- [x] AI-powered Solidity tutoring with GPT-4o-mini
- [x] Persistent memory via MemoriaDA + 0G Storage
- [x] On-chain subscription management
- [x] RainbowKit wallet integration
- [x] Wallet-first UX with 3 free trial messages
- [x] 10 curated learning tracks
- [x] Cyberpunk-themed responsive UI

### 🔮 Post-Hackathon
- [ ] Mainnet deployment (adjustable pricing: 5–20 A0GI/mo)
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
  <strong>Built with ❤️ for the 0G APAC Hackathon</strong><br/>
  <em>Powered by <a href="https://memoriadal.com">MemoriaDA Protocol</a> on <a href="https://0g.ai">0G Labs Chain</a></em>
</p>
