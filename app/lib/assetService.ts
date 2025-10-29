/**
 * Asset Service - Client-side API integration for Asset Management
 * Connects frontend components with backend API endpoints
 */

export interface Asset {
  pubkey: string;
  owner: string;
  name: string;
  location: string;
  metadata_cid: string;
  status: number;
  created_at: number;
  updated_at: number;
}

export interface MaintenanceLogEntry {
  performer: string;
  note: string;
  timestamp: number;
  ipfs_cid?: string;
}

export interface MaintenanceLog {
  asset: string;
  owner: string;
  entries: MaintenanceLogEntry[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  cached?: boolean;
  count?: number;
}

/**
 * Fetch all registered assets
 */
export async function fetchAssets(): Promise<Asset[]> {
  try {
    const response = await fetch('/api/assets', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch assets: ${response.statusText}`);
    }

    const result: ApiResponse<Asset[]> = await response.json();
    
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to fetch assets');
    }

    return result.data;
  } catch (error) {
    console.error('Error fetching assets:', error);
    throw error;
  }
}

/**
 * Register a new asset
 */
export async function registerAsset(
  name: string,
  location: string,
  metadataCid: string
): Promise<{ signature: string; assetPubkey: string }> {
  try {
    const response = await fetch('/api/assets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        location,
        metadata_cid: metadataCid,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to register asset: ${response.statusText}`);
    }

    const result: ApiResponse<{ signature: string; assetPubkey: string }> = await response.json();
    
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to register asset');
    }

    return result.data;
  } catch (error) {
    console.error('Error registering asset:', error);
    throw error;
  }
}

/**
 * Fetch maintenance logs for a specific asset
 */
export async function fetchMaintenanceLogs(assetId: string): Promise<MaintenanceLog> {
  try {
    const response = await fetch(`/api/maintenance-logs?assetId=${encodeURIComponent(assetId)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch maintenance logs: ${response.statusText}`);
    }

    const result: ApiResponse<MaintenanceLog> = await response.json();
    
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to fetch maintenance logs');
    }

    return result.data;
  } catch (error) {
    console.error('Error fetching maintenance logs:', error);
    throw error;
  }
}

/**
 * Add a new maintenance log entry
 */
export async function addMaintenanceLog(
  assetId: string,
  note: string,
  ipfsCid?: string
): Promise<{ signature: string }> {
  try {
    const response = await fetch('/api/maintenance-logs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        assetId,
        note,
        ipfs_cid: ipfsCid,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to add maintenance log: ${response.statusText}`);
    }

    const result: ApiResponse<{ signature: string }> = await response.json();
    
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to add maintenance log');
    }

    return result.data;
  } catch (error) {
    console.error('Error adding maintenance log:', error);
    throw error;
  }
}

/**
 * Update asset metadata CID
 */
export async function updateAssetMetadata(
  assetPubkey: string,
  newMetadataCid: string
): Promise<{ signature: string }> {
  try {
    const response = await fetch('/api/assets', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        assetPubkey,
        metadata_cid: newMetadataCid,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update asset metadata: ${response.statusText}`);
    }

    const result: ApiResponse<{ signature: string }> = await response.json();
    
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to update asset metadata');
    }

    return result.data;
  } catch (error) {
    console.error('Error updating asset metadata:', error);
    throw error;
  }
}

/**
 * Update asset status
 */
export async function updateAssetStatus(
  assetPubkey: string,
  newStatus: number
): Promise<{ signature: string }> {
  try {
    const response = await fetch('/api/assets', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        assetPubkey,
        status: newStatus,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update asset status: ${response.statusText}`);
    }

    const result: ApiResponse<{ signature: string }> = await response.json();
    
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to update asset status');
    }

    return result.data;
  } catch (error) {
    console.error('Error updating asset status:', error);
    throw error;
  }
}

/**
 * Format asset status number to readable string
 */
export function formatAssetStatus(status: number): string {
  switch (status) {
    case 0:
      return 'Active';
    case 1:
      return 'Maintenance';
    case 2:
      return 'Retired';
    case 3:
      return 'Disposed';
    default:
      return 'Unknown';
  }
}

/**
 * Get status color for UI display
 */
export function getStatusColor(status: number): string {
  switch (status) {
    case 0:
      return 'green';
    case 1:
      return 'yellow';
    case 2:
      return 'gray';
    case 3:
      return 'red';
    default:
      return 'gray';
  }
}
