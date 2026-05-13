// ============================================================
// SolTutor - Wallet Provider (RainbowKit + 0G Mainnet)
// ============================================================

import '@rainbow-me/rainbowkit/styles.css';
import React from 'react';
import { getDefaultConfig, RainbowKitProvider, lightTheme } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

/* ── 0G Mainnet Chain Definition ─────────────────── */
export const zeroGMainnet = {
  id: 16661,
  name: '0G-Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'A0GI',
    symbol: 'A0GI',
  },
  rpcUrls: {
    default: { http: ['https://evmrpc.0g.ai'] },
  },
  blockExplorers: {
    default: { name: '0G Explorer', url: 'https://chainscan.0g.ai' },
  },
  testnet: false,
};

/* ── RainbowKit Config ────────────────────────────── */
const config = getDefaultConfig({
  appName: 'SolTutor',
  projectId: 'soltutor-demo-00000000', // WalletConnect project ID (placeholder for testnet)
  chains: [zeroGMainnet],
});

const queryClient = new QueryClient();

/* ── Provider Component ───────────────────────────── */
export default function WalletProvider({ children }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={lightTheme({
            accentColor: '#7C3AED',
            accentColorForeground: 'white',
            borderRadius: 'large',
            overlayBlur: 'small',
          })}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
