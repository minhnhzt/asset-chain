'use client';

import React, { useEffect, useState } from 'react';
import {
  useConnection,
  useWallet,
  WalletProvider,
} from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

/**
 * WalletConnectButton Component
 * Allows users to connect/disconnect Phantom wallet
 * 
 * Usage:
 * <WalletConnectButton />
 */
export const WalletConnectButton: React.FC = () => {
  const { publicKey, wallet, connected } = useWallet();
  const { connection } = useConnection();
  const [balance, setBalance] = useState<number>(0);

  // Fetch wallet balance when connected
  useEffect(() => {
    if (connected && publicKey) {
      connection
        .getBalance(publicKey)
        .then((balance) => setBalance(balance / 1e9)) // Convert lamports to SOL
        .catch((err) => console.error('Error fetching balance:', err));
    }
  }, [connected, publicKey, connection]);

  return (
    <div className="flex items-center gap-4">
      <WalletMultiButton className="btn btn-primary" />
      
      {connected && publicKey && (
        <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="text-sm">
            <p className="font-semibold text-gray-700">
              {wallet?.adapter.name || 'Wallet'}
            </p>
            <p className="text-xs text-gray-600">
              {publicKey.toString().slice(0, 8)}...{publicKey.toString().slice(-4)}
            </p>
            <p className="text-xs text-green-600 font-medium">
              {balance.toFixed(4)} SOL
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * WalletConnectProvider Wrapper
 * Must wrap the component tree that uses wallet functionality
 */
export const WalletConnectProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <>
      {/* Wallet adapter styles */}
      <style>{`
        .wallet-adapter-button {
          @apply px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors;
        }
      `}</style>
      {children}
    </>
  );
};
