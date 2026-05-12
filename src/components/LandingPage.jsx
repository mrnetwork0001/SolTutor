import React, { useEffect, useState } from 'react';
import {
  GraduationCap, ArrowRight, Brain, Shield, Zap, Database,
  Code2, BookOpen, ExternalLink, ChevronRight, Sparkles, Box,
  Compass, Globe, Layers, Cpu
} from 'lucide-react';

/* -- Animated floating code snippets -- */
const CODE_SNIPPETS = [
  'mapping(address => uint256)',
  'function transfer()',
  'event Transfer()',
  'require(msg.sender == owner)',
  'modifier onlyOwner()',
  'pragma solidity ^0.8.0',
  'contract MyToken is ERC20',
  '0G Storage - Blob Upload',
  'bytes32 public merkleRoot',
  'indexer.upload(zgBlob)',
  'Chain ID: 16602',
  'delegatecall(target, data)',
];

function FloatingCode() {
  const [snippets] = useState(() =>
    CODE_SNIPPETS.map((text, i) => ({
      text,
      x: Math.random() * 80 + 10,
      y: Math.random() * 80 + 10,
      delay: i * 0.7,
      duration: 12 + Math.random() * 8,
      opacity: 0.06 + Math.random() * 0.08,
      size: 11 + Math.random() * 3,
    }))
  );

  return (
    <div className="landing-floating-code" aria-hidden="true">
      {snippets.map((s, i) => (
        <span
          key={i}
          className="floating-snippet"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.duration}s`,
            opacity: s.opacity,
            fontSize: `${s.size}px`,
          }}
        >
          {s.text}
        </span>
      ))}
    </div>
  );
}

/* -- Feature Card -- */
function FeatureCard({ icon: Icon, title, description, accent }) {
  return (
    <div className="landing-feature-card">
      <div className={`feature-icon feature-icon--${accent}`}>
        <Icon size={22} />
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}

/* -- Mode Card -- */
function ModeCard({ icon: Icon, title, subtitle, items, accent, tag }) {
  return (
    <div className={`landing-mode-card landing-mode-card--${accent}`}>
      <div className="mode-card-header">
        <div className={`mode-card-icon mode-card-icon--${accent}`}>
          <Icon size={24} />
        </div>
        <div>
          <h3>{title}</h3>
          <span className="mode-card-tag">{tag}</span>
        </div>
      </div>
      <p className="mode-card-subtitle">{subtitle}</p>
      <ul className="mode-card-list">
        {items.map((item, i) => (
          <li key={i}>
            <ChevronRight size={12} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* -- Hero Demo (auto-cycling illustration) -- */
function HeroDemo() {
  const [mode, setMode] = useState('solidity'); // 'solidity' | 'scout'
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setMode(m => m === 'solidity' ? 'scout' : 'solidity');
        setFading(false);
      }, 400);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const isSol = mode === 'solidity';

  return (
    <div className="hero-illustration" aria-hidden="true">
      <div className="hero-ill-scene">
        <div className="hero-orb hero-orb--brain"><Brain size={22} /></div>
        <div className="hero-orb hero-orb--shield"><Shield size={20} /></div>
        <div className="hero-orb hero-orb--zap"><Zap size={18} /></div>
        <div className="hero-orb hero-orb--db"><Database size={18} /></div>

        <div className={`hero-mock-chat ${fading ? 'hero-mock-fading' : ''}`}>
          <div className={`hero-mock-header ${isSol ? '' : 'hero-mock-header--scout'}`}>
            <div className={`hero-mock-dot ${isSol ? 'hero-mock-dot--purple' : 'hero-mock-dot--cyan'}`} />
            <div className={`hero-mock-dot ${isSol ? 'hero-mock-dot--cyan' : 'hero-mock-dot--purple'}`} />
            <span className="hero-mock-label">{isSol ? 'SolTutor Chat' : '0G Scout Chat'}</span>
          </div>

          <div className="hero-mock-msg hero-mock-msg--user">
            <span className={isSol ? '' : 'hero-mock-msg--scout-bubble'}>
              {isSol ? 'Teach me about reentrancy attacks' : 'What is 0G and why should I care?'}
            </span>
          </div>

          <div className="hero-mock-msg hero-mock-msg--bot">
            {isSol ? (
              <div className="hero-mock-code">
                <span className="hmc-kw">function</span>{' '}<span className="hmc-fn">withdraw</span>() {'{'}<br/>
                &nbsp;&nbsp;<span className="hmc-kw">require</span>(balances[msg.sender] {'>'} 0);<br/>
                &nbsp;&nbsp;msg.sender.<span className="hmc-fn">call</span>{'{'}value: bal{'}'}(&quot;&quot;);<br/>
                {'}'}
              </div>
            ) : (
              <div className="hero-mock-prose">
                <strong>0G</strong> is the first modular AI chain - a decentralized infrastructure
                for <span className="hmc-highlight">data availability</span>, <span className="hmc-highlight">storage</span>, and <span className="hmc-highlight">compute</span>.
                Think of it as the <strong>AWS of Web3</strong>, purpose-built for AI workloads.
              </div>
            )}
          </div>

          <div className="hero-mock-anchor">
            <span className="hero-mock-anchor-dot" />
            {isSol ? 'Memory stored via MemoriaDA' : 'Powered by 0G decentralized infra'}
          </div>
        </div>

        <div className="hero-mock-toggle">
          <span className={isSol ? 'hero-mock-toggle-active' : 'hero-mock-toggle-inactive'}>
            <GraduationCap size={12} /> Solidity
          </span>
          <span className={isSol ? 'hero-mock-toggle-inactive' : 'hero-mock-toggle-active hero-mock-toggle-active--scout'}>
            <Compass size={12} /> 0G Scout
          </span>
        </div>
      </div>
    </div>
  );
}

/* -- Landing Page -- */
export default function LandingPage({ onLaunch }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  return (
    <div className={`landing ${visible ? 'landing--visible' : ''}`}>
      {/* Clay Background Blobs */}
      <div className="clay-blobs" aria-hidden="true">
        <div className="clay-blob clay-blob--violet" />
        <div className="clay-blob clay-blob--pink" />
        <div className="clay-blob clay-blob--blue" />
      </div>
      <FloatingCode />

      {/* Nav */}
      <nav className="landing-nav">
        <div className="landing-nav-brand">
          <div className="landing-nav-logo">
            <GraduationCap size={20} />
          </div>
          <span className="landing-nav-name">SolTutor</span>
        </div>
        <div className="landing-nav-links">
          <a href="https://memoriada.xyz" target="_blank" rel="noopener noreferrer" className="landing-nav-link">
            MemoriaDA <ExternalLink size={12} />
          </a>
          <a href="https://0g.ai" target="_blank" rel="noopener noreferrer" className="landing-nav-link">
            0G Labs <ExternalLink size={12} />
          </a>
          <button className="landing-nav-cta" onClick={onLaunch}>
            Launch App <ArrowRight size={14} />
          </button>
        </div>
      </nav>

      {/* Hero (Two-Column) */}
      <section className="landing-hero">
        <div className="hero-grid">
          {/* Left: Text Content */}
          <div className="hero-text">
            <div className="landing-hero-badge">
              <Sparkles size={14} />
              <span>Two AI Agents &middot; One Decentralized Memory</span>
            </div>
            <h1 className="landing-hero-title">
              Learn <span className="gradient-text">Solidity</span> &amp; Explore
              the <span className="gradient-text-cyan">0G Ecosystem</span>
            </h1>
            <p className="landing-hero-subtitle">
              An AI-powered platform with two modes - a <strong>Solidity tutor</strong> that teaches smart contracts through interactive lessons,
              and a <strong>0G Scout</strong> that onboards you to the 0G ecosystem with verified docs.
              Every conversation is permanently stored on <strong>0G Chain</strong> via <strong>MemoriaDA</strong>.
            </p>
            <div className="landing-hero-actions">
              <button className="landing-btn-primary" onClick={onLaunch}>
                <Code2 size={18} />
                <span>Launch App</span>
                <ArrowRight size={16} />
              </button>
              <a href="https://docs.0g.ai" target="_blank" rel="noopener noreferrer" className="landing-btn-secondary">
                <BookOpen size={16} />
                <span>0G Docs</span>
              </a>
            </div>
            <div className="landing-powered-row">
              <div className="landing-powered-badge">
                <Box size={14} />
                <span>Powered by</span>
                <strong>MemoriaDA</strong>
                <span className="powered-divider">&middot;</span>
                <span>on</span>
                <strong>0G Labs Chain</strong>
              </div>
            </div>
          </div>

          {/* Right: Dynamic Animated Illustration */}
          <HeroDemo />
        </div>
      </section>

      {/* Dual Mode Showcase */}
      <section className="landing-modes">
        <h2 className="landing-section-title">Two Modes, One Brain</h2>
        <p className="landing-section-desc">
          Toggle between modes seamlessly. Memory is shared - your 0G Scout remembers what your Solidity tutor taught you.
        </p>
        <div className="landing-modes-grid">
          <ModeCard
            icon={GraduationCap}
            title="SolTutor"
            tag="Solidity Mode"
            subtitle="Master smart contract development from basics to advanced DeFi patterns."
            accent="purple"
            items={[
              'Variables, Types & Functions',
              'Storage, Memory & Gas',
              'ERC-20, ERC-721 Standards',
              'Security Patterns & Reentrancy',
              'Proxy Patterns & DeFi',
            ]}
          />
          <ModeCard
            icon={Compass}
            title="0G Scout"
            tag="Explorer Mode"
            subtitle="Navigate the 0G ecosystem with a verified knowledge base from docs.0g.ai."
            accent="cyan"
            items={[
              '0G Chain, Storage, DA & Compute',
              'Wallet Setup & Testnet Faucets',
              'Deploy Contracts on Galileo',
              'Staking, Validators & Nodes',
              'MemoriaDA & Ecosystem',
            ]}
          />
        </div>
      </section>

      {/* Features */}
      <section className="landing-features">
        <div className="landing-features-grid">
          <FeatureCard
            icon={Brain}
            title="Persistent AI Memory"
            description="Every conversation is stored on 0G decentralized storage. Both agents recall past sessions and build on what you've learned."
            accent="purple"
          />
          <FeatureCard
            icon={Shield}
            title="Onchain Verification"
            description="Learning progress is cryptographically anchored on 0G Chain via MemoriaDA. Every memory root is verifiable onchain."
            accent="green"
          />
          <FeatureCard
            icon={Globe}
            title="Verified 0G Knowledge"
            description="0G Scout answers from a hardcoded knowledge base scraped from docs.0g.ai - correct RPCs, Chain IDs, contract addresses. No hallucination."
            accent="cyan"
          />
          <FeatureCard
            icon={Database}
            title="20 Curated Topics"
            description="10 Solidity tracks (basics to DeFi) and 10 0G topics (chain to ecosystem) - structured paths with AI-generated quizzes."
            accent="orange"
          />
        </div>
      </section>

      {/* How It Works */}
      <section className="landing-how">
        <h2 className="landing-section-title">How It Works</h2>
        <div className="landing-steps">
          <div className="landing-step">
            <div className="step-number">1</div>
            <h4>Connect Wallet</h4>
            <p>Connect with MetaMask or WalletConnect. Get 3 free messages per wallet to try before subscribing.</p>
          </div>
          <div className="landing-step-arrow"><ChevronRight size={20} /></div>
          <div className="landing-step">
            <div className="step-number">2</div>
            <h4>Pick Your Mode</h4>
            <p>Toggle between SolTutor (learn Solidity) and 0G Scout (explore the ecosystem). Ask anything or pick a curated topic.</p>
          </div>
          <div className="landing-step-arrow"><ChevronRight size={20} /></div>
          <div className="landing-step">
            <div className="step-number">3</div>
            <h4>Memory Anchored</h4>
            <p>Every conversation is uploaded to 0G Storage and its Merkle root is anchored onchain - permanent, verifiable memory.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="landing-cta">
        <div className="landing-cta-card">
          <h2>Ready to Learn &amp; Explore?</h2>
          <p>Master Solidity and navigate the 0G ecosystem with AI that remembers everything.</p>
          <button className="landing-btn-primary landing-btn-large" onClick={onLaunch}>
            <Sparkles size={20} />
            <span>Launch App</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <div className="landing-footer-brand">
            <GraduationCap size={16} />
            <span>SolTutor</span>
            <span className="landing-footer-sep">+</span>
            <Compass size={14} />
            <span>0G Scout</span>
            <span className="landing-footer-sep">-</span>
            <span className="landing-footer-tagline">AI with Permanent Memory on 0G</span>
          </div>
          <div className="landing-footer-links">
            <a href="https://memoriada.xyz" target="_blank" rel="noopener noreferrer">MemoriaDA Protocol</a>
            <a href="https://0g.ai" target="_blank" rel="noopener noreferrer">0G Labs</a>
            <a href="https://docs.0g.ai" target="_blank" rel="noopener noreferrer">0G Docs</a>
            <a href="https://chainscan-galileo.0g.ai" target="_blank" rel="noopener noreferrer">Chain Explorer</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
