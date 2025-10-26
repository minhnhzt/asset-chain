/**
 * Pinata IPFS Utility Functions
 * Helper functions for uploading files and JSON to IPFS via Pinata
 */

import { SOLANA_CONFIG } from '../config/solana';

const PINATA_API_URL = 'https://api.pinata.cloud';

/**
 * Upload JSON metadata to IPFS via Pinata
 */
export async function uploadJSONToPinata(
  jsonData: object,
  name: string = 'metadata.json'
): Promise<{ IpfsHash: string; PinSize: number; Timestamp: string }> {
  try {
    const { pinataJWT } = SOLANA_CONFIG.ipfs;

    if (!pinataJWT) {
      throw new Error('Pinata JWT not configured. Please set PINATA_JWT in environment variables.');
    }

    const response = await fetch(`${PINATA_API_URL}/pinning/pinJSONToIPFS`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${pinataJWT}`,
      },
      body: JSON.stringify({
        pinataContent: jsonData,
        pinataMetadata: {
          name: name,
        },
        pinataOptions: {
          cidVersion: 1,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Pinata upload failed: ${errorData.error || response.statusText}`);
    }

    const data = await response.json();
    
    if (SOLANA_CONFIG.debug.enabled) {
      console.log('📌 Uploaded JSON to Pinata:', {
        cid: data.IpfsHash,
        size: data.PinSize,
        name,
      });
    }

    return data;
  } catch (error) {
    console.error('Error uploading JSON to Pinata:', error);
    throw error;
  }
}

/**
 * Upload file to IPFS via Pinata
 */
export async function uploadFileToPinata(
  file: File,
  name?: string
): Promise<{ IpfsHash: string; PinSize: number; Timestamp: string }> {
  try {
    const { pinataJWT } = SOLANA_CONFIG.ipfs;

    if (!pinataJWT) {
      throw new Error('Pinata JWT not configured. Please set PINATA_JWT in environment variables.');
    }

    const formData = new FormData();
    formData.append('file', file);

    const metadata = JSON.stringify({
      name: name || file.name,
    });
    formData.append('pinataMetadata', metadata);

    const options = JSON.stringify({
      cidVersion: 1,
    });
    formData.append('pinataOptions', options);

    const response = await fetch(`${PINATA_API_URL}/pinning/pinFileToIPFS`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${pinataJWT}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Pinata upload failed: ${errorData.error || response.statusText}`);
    }

    const data = await response.json();

    if (SOLANA_CONFIG.debug.enabled) {
      console.log('📌 Uploaded file to Pinata:', {
        cid: data.IpfsHash,
        size: data.PinSize,
        name: name || file.name,
      });
    }

    return data;
  } catch (error) {
    console.error('Error uploading file to Pinata:', error);
    throw error;
  }
}

/**
 * Get IPFS gateway URL for a CID
 */
export function getIPFSUrl(cid: string): string {
  return `${SOLANA_CONFIG.ipfs.gateway}${cid}`;
}

/**
 * Unpin content from Pinata (cleanup)
 */
export async function unpinFromPinata(cid: string): Promise<void> {
  try {
    const { pinataJWT } = SOLANA_CONFIG.ipfs;

    if (!pinataJWT) {
      throw new Error('Pinata JWT not configured.');
    }

    const response = await fetch(`${PINATA_API_URL}/pinning/unpin/${cid}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${pinataJWT}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Pinata unpin failed: ${errorData.error || response.statusText}`);
    }

    if (SOLANA_CONFIG.debug.enabled) {
      console.log('📌 Unpinned from Pinata:', cid);
    }
  } catch (error) {
    console.error('Error unpinning from Pinata:', error);
    throw error;
  }
}

/**
 * Test Pinata connection
 */
export async function testPinataConnection(): Promise<boolean> {
  try {
    const { pinataJWT } = SOLANA_CONFIG.ipfs;

    if (!pinataJWT) {
      console.error('❌ Pinata JWT not configured');
      return false;
    }

    const response = await fetch(`${PINATA_API_URL}/data/testAuthentication`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${pinataJWT}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Pinata connection successful:', data);
      return true;
    } else {
      console.error('❌ Pinata authentication failed');
      return false;
    }
  } catch (error) {
    console.error('❌ Error testing Pinata connection:', error);
    return false;
  }
}

/**
 * Upload asset metadata to Pinata
 * Creates a properly formatted JSON metadata file for assets
 */
export async function uploadAssetMetadata(metadata: {
  name: string;
  description?: string;
  location: string;
  category?: string;
  image?: string;
  attributes?: Array<{ trait_type: string; value: string }>;
  [key: string]: unknown;
}): Promise<string> {
  const formattedMetadata = {
    ...metadata,
    description: metadata.description || `Asset: ${metadata.name}`,
    category: metadata.category || 'General',
    image: metadata.image || '',
    attributes: metadata.attributes || [],
    created_at: new Date().toISOString(),
  };

  const result = await uploadJSONToPinata(
    formattedMetadata,
    `asset-${metadata.name.replace(/\s+/g, '-').toLowerCase()}.json`
  );

  return result.IpfsHash;
}

/**
 * Upload maintenance log details to Pinata
 * Creates a properly formatted JSON file for maintenance logs
 */
export async function uploadMaintenanceDetails(details: {
  assetId: string;
  performer: string;
  action: string;
  notes: string;
  timestamp?: string;
  [key: string]: unknown;
}): Promise<string> {
  const formattedDetails = {
    ...details,
    timestamp: details.timestamp || new Date().toISOString(),
    log_type: 'maintenance',
  };

  const result = await uploadJSONToPinata(
    formattedDetails,
    `maintenance-${details.assetId}-${Date.now()}.json`
  );

  return result.IpfsHash;
}
