'use client';

import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

interface RegisterAssetFormProps {
  onSuccess?: (assetData: any) => void;
  onError?: (error: string) => void;
}

/**
 * RegisterAssetForm Component
 * Allows managers to register new assets
 * 
 * Features:
 * - Form validation for name, location, and metadata
 * - Loading state while processing
 * - Success/error notifications
 * - IPFS metadata CID input
 */
export const RegisterAssetForm: React.FC<RegisterAssetFormProps> = ({
  onSuccess,
  onError,
}) => {
  const { publicKey, sendTransaction, connected } = useWallet();
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [metadataCid, setMetadataCid] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    // Validate form
    if (!connected || !publicKey) {
      const errorMsg = 'Please connect your wallet first';
      setMessage({ type: 'error', text: errorMsg });
      onError?.(errorMsg);
      return;
    }

    if (!name.trim() || !location.trim() || !metadataCid.trim()) {
      const errorMsg = 'All fields are required';
      setMessage({ type: 'error', text: errorMsg });
      onError?.(errorMsg);
      return;
    }

    if (name.length > 128) {
      const errorMsg = 'Asset name must be 128 characters or less';
      setMessage({ type: 'error', text: errorMsg });
      onError?.(errorMsg);
      return;
    }

    if (location.length > 256) {
      const errorMsg = 'Location must be 256 characters or less';
      setMessage({ type: 'error', text: errorMsg });
      onError?.(errorMsg);
      return;
    }

    if (metadataCid.length > 256) {
      const errorMsg = 'Metadata CID must be 256 characters or less';
      setMessage({ type: 'error', text: errorMsg });
      onError?.(errorMsg);
      return;
    }

    setLoading(true);

    try {
      // Call backend API to register asset
      const response = await fetch('/api/assets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          location,
          metadata_cid: metadataCid,
          walletPublicKey: publicKey.toString(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to register asset');
      }

      // Success
      setMessage({ type: 'success', text: 'Asset registered successfully!' });
      setName('');
      setLocation('');
      setMetadataCid('');

      onSuccess?.(data.data);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
      setMessage({ type: 'error', text: errorMsg });
      onError?.(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md mx-auto p-6 bg-white border border-gray-200 rounded-lg shadow-sm"
    >
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Register Asset</h2>

      {/* Asset Name */}
      <div className="mb-4">
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
          Asset Name *
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Server A, Laptop #42"
          maxLength={128}
          disabled={loading}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          required
        />
        <p className="text-xs text-gray-500 mt-1">{name.length}/128 characters</p>
      </div>

      {/* Location */}
      <div className="mb-4">
        <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
          Location *
        </label>
        <input
          id="location"
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="e.g., Office Building A, Room 201"
          maxLength={256}
          disabled={loading}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          required
        />
        <p className="text-xs text-gray-500 mt-1">{location.length}/256 characters</p>
      </div>

      {/* IPFS Metadata CID */}
      <div className="mb-6">
        <label htmlFor="metadata" className="block text-sm font-medium text-gray-700 mb-2">
          Metadata IPFS CID *
        </label>
        <input
          id="metadata"
          type="text"
          value={metadataCid}
          onChange={(e) => setMetadataCid(e.target.value)}
          placeholder="e.g., QmXxxx..."
          maxLength={256}
          disabled={loading}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          Upload metadata to IPFS first and paste the CID here
        </p>
        <p className="text-xs text-gray-500">{metadataCid.length}/256 characters</p>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`mb-4 p-3 rounded-lg text-sm ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading || !connected}
        className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Registering...' : 'Register Asset'}
      </button>

      {!connected && (
        <p className="text-sm text-gray-600 mt-3 text-center">
          Connect your wallet to register assets
        </p>
      )}
    </form>
  );
};
