/**
 * Pinata Integration Examples
 * 
 * This file demonstrates how to use Pinata functions throughout the application.
 * Copy these patterns when implementing new features.
 */

import React from 'react';
import {
  uploadAssetMetadata,
  uploadMaintenanceDetails,
  uploadJSONToPinata,
  uploadFileToPinata,
  getIPFSUrl,
  unpinFromPinata,
  testPinataConnection,
} from '@/app/lib/pinata';

// ============================================================================
// Example 1: Asset Registration with IPFS Upload
// ============================================================================

export async function registerAssetExample() {
  try {
    // Step 1: Upload metadata to IPFS
    const ipfsCid = await uploadAssetMetadata({
      name: 'Forklift #123',
      location: 'Warehouse A, Bay 5',
      description: 'Heavy-duty electric forklift',
      category: 'Equipment',
      image: 'https://example.com/forklift.jpg',
      attributes: [
        { trait_type: 'Capacity', value: '5000 lbs' },
        { trait_type: 'Model', value: 'Toyota 8FBE20U' },
        { trait_type: 'Year', value: '2022' },
      ],
    });

    console.log('Metadata uploaded to IPFS:', ipfsCid);
    // Example: QmT5NvUtoM5nWFfrQdVrFtvGfKFmG7AHE8P34isapyhCxX

    // Step 2: Register on blockchain
    const response = await fetch('/api/assets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Forklift #123',
        location: 'Warehouse A, Bay 5',
        metadata_cid: ipfsCid,
        walletPublicKey: 'user-wallet-pubkey',
      }),
    });

    const data = await response.json();
    console.log('Asset registered:', data);

    return { success: true, ipfsCid, assetData: data };
  } catch (error) {
    console.error('Registration failed:', error);
    return { success: false, error };
  }
}

// ============================================================================
// Example 2: Maintenance Log with IPFS Upload
// ============================================================================

export async function createMaintenanceLogExample() {
  try {
    // Step 1: Upload details to IPFS
    const ipfsCid = await uploadMaintenanceDetails({
      assetId: 'asset-pubkey-here',
      performer: 'technician-pubkey-here',
      action: 'Routine maintenance',
      notes: 'Replaced oil filter, checked hydraulics, all systems operational',
      timestamp: new Date().toISOString(),
    });

    console.log('Maintenance details uploaded to IPFS:', ipfsCid);

    // Step 2: Add to blockchain
    const response = await fetch('/api/maintenance-logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        assetId: 'asset-pubkey-here',
        note: 'Routine maintenance completed',
        action: 'Routine maintenance',
        performerPublicKey: 'technician-pubkey-here',
        walletPublicKey: 'wallet-pubkey-here',
      }),
    });

    const data = await response.json();
    console.log('Maintenance log created:', data);

    return { success: true, ipfsCid, logData: data };
  } catch (error) {
    console.error('Log creation failed:', error);
    return { success: false, error };
  }
}

// ============================================================================
// Example 3: Upload Custom JSON Metadata
// ============================================================================

export async function uploadCustomMetadataExample() {
  const customData = {
    type: 'inspection_report',
    inspector: 'John Doe',
    date: '2024-10-27',
    findings: [
      { item: 'Brakes', status: 'Good', notes: 'No issues found' },
      { item: 'Tires', status: 'Fair', notes: 'Replace in 6 months' },
      { item: 'Engine', status: 'Excellent', notes: 'Recently serviced' },
    ],
    nextInspection: '2025-04-27',
  };

  try {
    const result = await uploadJSONToPinata(
      customData,
      'inspection-report-2024-10-27.json'
    );

    console.log('Inspection report uploaded:', result.IpfsHash);
    console.log('File size:', result.PinSize, 'bytes');

    return result;
  } catch (error) {
    console.error('Upload failed:', error);
    throw error;
  }
}

// ============================================================================
// Example 4: Upload Image File
// ============================================================================

export async function uploadImageExample(imageFile: File) {
  try {
    // Upload file directly (Pinata lib handles File type)
    const result = await uploadFileToPinata(imageFile, imageFile.name);

    console.log('Image uploaded:', result.IpfsHash);
    console.log('Access at:', getIPFSUrl(result.IpfsHash));

    return result;
  } catch (error) {
    console.error('Image upload failed:', error);
    throw error;
  }
}

// ============================================================================
// Example 5: Fetch and Display Metadata
// ============================================================================

