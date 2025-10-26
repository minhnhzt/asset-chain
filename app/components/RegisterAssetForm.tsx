'use client';

import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useTransactionSigner } from '@/app/hooks/useTransactionSigner';
import { getExplorerUrl } from '@/app/config/solana';

import type { AssetData } from '@/app/types';
import { uploadAssetMetadata } from '@/app/lib/pinata';

interface RegisterAssetFormProps {
  onSuccess?: (assetData: AssetData) => void;
  onError?: (error: string) => void;
}

/**
 * RegisterAssetForm Component
 * Allows managers to register new assets
 * 
 * Features:
 * - Form validation for name, location, and metadata
 * - Automatic IPFS upload via Pinata
 * - Loading state while processing
 * - Success/error notifications
 */
export const RegisterAssetForm: React.FC<RegisterAssetFormProps> = ({
  onSuccess,
  onError,
}) => {
  const { publicKey, connected } = useWallet();
  const { registerAsset } = useTransactionSigner();
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [transactionSignature, setTransactionSignature] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);
    setUploadProgress('');

    // Validate form
    if (!connected || !publicKey) {
      const errorMsg = 'Please connect your wallet first';
      setMessage({ type: 'error', text: errorMsg });
      onError?.(errorMsg);
      return;
    }

    if (!name.trim() || !location.trim()) {
      const errorMsg = 'Name and location are required';
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

    setLoading(true);

    try {
      // Step 1: Upload metadata to Pinata
      setUploadProgress('Uploading metadata to IPFS...');
      const metadataCid = await uploadAssetMetadata({
        name,
        location,
        description: description || `Asset: ${name}`,
        category: category || 'General',
        image: imageUrl || '',
        attributes: [
          { trait_type: 'Location', value: location },
          { trait_type: 'Category', value: category || 'General' },
        ],
      });

      setUploadProgress('Metadata uploaded successfully!');

      // Step 2: Register asset on blockchain
      setUploadProgress('Registering asset on blockchain...');
      const signature = await registerAsset(name, location, metadataCid);
      
      setTransactionSignature(signature);
      setUploadProgress('Asset registered successfully!');

      // Success
      setMessage({ 
        type: 'success', 
        text: `Asset registered successfully! Transaction: ${signature.slice(0, 8)}...` 
      });
      setName('');
      setLocation('');
      setDescription('');
      setCategory('');
      setImageUrl('');
      setUploadProgress('');

      // Call success callback with mock data
      if (onSuccess) {
        const mockAssetData: AssetData = {
          pubkey: '', // Would be derived from PDA
          owner: publicKey!.toString(),
          name,
          location,
          metadata_cid: metadataCid,
          status: 0,
          created_at: Math.floor(Date.now() / 1000),
          updated_at: Math.floor(Date.now() / 1000),
        };
        onSuccess(mockAssetData);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
      setMessage({ type: 'error', text: errorMsg });
      setUploadProgress('');
      onError?.(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const explorerUrl = transactionSignature 
    ? getExplorerUrl(transactionSignature, 'tx') 
    : null;

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

      {/* Description (Optional) */}
      <div className="mb-4">
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g., Heavy-duty forklift for warehouse operations"
          rows={3}
          disabled={loading}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
        />
      </div>

      {/* Category (Optional) */}
      <div className="mb-4">
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
          Category
        </label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          disabled={loading}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
        >
          <option value="">Select a category</option>
          <option value="Equipment">Equipment</option>
          <option value="Machinery">Machinery</option>
          <option value="Vehicle">Vehicle</option>
          <option value="Electronics">Electronics</option>
          <option value="Furniture">Furniture</option>
          <option value="Tools">Tools</option>
          <option value="Other">Other</option>
        </select>
      </div>

      {/* Image URL (Optional) */}
      <div className="mb-6">
        <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-2">
          Image URL
        </label>
        <input
          id="imageUrl"
          type="url"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://example.com/image.jpg"
          disabled={loading}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
        />
        <p className="text-xs text-gray-500 mt-1">
          Optional: URL to asset image
        </p>
      </div>

      {/* Upload Progress */}
      {uploadProgress && (
        <div className="mb-4 p-3 rounded-lg text-sm bg-blue-50 text-blue-800 border border-blue-200">
          {uploadProgress}
        </div>
      )}

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
          {message.type === 'success' && explorerUrl && (
            <a
              href={explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block mt-2 text-blue-600 hover:text-blue-800 underline text-xs"
            >
              View transaction on Solana Explorer →
            </a>
          )}
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
