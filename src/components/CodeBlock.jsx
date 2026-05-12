import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

/* ── Solidity Keyword Groups ─────────────────────────── */
const KEYWORDS = {
  type: /\b(address|bool|string|bytes\d*|int\d*|uint\d*|mapping|struct|enum)\b/g,
  keyword: /\b(function|contract|interface|library|modifier|event|error|constructor|receive|fallback|if|else|for|while|do|return|returns|require|assert|revert|emit|new|delete|using|is|abstract|virtual|override|external|internal|public|private|view|pure|payable|memory|storage|calldata|constant|immutable|indexed)\b/g,
  literal: /\b(true|false|msg\.sender|msg\.value|block\.timestamp|tx\.origin|this|super)\b/g,
  number: /\b(\d+(\.\d+)?)\b/g,
  comment: /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm,
  string: /(["'`])(?:(?=(\\?))\2.)*?\1/g,
  pragma: /(pragma\s+solidity\s+[^;]+;)/g,
  import_: /(import\s+.*?;)/g,
};

function highlightSolidity(code) {
  // Store replacements to avoid double-matching
  const tokens = [];
  let tokenized = code;

  // Extract comments first
  tokenized = tokenized.replace(KEYWORDS.comment, (match) => {
    const idx = tokens.length;
    tokens.push(`<span class="sol-comment">${escapeHtml(match)}</span>`);
    return `%%TOK_${idx}%%`;
  });

  // Extract strings
  tokenized = tokenized.replace(KEYWORDS.string, (match) => {
    const idx = tokens.length;
    tokens.push(`<span class="sol-string">${escapeHtml(match)}</span>`);
    return `%%TOK_${idx}%%`;
  });

  // Escape HTML in remaining code
  tokenized = escapeHtml(tokenized);

  // Apply keyword highlighting
  tokenized = tokenized.replace(KEYWORDS.pragma, '<span class="sol-pragma">$1</span>');
  tokenized = tokenized.replace(KEYWORDS.import_, '<span class="sol-pragma">$1</span>');
  tokenized = tokenized.replace(KEYWORDS.keyword, '<span class="sol-keyword">$1</span>');
  tokenized = tokenized.replace(KEYWORDS.type, '<span class="sol-type">$1</span>');
  tokenized = tokenized.replace(KEYWORDS.literal, '<span class="sol-literal">$1</span>');
  tokenized = tokenized.replace(KEYWORDS.number, '<span class="sol-number">$1</span>');

  // Restore tokens
  tokens.forEach((tok, i) => {
    tokenized = tokenized.replace(`%%TOK_${i}%%`, tok);
  });

  return tokenized;
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export default function CodeBlock({ code, language = 'solidity' }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const isSolidity = language === 'solidity' || language === 'sol';
  const highlighted = isSolidity ? highlightSolidity(code) : escapeHtml(code);

  return (
    <div className="code-block">
      <div className="code-block-header">
        <span className="code-block-lang">{language}</span>
        <button className="code-copy-btn" onClick={handleCopy} title="Copy code">
          {copied ? <Check size={14} /> : <Copy size={14} />}
          <span>{copied ? 'Copied!' : 'Copy'}</span>
        </button>
      </div>
      <pre className="code-block-pre">
        <code dangerouslySetInnerHTML={{ __html: highlighted }} />
      </pre>
    </div>
  );
}
