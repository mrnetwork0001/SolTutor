import React, { useState, useRef, useEffect } from 'react';
import {
  Send, Brain, CheckCircle2, ExternalLink, Loader2,
  Bot, User, Sparkles, AlertCircle, Wallet, Lock
} from 'lucide-react';
import CodeBlock from './CodeBlock';

/* ── Markdown-like Parser ────────────────────────────── */
function parseMessageContent(text) {
  const parts = [];
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(text)) !== null) {
    // Text before code block
    if (match.index > lastIndex) {
      parts.push({ type: 'text', content: text.slice(lastIndex, match.index) });
    }
    parts.push({ type: 'code', language: match[1] || 'solidity', content: match[2].trim() });
    lastIndex = match.index + match[0].length;
  }

  // Remaining text
  if (lastIndex < text.length) {
    parts.push({ type: 'text', content: text.slice(lastIndex) });
  }

  return parts;
}

/* ── Inline Markdown Renderer ────────────────────────── */
function renderInlineMarkdown(text) {
  // Split by lines for paragraph handling
  const lines = text.split('\n');
  const elements = [];

  lines.forEach((line, lineIdx) => {
    if (lineIdx > 0) elements.push(<br key={`br-${lineIdx}`} />);

    // Headers
    if (line.startsWith('### ')) {
      elements.push(<h4 key={`h-${lineIdx}`} className="msg-heading">{line.slice(4)}</h4>);
      return;
    }
    if (line.startsWith('## ')) {
      elements.push(<h3 key={`h-${lineIdx}`} className="msg-heading">{line.slice(3)}</h3>);
      return;
    }
    if (line.startsWith('# ')) {
      elements.push(<h2 key={`h-${lineIdx}`} className="msg-heading">{line.slice(2)}</h2>);
      return;
    }

    // List items
    if (line.match(/^[-*]\s/)) {
      elements.push(
        <div key={`li-${lineIdx}`} className="msg-list-item">
          <span className="msg-bullet">•</span>
          <span>{formatInline(line.slice(2))}</span>
        </div>
      );
      return;
    }

    // Numbered list
    const numMatch = line.match(/^(\d+)\.\s/);
    if (numMatch) {
      elements.push(
        <div key={`li-${lineIdx}`} className="msg-list-item">
          <span className="msg-number">{numMatch[1]}.</span>
          <span>{formatInline(line.slice(numMatch[0].length))}</span>
        </div>
      );
      return;
    }

    // Regular text
    if (line.trim()) {
      elements.push(<span key={`t-${lineIdx}`}>{formatInline(line)}</span>);
    }
  });

  return elements;
}

function formatInline(text) {
  // Bold
  const parts = [];
  const boldRegex = /\*\*(.*?)\*\*/g;
  let lastIdx = 0;
  let m;

  while ((m = boldRegex.exec(text)) !== null) {
    if (m.index > lastIdx) {
      parts.push(formatInlineCode(text.slice(lastIdx, m.index)));
    }
    parts.push(<strong key={`b-${m.index}`}>{m[1]}</strong>);
    lastIdx = m.index + m[0].length;
  }
  if (lastIdx < text.length) {
    parts.push(formatInlineCode(text.slice(lastIdx)));
  }

  return parts.length > 0 ? parts : text;
}

