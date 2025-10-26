'use client';

import React, { useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { SOLANA_CONFIG } from '@/app/config/solana';

// Import wallet adapter CSS
import '@solana/wallet-adapter-react-ui/styles.css';

/**
 * Solana Wallet Provider Component
 * 
 * Provides Solana wallet connection context to the entire app.
 * Supports Phantom wallet with automatic detection.
 * 
 * Usage:
 * Wrap your app or specific pages with this provider to enable wallet functionality.
 */
export function SolanaWalletProvider({ children }: { children: React.ReactNode }) {
  // Get RPC endpoint from config
  const endpoint = useMemo(() => SOLANA_CONFIG.rpcUrl, []);

  // Configure supported wallets
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      // Add more wallet adapters here if needed
      // new SolflareWalletAdapter(),
      // new TorusWalletAdapter(),
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
