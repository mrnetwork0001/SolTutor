// ============================================================
// SolTutor - Paywall Modal
// Full-screen lock when free memory limit reached.
// Two-step flow: Connect Wallet → Pay to Subscribe
// ============================================================

import React, { useState, useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import {
  Brain, Lock, Zap, Shield, Sparkles, ExternalLink,
  Wallet, ArrowRight, CheckCircle2, AlertCircle, Loader2
} from 'lucide-react';
import {
  SOLTUTOR_ACCESS_ABI,
  SOLTUTOR_ACCESS_ADDRESS,
  SUBSCRIPTION_PRICE,
  SUBSCRIPTION_PRICE_DISPLAY,
  SUBSCRIPTION_DURATION_DISPLAY,
} from '../services/accessService';

export default function PaywallModal({ memoryCount, freeLimit, onUpgradeComplete }) {
  const { address, isConnected } = useAccount();
  const [step, setStep] = useState('pay'); // Wallet already connected at this point
  const [errorMsg, setErrorMsg] = useState('');
  const [checking, setChecking] = useState(false);

  // ── Check existing subscription ─────────────────
  const { data: isAlreadySubscribed, refetch: recheckSubscription } = useReadContract({
    address: SOLTUTOR_ACCESS_ADDRESS,
    abi: SOLTUTOR_ACCESS_ABI,
    functionName: 'isSubscribed',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
      refetchInterval: 5000,
      refetchOnMount: 'always',
    },
  });

  // ── Write contract (subscribe) ──────────────────
  const {
    writeContract,
    data: txHash,
    isPending: isSending,
    error: writeError,
    reset: resetWrite,
  } = useWriteContract();

  // ── Wait for transaction confirmation ───────────
  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: confirmError,
  } = useWaitForTransactionReceipt({ hash: txHash });

  // ── Auto-advance steps ──────────────────────────
  useEffect(() => {
    if (isConnected && step === 'connect') {
      setStep('pay');
    }
  }, [isConnected, step]);

  // If already subscribed on wallet connect, unlock immediately
  useEffect(() => {
    if (isAlreadySubscribed === true) {
      console.log('[PaywallModal] Existing subscription detected! Unlocking.');
      onUpgradeComplete();
    }
  }, [isAlreadySubscribed, onUpgradeComplete]);

  // ── Manual re-check for returning subscribers ───
  const handleRecheck = async () => {
    setChecking(true);
    try {
      const result = await recheckSubscription();
      if (result.data === true) {
        onUpgradeComplete();
      } else {
        setErrorMsg('No active subscription found for this wallet.');
        setTimeout(() => setErrorMsg(''), 3000);
      }
    } catch {
      setErrorMsg('Failed to check subscription. Try again.');
      setTimeout(() => setErrorMsg(''), 3000);
    } finally {
      setChecking(false);
    }
  };

  // Transaction sent → confirming
  useEffect(() => {
    if (txHash && !isConfirmed) {
      setStep('confirming');
    }
  }, [txHash, isConfirmed]);

  // Transaction confirmed → success
  useEffect(() => {
    if (isConfirmed) {
      setStep('success');
      // Give user a moment to see success, then unlock
      setTimeout(() => {
        onUpgradeComplete();
      }, 2000);
    }
  }, [isConfirmed, onUpgradeComplete]);

  // Handle errors
  useEffect(() => {
    if (writeError) {
      setStep('error');
      setErrorMsg(writeError.shortMessage || writeError.message || 'Transaction failed');
    }
    if (confirmError) {
      setStep('error');
      setErrorMsg(confirmError.shortMessage || confirmError.message || 'Confirmation failed');
    }
  }, [writeError, confirmError]);

  // ── Handle Subscribe Click ──────────────────────
  const handleSubscribe = () => {
    setErrorMsg('');
    resetWrite();
    writeContract({
      address: SOLTUTOR_ACCESS_ADDRESS,
      abi: SOLTUTOR_ACCESS_ABI,
      functionName: 'subscribe',
      value: SUBSCRIPTION_PRICE,
    });
  };

  const handleRetry = () => {
    setStep('pay');
    setErrorMsg('');
    resetWrite();
  };

  return (
    <div className="paywall-overlay">
      <div className="paywall-modal">
        {/* ── Glowing top accent ──────────────── */}
        <div className="paywall-accent" />

        {/* ── Header ──────────────────────────── */}
        <div className="paywall-header">
          <div className="paywall-icon">
            <Brain size={32} />
          </div>
          <h2>Neural Link Required</h2>
          <p>
            You've used all <strong>{freeLimit}</strong> free memory slots.
            Subscribe to unlock <strong>permanent neural recall</strong> powered by MemoriaDA.
          </p>
        </div>

        {/* ── Memory Usage Bar ────────────────── */}
        <div className="paywall-usage">
          <div className="paywall-usage-info">
            <span>Memory Usage</span>
            <span className="paywall-usage-count">{memoryCount}/{freeLimit} (Full)</span>
          </div>
          <div className="paywall-usage-bar">
            <div className="paywall-usage-fill" style={{ width: '100%' }} />
          </div>
        </div>

        {/* ── Step Content ────────────────────── */}
        <div className="paywall-content">
          {/* Step 1: Connect Wallet */}
          {step === 'connect' && (
            <div className="paywall-step">
              <div className="paywall-step-header">
                <div className="paywall-step-num">1</div>
                <span>Connect Your Wallet</span>
              </div>
              <p className="paywall-step-desc">
                Connect to 0G Galileo Testnet to proceed with subscription.
              </p>
              <div className="paywall-connect-wrapper">
                <ConnectButton />
              </div>
            </div>
          )}

          {/* Step 2: Pay */}
          {step === 'pay' && (
            <div className="paywall-step">
              <div className="paywall-step-header">
                <div className="paywall-step-num active">2</div>
                <span>Subscribe to Neural Link</span>
              </div>
              <div className="paywall-price-card">
                <div className="paywall-price-top">
                  <Zap size={18} />
                  <span>Neural Link Pro</span>
                </div>
                <div className="paywall-price-amount">
                  <span className="paywall-price-value">{SUBSCRIPTION_PRICE_DISPLAY}</span>
                  <span className="paywall-price-period">/ {SUBSCRIPTION_DURATION_DISPLAY}</span>
                </div>
                <ul className="paywall-features">
                  <li><CheckCircle2 size={14} /> Unlimited permanent memory recall</li>
                  <li><CheckCircle2 size={14} /> Onchain verified subscription</li>
                  <li><CheckCircle2 size={14} /> MemoriaDA-secured learning data</li>
                  <li><CheckCircle2 size={14} /> Stackable renewals</li>
                </ul>
              </div>
              <button
                className="paywall-subscribe-btn"
                onClick={handleSubscribe}
                disabled={isSending}
              >
                {isSending ? (
                  <>
                    <Loader2 size={16} className="spin" />
                    <span>Sending transaction...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    <span>Subscribe - {SUBSCRIPTION_PRICE_DISPLAY}</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
              <p className="paywall-wallet-info">
                <Wallet size={12} />
                <span>Connected: {address?.slice(0, 6)}...{address?.slice(-4)}</span>
              </p>
              <button
                className="paywall-recheck-btn"
                onClick={handleRecheck}
                disabled={checking}
              >
                {checking ? 'Checking...' : 'Already subscribed? Verify →'}
              </button>
              {errorMsg && step === 'pay' && (
                <p className="paywall-inline-error">{errorMsg}</p>
              )}
            </div>
          )}

          {/* Step 3: Confirming */}
          {step === 'confirming' && (
            <div className="paywall-step paywall-step-center">
              <div className="paywall-confirming-icon">
                <Loader2 size={32} className="spin" />
              </div>
              <h3>Linking Neural Pathways...</h3>
              <p>Confirming transaction on 0G Chain</p>
              {txHash && (
                <a
                  href={`https://chainscan-galileo.0g.ai/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="paywall-tx-link"
                >
                  View Transaction <ExternalLink size={12} />
                </a>
              )}
            </div>
          )}

          {/* Step 4: Success */}
          {step === 'success' && (
            <div className="paywall-step paywall-step-center">
              <div className="paywall-success-icon">
                <Shield size={32} />
              </div>
              <h3>Neural Link Activated!</h3>
              <p>Your subscription is now anchored on 0G Chain.</p>
              <p className="paywall-success-sub">Unlocking permanent memory recall...</p>
            </div>
          )}

          {/* Error State */}
          {step === 'error' && (
            <div className="paywall-step paywall-step-center">
              <div className="paywall-error-icon">
                <AlertCircle size={32} />
              </div>
              <h3>Transaction Failed</h3>
              <p className="paywall-error-msg">{errorMsg}</p>
              <button className="paywall-retry-btn" onClick={handleRetry}>
                Try Again
              </button>
            </div>
          )}
        </div>

        {/* ── Footer ──────────────────────────── */}
        <div className="paywall-footer">
          <span>Powered by</span>
          <strong>MemoriaDA</strong>
          <span>on</span>
          <strong>0G Labs Chain</strong>
        </div>
      </div>
    </div>
  );
}
