import React from 'react';

export default function ProgressBar({ value = 0, max = 100, label = '' }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  
  return (
    <div className="progress-bar-container">
      {label && <span className="progress-bar-label">{label}</span>}
      <div className="progress-bar-track">
        <div
          className="progress-bar-fill"
          style={{ width: `${pct}%` }}
        >
          <div className="progress-bar-glow" />
        </div>
      </div>
      <span className="progress-bar-pct">{Math.round(pct)}%</span>
    </div>
  );
}