export async function fetchMetadataExample(ipfsCid: string) {
  try {
    const url = getIPFSUrl(ipfsCid);
    console.log('Fetching from:', url);

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.statusText}`);
    }

    const metadata = await response.json();
    console.log('Metadata:', metadata);

    return metadata;
  } catch (error) {
    console.error('Fetch failed:', error);
    throw error;
  }
}

// ============================================================================
// Example 6: Test Pinata Connection (Health Check)
// ============================================================================

export async function healthCheckExample() {
  console.log('Testing Pinata connection...');

  const isConnected = await testPinataConnection();

  if (isConnected) {
    console.log('✅ Pinata connection successful');
    return true;
  } else {
    console.error('❌ Pinata connection failed');
    console.log('Please check your credentials in .env.local');
    return false;
  }
}

// ============================================================================
// Example 7: Unpin Old Content (Storage Management)
// ============================================================================

export async function unpinOldContentExample(ipfsCid: string) {
  try {
    await unpinFromPinata(ipfsCid);
    console.log('✅ Content unpinned successfully:', ipfsCid);
    return true;
  } catch (error) {
    console.error('Unpin failed:', error);
    return false;
  }
}

// ============================================================================
// Example 8: React Component with Loading States
// ============================================================================

export function AssetRegistrationComponent() {
  const [loading, setLoading] = React.useState(false);
  const [progress, setProgress] = React.useState('');
  const [error, setError] = React.useState('');
  const [ipfsCid, setIpfsCid] = React.useState('');

  const handleSubmit = async (formData: Record<string, unknown>) => {
    setLoading(true);
    setError('');
    setProgress('');

    try {
      // Step 1: Upload to IPFS
      setProgress('Uploading metadata to IPFS...');
      const cid = await uploadAssetMetadata(formData as unknown as {
        name: string;
        description?: string;
        location: string;
        category?: string;
        image?: string;
        attributes?: Array<{ trait_type: string; value: string }>;
        [key: string]: unknown;
      });
      setIpfsCid(cid);
      setProgress('Metadata uploaded successfully!');

      // Step 2: Register on blockchain
      setProgress('Registering asset on blockchain...');
      const response = await fetch('/api/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          metadata_cid: cid,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to register asset');
      }

      setProgress('Asset registered successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    progress,
    error,
    ipfsCid,
    handleSubmit,
  };
}

// ============================================================================
// Example 9: Batch Upload Multiple Assets
// ============================================================================

export async function batchUploadExample(assets: Array<Record<string, unknown>>) {
  const results = [];

  for (const asset of assets) {
    try {
      console.log(`Uploading asset: ${asset.name}...`);

      const ipfsCid = await uploadAssetMetadata(asset as unknown as {
        name: string;
        description?: string;
        location: string;
        category?: string;
        image?: string;
        attributes?: Array<{ trait_type: string; value: string }>;
        [key: string]: unknown;
      });

      results.push({
        name: asset.name,
        success: true,
        ipfsCid,
      });

      console.log(`✅ ${asset.name} uploaded: ${ipfsCid}`);
    } catch (error) {
      results.push({
        name: asset.name,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      console.error(`❌ ${asset.name} failed:`, error);
    }
  }

  return results;
}

// ============================================================================
// Example 10: Error Handling with Retry Logic
// ============================================================================

export async function uploadWithRetryExample(metadata: Record<string, unknown>, maxRetries = 3) {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Upload attempt ${attempt}/${maxRetries}...`);

      const ipfsCid = await uploadAssetMetadata(metadata as unknown as {
        name: string;
        description?: string;
        location: string;
        category?: string;
        image?: string;
        attributes?: Array<{ trait_type: string; value: string }>;
        [key: string]: unknown;
      });

      console.log('✅ Upload successful:', ipfsCid);
      return { success: true, ipfsCid };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      console.error(`❌ Attempt ${attempt} failed:`, lastError.message);

      if (attempt < maxRetries) {
        // Wait before retrying (exponential backoff)
        const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
        console.log(`Retrying in ${delay / 1000}s...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  console.error('❌ All retry attempts failed');
  return { success: false, error: lastError };
}

// ============================================================================
// Example 11: Validate IPFS CID Format
// ============================================================================

export function validateCIDExample(cid: string): boolean {
  // CIDv0: Qm... (46 characters, base58)
  // CIDv1: bafy... (variable length, base32)
  const cidv0Regex = /^Qm[1-9A-HJ-NP-Za-km-z]{44}$/;
  const cidv1Regex = /^bafy[0-9a-z]{50,}$/;

  const isValid = cidv0Regex.test(cid) || cidv1Regex.test(cid);

  if (isValid) {
    console.log('✅ Valid IPFS CID:', cid);
  } else {
    console.error('❌ Invalid IPFS CID:', cid);
  }

  return isValid;
}

// ============================================================================
// Example 12: Get Metadata from On-Chain Asset
// ============================================================================

export async function getAssetMetadataExample(assetPubkey: string) {
  try {
    // Step 1: Fetch asset from blockchain
    const response = await fetch(`/api/assets?pubkey=${assetPubkey}`);
    const { data: asset } = await response.json();

    console.log('Asset fetched:', asset);

    // Step 2: Fetch metadata from IPFS
    const metadataUrl = getIPFSUrl(asset.metadata_cid);
    const metadataResponse = await fetch(metadataUrl);
    const metadata = await metadataResponse.json();

    console.log('Metadata fetched:', metadata);

    return {
      asset,
      metadata,
      ipfsUrl: metadataUrl,
    };
  } catch (error) {
    console.error('Failed to get asset metadata:', error);
    throw error;
  }
}

// ============================================================================
// Usage in API Route (Server-Side)
// ============================================================================

/*
// Example: app/api/custom-upload/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { uploadJSONToPinata } from '@/app/lib/pinata';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Server-side upload to Pinata
    const result = await uploadJSONToPinata(body, 'custom-data.json');
    
    return NextResponse.json({
      success: true,
      ipfsCid: result.IpfsHash,
      size: result.PinSize,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
*/

// ============================================================================
// Usage in React Hook
// ============================================================================

/*
// Example: Custom hook for asset registration

import { useState } from 'react';
import { uploadAssetMetadata } from '@/app/lib/pinata';

export function useAssetRegistration() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ipfsCid, setIpfsCid] = useState<string | null>(null);

  const registerAsset = async (metadata: any) => {
    setLoading(true);
    setError(null);
    
    try {
      const cid = await uploadAssetMetadata(metadata);
      setIpfsCid(cid);
      
      // Continue with blockchain registration...
      
      return cid;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { registerAsset, loading, error, ipfsCid };
}
*/

export default {
  registerAssetExample,
  createMaintenanceLogExample,
  uploadCustomMetadataExample,
  uploadImageExample,
  fetchMetadataExample,
  healthCheckExample,
  unpinOldContentExample,
  batchUploadExample,
  uploadWithRetryExample,
  validateCIDExample,
  getAssetMetadataExample,
};
