'use client';

import React, { useEffect, useState } from 'react';
import {
  useConnection,
  useWallet,
} from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

/**
 * WalletConnectButton Component
 * Displays wallet connection status with balance
 * 
 * Features:
 * - Connect/disconnect wallet
 * - Show wallet name and address
 * - Display SOL balance
 * - Responsive design for dark theme
 */
export const WalletConnectButton: React.FC = () => {
  const { publicKey, wallet, connected } = useWallet();
  const { connection } = useConnection();
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch wallet balance when connected
  useEffect(() => {
    if (connected && publicKey) {
      setLoading(true);
      connection
        .getBalance(publicKey)
        .then((balance) => {
          setBalance(balance / 1e9); // Convert lamports to SOL
          setLoading(false);
        })
        .catch((err) => {
          console.error('Error fetching balance:', err);
          setLoading(false);
        });
    } else {
      setBalance(null);
    }
  }, [connected, publicKey, connection]);

  return (
    <div className="flex items-center gap-4">
      {connected && publicKey && balance !== null && (
        <div className="hidden md:flex items-center gap-3 px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center text-sm font-bold text-slate-900">
            {wallet?.adapter.icon ? (
              <img 
                src={wallet.adapter.icon} 
                alt={wallet.adapter.name}
                className="w-6 h-6 rounded-full"
              />
            ) : (
              '👛'
            )}
          </div>
          <div className="text-sm">
            <div className="text-white font-medium">
              {publicKey.toString().slice(0, 4)}...{publicKey.toString().slice(-4)}
            </div>
            <div className="text-slate-400 text-xs flex items-center gap-1">
              {loading ? (
                '⏳ Loading...'
              ) : (
                <>
                  <span className="text-green-400 font-medium">{balance.toFixed(4)}</span>
                  <span>SOL</span>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      
      <WalletMultiButton 
        style={{
          backgroundColor: connected ? 'rgb(30, 41, 59)' : 'rgb(37, 99, 235)',
          color: 'white',
          borderRadius: '0.5rem',
          padding: '0.5rem 1rem',
          fontSize: '0.875rem',
          fontWeight: '500',
          border: connected ? '1px solid rgb(51, 65, 85)' : 'none',
        }}
      />
    </div>
  );
};
