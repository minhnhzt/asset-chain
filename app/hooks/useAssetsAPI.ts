/**
 * Custom hook for managing assets with API integration
 * Replaces local state management with blockchain API calls
 */

import { useState, useEffect, useCallback } from 'react';
import { fetchAssets, registerAsset, updateAssetStatus, Asset } from '@/app/lib/assetService';
import { toast } from 'sonner';

export interface AssetUI {
  id: string;
  name: string;
  category: string;
  status: 'available' | 'checked-out' | 'maintenance' | 'retired';
  assignedTo: string | null;
  location: string;
  purchaseDate: string;
  value: number;
  serialNumber: string;
  image?: string;
  description?: string;
  manufacturer?: string;
  model?: string;
  warrantyExpiry?: string;
  mintAddress?: string;
  ipfsHash?: string;
}

/**
 * Convert blockchain Asset to UI Asset format
 */
function mapBlockchainToUI(asset: Asset): AssetUI {
  // Parse metadata from IPFS (in real app, fetch from IPFS by CID)
  // For now, use mock data based on asset name
  
  const statusMap: Record<number, 'available' | 'checked-out' | 'maintenance' | 'retired'> = {
    0: 'available',      // ACTIVE
    1: 'maintenance',    // MAINTENANCE
    2: 'retired',        // RETIRED
    3: 'retired',        // DISPOSED
  };

  return {
    id: asset.pubkey,
    name: asset.name,
    category: 'Equipment', // TODO: Parse from metadata_cid
    status: statusMap[asset.status] || 'available',
    assignedTo: null, // TODO: Parse from metadata_cid
    location: asset.location,
    purchaseDate: new Date(asset.created_at * 1000).toISOString().split('T')[0],
    value: 0, // TODO: Parse from metadata_cid
    serialNumber: asset.pubkey.slice(0, 12), // Use pubkey as serial
    image: undefined,
    description: undefined,
    manufacturer: undefined,
    model: undefined,
    warrantyExpiry: undefined,
    mintAddress: asset.pubkey,
    ipfsHash: asset.metadata_cid,
  };
}

/**
 * Convert UI status to blockchain status number
 */
function mapUIStatusToBlockchain(status: string): number {
  const statusMap: Record<string, number> = {
    'available': 0,
    'checked-out': 0,
    'maintenance': 1,
    'retired': 2,
  };
  return statusMap[status] || 0;
}

export function useAssetsAPI() {
  const [assets, setAssets] = useState<AssetUI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load assets from blockchain
   */
  const loadAssets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const blockchainAssets = await fetchAssets();
      const uiAssets = blockchainAssets.map(mapBlockchainToUI);
      
      setAssets(uiAssets);
      toast.success(`Loaded ${uiAssets.length} assets from blockchain`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load assets';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Error loading assets:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Initial load
   */
  useEffect(() => {
    loadAssets();
  }, [loadAssets]);

  /**
   * Add new asset (register on blockchain)
   */
  const addAsset = useCallback(async (newAsset: AssetUI): Promise<void> => {
    try {
      toast.loading('Registering asset on blockchain...');
      
      // TODO: Upload full metadata to IPFS first
      const mockMetadataCid = 'QmMockCID' + Date.now();
      
      const result = await registerAsset(
        newAsset.name,
        newAsset.location,
        mockMetadataCid
      );

      toast.success(`Asset registered! TX: ${result.signature.slice(0, 8)}...`);
      
      // Reload assets from blockchain
      await loadAssets();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to register asset';
      toast.error(errorMessage);
      throw err;
    }
  }, [loadAssets]);

  /**
   * Update asset status
   */
  const updateAsset = useCallback(async (updatedAsset: AssetUI): Promise<void> => {
    try {
      toast.loading('Updating asset status...');
      
      const blockchainStatus = mapUIStatusToBlockchain(updatedAsset.status);
      
      const result = await updateAssetStatus(
        updatedAsset.id,
        blockchainStatus
      );

      toast.success(`Status updated! TX: ${result.signature.slice(0, 8)}...`);
      
      // Reload assets from blockchain
      await loadAssets();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update asset';
      toast.error(errorMessage);
      throw err;
    }
  }, [loadAssets]);

  /**
   * Delete asset (mark as disposed on blockchain)
   */
  const deleteAsset = useCallback(async (assetId: string): Promise<void> => {
    try {
      toast.loading('Marking asset as disposed...');
      
      // Status 3 = DISPOSED
      const result = await updateAssetStatus(assetId, 3);

      toast.success(`Asset disposed! TX: ${result.signature.slice(0, 8)}...`);
      
      // Reload assets from blockchain
      await loadAssets();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete asset';
      toast.error(errorMessage);
      throw err;
    }
  }, [loadAssets]);

  return {
    assets,
    loading,
    error,
    addAsset,
    updateAsset,
    deleteAsset,
    refreshAssets: loadAssets,
  };
}