function formatInlineCode(text) {
  const parts = [];
  const codeRegex = /`([^`]+)`/g;
  let lastIdx = 0;
  let m;

  while ((m = codeRegex.exec(text)) !== null) {
    if (m.index > lastIdx) {
      parts.push(text.slice(lastIdx, m.index));
    }
    parts.push(<code key={`ic-${m.index}`} className="inline-code">{m[1]}</code>);
    lastIdx = m.index + m[0].length;
  }
  if (lastIdx < text.length) {
    parts.push(text.slice(lastIdx));
  }

  return parts.length > 0 ? parts : text;
}

/* ── Quiz Option Detector ────────────────────────────── */
function detectQuizOptions(text) {
  const optionRegex = /^([A-D])\)\s+(.+)$/gm;
  const options = [];
  let m;
  while ((m = optionRegex.exec(text)) !== null) {
    options.push({ letter: m[1], text: m[2].trim() });
  }
  return options.length >= 2 ? options : [];
}

/* ── Message Component ───────────────────────────────── */
function Message({ message, onQuizAnswer }) {
  const { role, content, memoryCount: recalledCount, anchor } = message;
  const isBot = role === 'assistant';
  const parts = parseMessageContent(content);
  const quizOptions = isBot ? detectQuizOptions(content) : [];

  return (
    <div className={`message ${isBot ? 'message-bot' : 'message-user'}`}>
      <div className="message-avatar">
        {isBot ? (
          <div className="avatar avatar-bot"><Bot size={18} /></div>
        ) : (
          <div className="avatar avatar-user"><User size={18} /></div>
        )}
      </div>

      <div className="message-body">
        <div className="message-sender">
          {isBot ? 'SolTutor' : 'You'}
        </div>

        <div className="message-content">
          {parts.map((part, i) =>
            part.type === 'code' ? (
              <CodeBlock key={i} code={part.content} language={part.language} />
            ) : (
              <div key={i} className="message-text">
                {renderInlineMarkdown(part.content)}
              </div>
            )
          )}
        </div>

        {/* Quiz Options */}
        {quizOptions.length > 0 && (
          <div className="quiz-options">
            {quizOptions.map((opt) => (
              <button
                key={opt.letter}
                className="quiz-option-btn"
                onClick={() => onQuizAnswer(`${opt.letter}) ${opt.text}`)}
              >
                <span className="quiz-letter">{opt.letter}</span>
                <span>{opt.text}</span>
              </button>
            ))}
          </div>
        )}

        {/* Memory Badge */}
        {isBot && recalledCount > 0 && (
          <div className="memory-badge">
            <Brain size={14} />
            <span>{recalledCount} past lesson{recalledCount !== 1 ? 's' : ''} recalled</span>
          </div>
        )}

        {/* Chain Anchor */}
        {isBot && anchor && (
          <div className="chain-anchor">
            <CheckCircle2 size={14} />
            <span>Anchored on 0G Chain - {anchor.blockLabel}</span>
            <a href={anchor.explorerUrl} target="_blank" rel="noopener noreferrer" className="anchor-link">
              View in Explorer <ExternalLink size={12} />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── ChatPanel ───────────────────────────────────────── */
export default function ChatPanel({
  messages,
  onSend,
  loading,
  onQuizAnswer,
  isLocked,
  isConnected,
  appMode,
}) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;
    onSend(text);
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="chat-panel">
      {/* ── Messages Area ─────────────────────────── */}
      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="chat-welcome">
            <div className="chat-welcome-icon">
              <Sparkles size={48} />
            </div>
            <h2>{appMode === '0g-explorer' ? 'Welcome to 0G Scout' : 'Welcome to SolTutor'}</h2>
            <p>{appMode === '0g-explorer'
              ? 'Your AI guide to the 0G ecosystem - with permanent memory.'
              : 'Your AI-powered Solidity & Web3 tutor with permanent memory.'
            }</p>
            {isConnected ? (
              <>
                <p className="chat-welcome-hint">
                  {appMode === '0g-explorer'
                    ? 'Select a topic from the sidebar or ask anything about the 0G ecosystem.'
                    : 'Select a topic from the sidebar or ask any question about smart contract development.'
                  }
                </p>
                <div className="chat-welcome-suggestions">
                  {appMode === '0g-explorer' ? (
                    <>
                      <button onClick={() => onSend('What is 0G and why should I care?')}>
                        What is 0G?
                      </button>
                      <button onClick={() => onSend('How do I set up my wallet for 0G Galileo testnet?')}>
                        Wallet setup
                      </button>
                      <button onClick={() => onSend('How does 0G Storage work?')}>
                        0G Storage
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => onSend('What is Solidity and why is it important?')}>
                        What is Solidity?
                      </button>
                      <button onClick={() => onSend('Show me a simple smart contract example')}>
                        Simple smart contract
                      </button>
                      <button onClick={() => onSend('Explain how mappings work in Solidity')}>
                        Solidity mappings
                      </button>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="chat-connect-prompt">
                <Wallet size={20} />
                <p>Connect your wallet to start {appMode === '0g-explorer' ? 'exploring' : 'learning'}</p>
                <span className="chat-connect-hint">Use the connect button in the top-right corner</span>
              </div>
            )}
          </div>
        )}

        {messages.map((msg, i) => (
          <Message
            key={i}
            message={msg}
            onQuizAnswer={onQuizAnswer}
          />
        ))}

        {loading && (
          <div className="message message-bot">
            <div className="message-avatar">
              <div className="avatar avatar-bot"><Bot size={18} /></div>
            </div>
            <div className="message-body">
              <div className="message-sender">{appMode === '0g-explorer' ? '0G Scout' : 'SolTutor'}</div>
              <div className="message-thinking">
                <Loader2 size={16} className="spin" />
                <span>Thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Input Area ────────────────────────────── */}
      {!isConnected ? (
        <div className="chat-input-area">
          <div className="chat-input-locked">
            <Lock size={16} />
            <span>Connect wallet to start chatting</span>
          </div>
        </div>
      ) : (
        <form className="chat-input-area" onSubmit={handleSubmit}>
          <div className="chat-input-wrapper">
            <textarea
              ref={inputRef}
              className="chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isLocked ? 'Subscribe to continue...' : appMode === '0g-explorer' ? 'Ask about the 0G ecosystem...' : 'Ask a question about Solidity...'}
              rows={1}
              disabled={loading || isLocked}
            />
            <button
              type="submit"
              className="chat-send-btn"
              disabled={!input.trim() || loading || isLocked}
              title="Send message"
            >
              <Send size={18} />
            </button>
          </div>
          <span className="chat-input-hint">
            Press Enter to send · Shift+Enter for new line
          </span>
        </form>
      )}
    </div>
  );
}
