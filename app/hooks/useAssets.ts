/**
 * Custom React hooks for Asset Management
 */

import { useState, useEffect, useCallback } from 'react';
import {
  Asset,
  MaintenanceLog,
  fetchAssets,
  fetchMaintenanceLogs,
  registerAsset,
  addMaintenanceLog,
  updateAssetStatus,
  updateAssetMetadata,
} from '@/app/lib/assetService';

/**
 * Hook to fetch and manage assets list
 */
export function useAssets() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAssets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAssets();
      setAssets(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load assets');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAssets();
  }, [loadAssets]);

  return {
    assets,
    loading,
    error,
    refetch: loadAssets,
  };
}

/**
 * Hook to fetch maintenance logs for a specific asset
 */
export function useMaintenanceLogs(assetId: string | null) {
  const [logs, setLogs] = useState<MaintenanceLog | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadLogs = useCallback(async () => {
    if (!assetId) {
      setLogs(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await fetchMaintenanceLogs(assetId);
      setLogs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load maintenance logs');
    } finally {
      setLoading(false);
    }
  }, [assetId]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  return {
    logs,
    loading,
    error,
    refetch: loadLogs,
  };
}

/**
 * Hook to register a new asset
 */
export function useRegisterAsset() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const register = useCallback(async (
    name: string,
    location: string,
    metadataCid: string
  ) => {
    try {
      setLoading(true);
      setError(null);
      const result = await registerAsset(name, location, metadataCid);
      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to register asset';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    register,
    loading,
    error,
  };
}

/**
 * Hook to add maintenance log entry
 */
export function useAddMaintenanceLog() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addLog = useCallback(async (
    assetId: string,
    note: string,
    ipfsCid?: string
  ) => {
    try {
      setLoading(true);
      setError(null);
      const result = await addMaintenanceLog(assetId, note, ipfsCid);
      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to add maintenance log';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    addLog,
    loading,
    error,
  };
}

/**
 * Hook to update asset status
 */
export function useUpdateAssetStatus() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateStatus = useCallback(async (
    assetPubkey: string,
    newStatus: number
  ) => {
    try {
      setLoading(true);
      setError(null);
      const result = await updateAssetStatus(assetPubkey, newStatus);
      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to update asset status';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    updateStatus,
    loading,
    error,
  };
}

/**
 * Hook to update asset metadata
 */
export function useUpdateAssetMetadata() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateMetadata = useCallback(async (
    assetPubkey: string,
    newMetadataCid: string
  ) => {
    try {
      setLoading(true);
      setError(null);
      const result = await updateAssetMetadata(assetPubkey, newMetadataCid);
      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to update asset metadata';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    updateMetadata,
    loading,
    error,
  };
}
