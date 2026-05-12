import React, { useState } from 'react';
import {
  GraduationCap, ChevronRight, ChevronDown, Database, Shield,
  Zap, Coins, Image, Layers, TrendingUp, BookOpen, Lock, Flame,
  Box, ExternalLink, Sparkles, Clock, Compass,
  Globe, Link, Cpu, Wallet, Code2, Brain
} from 'lucide-react';
import ProgressBar from './ProgressBar';
import { formatTimeRemaining, SUBSCRIPTION_PRICE_DISPLAY } from '../services/accessService';

/* ── Solidity Topics ─────────────────────────────────── */
const TOPICS = [
  {
    id: 'basics',
    label: 'Basics',
    icon: BookOpen,
    description: 'Variables, Types, Functions',
    prompt: 'Teach me about Solidity basics - variables, data types, and functions. Start with the fundamentals.',
  },
  {
    id: 'storage',
    label: 'Storage & Memory',
    icon: Database,
    description: 'Data locations, gas implications',
    prompt: 'Explain the difference between storage, memory, and calldata in Solidity. When should I use each?',
  },
  {
    id: 'events',
    label: 'Events & Logging',
    icon: Zap,
    description: 'Event emission, indexed params',
    prompt: 'Teach me about Events in Solidity - how to declare, emit, and listen to them.',
  },
  {
    id: 'modifiers',
    label: 'Modifiers & Access',
    icon: Lock,
    description: 'Access control patterns',
    prompt: 'Teach me about Solidity modifiers and access control patterns like Ownable.',
  },
  {
    id: 'security',
    label: 'Security Patterns',
    icon: Shield,
    description: 'Reentrancy, overflow, exploits',
    prompt: 'Teach me about Reentrancy attacks in Solidity - how they work and how to prevent them.',
  },
  {
    id: 'gas',
    label: 'Gas Optimization',
    icon: Flame,
    description: 'Packing, batching, opcodes',
    prompt: 'What are the best gas optimization techniques in Solidity? Show me before/after examples.',
  },
  {
    id: 'erc20',
    label: 'ERC-20 Tokens',
    icon: Coins,
    description: 'Fungible token standard',
    prompt: 'Walk me through building an ERC-20 token from scratch. Explain each function.',
  },
  {
    id: 'erc721',
    label: 'ERC-721 NFTs',
    icon: Image,
    description: 'Non-fungible token standard',
    prompt: 'Teach me how to build an ERC-721 NFT contract. What are the key functions?',
  },
  {
    id: 'proxy',
    label: 'Proxy Patterns',
    icon: Layers,
    description: 'Upgradeability, delegatecall',
    prompt: 'Explain the Proxy pattern in Solidity. How does delegatecall enable upgradeability?',
  },
  {
    id: 'defi',
    label: 'DeFi Patterns',
    icon: TrendingUp,
    description: 'AMMs, lending, yield',
    prompt: 'Teach me about common DeFi smart contract patterns - AMMs, lending pools, and yield strategies.',
  },
];

/* ── 0G Explorer Topics ──────────────────────────────── */
const OG_TOPICS = [
  {
    id: '0g-intro',
    label: 'What is 0G?',
    icon: Globe,
    description: 'Overview of the 0G ecosystem',
    prompt: 'Give me a beginner-friendly overview of the 0G ecosystem. What is 0G, what problems does it solve, and why should I care?',
  },
  {
    id: '0g-chain',
    label: '0G Chain',
    icon: Link,
    description: 'EVM L1, consensus, architecture',
    prompt: 'Tell me about 0G Chain. How does it work as an EVM-compatible L1? What makes it different from Ethereum?',
  },
  {
    id: '0g-storage',
    label: '0G Storage',
    icon: Database,
    description: 'Decentralized blob storage',
    prompt: 'Explain 0G Storage. How does decentralized blob storage work? How do I upload data using the TypeScript SDK?',
  },
  {
    id: '0g-da',
    label: '0G DA',
    icon: Layers,
    description: 'Data Availability layer',
    prompt: 'What is 0G DA (Data Availability)? How does it compare to Celestia or EigenDA? Why do rollups need it?',
  },
  {
    id: '0g-compute',
    label: '0G Compute',
    icon: Cpu,
    description: 'AI Serving & inference',
    prompt: 'Tell me about 0G Compute and AI Serving. How can I run AI inference on 0G infrastructure? What models are available?',
  },
  {
    id: '0g-staking',
    label: 'Staking & Validators',
    icon: Coins,
    description: 'Staking rewards, running nodes',
    prompt: 'How does staking work on 0G? How do I become a validator? What are the hardware requirements?',
  },
  {
    id: 'wallet-setup',
    label: 'Wallet Setup',
    icon: Wallet,
    description: 'MetaMask, faucets, testnet',
    prompt: 'Walk me through setting up my wallet for 0G. How do I add Galileo testnet to MetaMask and get testnet tokens?',
  },
  {
    id: 'deploy-contract',
    label: 'Deploy on 0G',
    icon: Code2,
    description: 'Smart contracts on Galileo',
    prompt: 'How do I deploy a smart contract on 0G Galileo testnet? Give me a step-by-step guide.',
  },
  {
    id: 'memoria-da',
    label: 'MemoriaDA Protocol',
    icon: Brain,
    description: 'AI agent memory layer',
    prompt: 'What is MemoriaDA? How does it provide permanent memory for AI agents using 0G Storage and Chain?',
  },
  {
    id: '0g-ecosystem',
    label: 'Ecosystem & Community',
    icon: TrendingUp,
    description: 'dApps, hackathons, grants',
    prompt: 'What projects are building on 0G? How can I participate in hackathons and grants?',
  },
];

