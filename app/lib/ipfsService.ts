/**
 * IPFS Service - Upload and retrieve metadata from IPFS via Pinata
 */

export interface AssetMetadata {
  name: string;
  location: string;
  category?: string;
  description?: string;
  imageUrl?: string;
  specifications?: Record<string, any>;
  purchaseDate?: string;
  purchasePrice?: number;
  warrantyExpiry?: string;
  [key: string]: any;
}

export interface IPFSUploadResponse {
  success: boolean;
  cid?: string;
  error?: string;
}

/**
 * Upload asset metadata to IPFS via backend API
 */
export async function uploadMetadataToIPFS(metadata: AssetMetadata): Promise<string> {
  try {
    const response = await fetch('/api/ipfs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(metadata),
    });

    if (!response.ok) {
      throw new Error(`Failed to upload metadata to IPFS: ${response.statusText}`);
    }

    const result: IPFSUploadResponse = await response.json();
    
    if (!result.success || !result.cid) {
      throw new Error(result.error || 'Failed to upload metadata to IPFS');
    }

    return result.cid;
  } catch (error) {
    console.error('Error uploading metadata to IPFS:', error);
    throw error;
  }
}

/**
 * Fetch metadata from IPFS via CID
 */
export async function fetchMetadataFromIPFS(cid: string): Promise<AssetMetadata> {
  try {
    const response = await fetch(`/api/ipfs?cid=${encodeURIComponent(cid)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch metadata from IPFS: ${response.statusText}`);
    }

    const metadata: AssetMetadata = await response.json();
    return metadata;
  } catch (error) {
    console.error('Error fetching metadata from IPFS:', error);
    throw error;
  }
}

/**
 * Upload image to IPFS and get CID
 */
export async function uploadImageToIPFS(file: File): Promise<string> {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/ipfs/upload-file', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to upload image to IPFS: ${response.statusText}`);
    }

    const result: IPFSUploadResponse = await response.json();
    
    if (!result.success || !result.cid) {
      throw new Error(result.error || 'Failed to upload image to IPFS');
    }

    return result.cid;
  } catch (error) {
    console.error('Error uploading image to IPFS:', error);
    throw error;
  }
}

/**
 * Get IPFS gateway URL for a CID
 */
export function getIPFSGatewayUrl(cid: string): string {
  // Using Pinata gateway or public gateway
  return `https://gateway.pinata.cloud/ipfs/${cid}`;
}
