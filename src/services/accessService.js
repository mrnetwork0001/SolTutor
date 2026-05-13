// ============================================================
// SolTutor - Access Service (Frontend Contract Interaction)
// Reads subscription status from SolTutorAccess contract
// ============================================================

import { parseEther, formatEther } from 'viem';

/* ── Contract ABI (only the functions we need) ────── */
export const SOLTUTOR_ACCESS_ABI = [
  {
    name: 'subscribe',
    type: 'function',
    stateMutability: 'payable',
    inputs: [],
    outputs: [],
  },
  {
    name: 'isSubscribed',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'timeRemaining',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'subscriptionPrice',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'subscriptionExpiry',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
];

/* ── Contract Address ─────────────────────────────── */
// This will be set after deployment. Update with actual deployed address.
export const SOLTUTOR_ACCESS_ADDRESS = '0x3D078d15B4dF4Bc3d5D048444A82875BE511011d';

/* ── Subscription Price (matches contract default) ── */
export const SUBSCRIPTION_PRICE = parseEther('1'); // 1 A0GI
export const SUBSCRIPTION_PRICE_DISPLAY = '1 A0GI';
export const SUBSCRIPTION_DURATION_DISPLAY = '30 days';

/**
 * Format seconds remaining into a human-readable string.
 */
export function formatTimeRemaining(seconds) {
  const s = Number(seconds);
  if (s <= 0) return 'Expired';
  const days = Math.floor(s / 86400);
  const hours = Math.floor((s % 86400) / 3600);
  if (days > 0) return `${days}d ${hours}h remaining`;
  const mins = Math.floor((s % 3600) / 60);
  return `${hours}h ${mins}m remaining`;
}