export default function Sidebar({
  currentTopic,
  onTopicSelect,
  memoryCount,
  lessonsCompleted,
  isPro,
  freeLimit,
  isLocked,
  isConnected,
  onShowPaywall,
  timeLeft,
  walletAddress,
  userMessageCount,
  appMode,
  onModeChange,
  mobileOpen,
}) {
  const [expandedTopics, setExpandedTopics] = useState(true);

  const activeTopic = appMode === '0g-explorer' ? OG_TOPICS : TOPICS;
  const totalTopics = activeTopic.length;
  const completedCount = lessonsCompleted || 0;

  return (
    <aside className={`sidebar ${mobileOpen ? 'sidebar--open' : ''}`}>
      {/* ── Logo ──────────────────────────────────── */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          {appMode === '0g-explorer' ? <Compass size={24} /> : <GraduationCap size={24} />}
        </div>
        <div className="sidebar-logo-text">
          <h1>{appMode === '0g-explorer' ? '0G Scout' : 'SolTutor'}</h1>
          <span>{appMode === '0g-explorer' ? 'Explore the 0G Ecosystem' : 'Learn Solidity with AI Memory'}</span>
        </div>
      </div>

      {/* ── Mode Toggle ────────────────────────────── */}
      <div className="mode-toggle">
        <button
          className={`mode-toggle-btn ${appMode === 'solidity' ? 'active' : ''}`}
          onClick={() => onModeChange('solidity')}
        >
          <GraduationCap size={14} />
          <span>Solidity</span>
        </button>
        <button
          className={`mode-toggle-btn ${appMode === '0g-explorer' ? 'active' : ''}`}
          onClick={() => onModeChange('0g-explorer')}
        >
          <Compass size={14} />
          <span>0G Explorer</span>
        </button>
      </div>

      {/* ── Topics ────────────────────────────────── */}
      <div className="sidebar-section">
        <button
          className="sidebar-section-header"
          onClick={() => setExpandedTopics(!expandedTopics)}
        >
          {expandedTopics ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          <span>{appMode === '0g-explorer' ? '0G Topics' : 'Lesson Topics'}</span>
        </button>

        {expandedTopics && (
          <ul className="sidebar-topic-list">
            {activeTopic.map((topic) => {
              const Icon = topic.icon;
              const isActive = currentTopic === topic.id;
              return (
                <li key={topic.id}>
                  <button
                    className={`sidebar-topic-btn ${isActive ? 'active' : ''} ${isLocked ? 'locked' : ''}`}
                    onClick={() => onTopicSelect(topic.id, topic.prompt)}
                    title={isLocked ? 'Subscribe to unlock' : topic.description}
                  >
                    <Icon size={16} className="sidebar-topic-icon" />
                    <div className="sidebar-topic-info">
                      <span className="sidebar-topic-label">{topic.label}</span>
                      <span className="sidebar-topic-desc">{topic.description}</span>
                    </div>
                    {isLocked && <Lock size={12} className="sidebar-lock-icon" />}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* ── Neural Link Status ────────────────────── */}
      <div className="sidebar-neural-link">
        <div className={`neural-card ${isPro ? 'pro' : 'free'}`}>
          <div className="neural-card-header">
            <div className="neural-icon">
              {isPro ? <Zap size={16} fill="currentColor" /> : <Flame size={16} />}
            </div>
            <div className="neural-title">
              <h4>Neural Link Status</h4>
              <span className={`status-label ${isPro ? 'pro' : 'limited'}`}>
                {isPro ? 'Subscribed' : !isConnected ? 'Not Connected' : 'Free Tier'}
              </span>
            </div>
          </div>

          {!isConnected ? (
            <div className="neural-free-content">
              <p className="neural-connect-msg">Connect wallet to begin</p>
            </div>
          ) : !isPro ? (
            <div className="neural-free-content">
              <div className="neural-progress-info">
                <span>Free Messages Used</span>
                <span>{Math.min(userMessageCount, freeLimit)}/{freeLimit}</span>
              </div>
              <div className="neural-mini-progress">
                <div
                  className="neural-mini-fill"
                  style={{ width: `${Math.min((userMessageCount / freeLimit) * 100, 100)}%` }}
                />
              </div>
              {isLocked && (
                <button className="upgrade-btn" onClick={onShowPaywall}>
                  <Sparkles size={14} />
                  <span>Subscribe - {SUBSCRIPTION_PRICE_DISPLAY}/mo</span>
                </button>
              )}
            </div>
          ) : (
            <div className="neural-pro-content">
              <div className="neural-pro-badge">
                <Shield size={12} />
                <span>MemoriaDA Secured</span>
              </div>
              {timeLeft && (
                <div className="neural-time-left">
                  <Clock size={12} />
                  <span>{formatTimeRemaining(timeLeft)}</span>
                </div>
              )}
              {walletAddress && (
                <p className="neural-wallet-addr">
                  {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Learning Progress ──────────────────────── */}
      <div className="sidebar-footer">
        <div className="sidebar-section-header compact">
          <span>Learning Progress</span>
          <span className="sidebar-stat">{Math.round((completedCount / totalTopics) * 100)}%</span>
        </div>
        <ProgressBar value={completedCount} max={totalTopics} />
        <div className="sidebar-stat-row">
          <Database size={12} />
          <span>{memoryCount} lessons stored on 0G</span>
        </div>
        <a
          href="https://memoriada.xyz"
          target="_blank"
          rel="noopener noreferrer"
          className="sidebar-powered-by"
        >
          <Box size={12} />
          <span>Powered by MemoriaDA</span>
          <ExternalLink size={10} />
        </a>
      </div>
    </aside>
  );
}
