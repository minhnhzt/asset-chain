'use client';

import React, { useEffect, useState } from 'react';

interface Asset {
  pubkey: string;
  owner: string;
  name: string;
  location: string;
  metadata_cid: string;
  status: number;
  created_at: number;
  updated_at: number;
}

const STATUS_LABELS: Record<number, string> = {
  0: 'Active',
  1: 'Maintenance',
  2: 'Retired',
  3: 'Disposed',
};

const STATUS_COLORS: Record<number, string> = {
  0: 'bg-green-100 text-green-800',
  1: 'bg-yellow-100 text-yellow-800',
  2: 'bg-gray-100 text-gray-800',
  3: 'bg-red-100 text-red-800',
};

interface AssetListProps {
  refreshTrigger?: number;
}

/**
 * AssetList Component
 * Displays all registered assets with pagination and filtering
 * 
 * Features:
 * - Real-time list of assets
 * - Status badge with color coding
 * - Asset details preview
 * - Pagination support
 * - Loading and error states
 */
export const AssetList: React.FC<AssetListProps> = ({ refreshTrigger = 0 }) => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const itemsPerPage = pageSize;

  // Fetch assets
  useEffect(() => {
    const fetchAssets = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/assets');
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch assets');
        }

        setAssets(data.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setAssets([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAssets();
  }, [refreshTrigger]);

  // Pagination
  const totalPages = Math.ceil(assets.length / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedAssets = assets.slice(startIndex, endIndex);

  const handlePrevPage = () => setPage((p) => Math.max(1, p - 1));
  const handleNextPage = () => setPage((p) => Math.min(totalPages, p + 1));

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800 font-medium">Error loading assets</p>
        <p className="text-red-600 text-sm">{error}</p>
      </div>
    );
  }

  if (assets.length === 0) {
    return (
      <div className="p-8 text-center bg-gray-50 border border-gray-200 rounded-lg">
        <p className="text-gray-600 font-medium">No assets registered yet</p>
        <p className="text-gray-500 text-sm">Register your first asset to get started</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Stats */}
      <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          Showing <span className="font-semibold">{paginatedAssets.length}</span> of{' '}
          <span className="font-semibold">{assets.length}</span> assets
        </p>
      </div>

      {/* Asset Table */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                Asset Name
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                Location
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                Status
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                Created
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedAssets.map((asset) => (
              <tr key={asset.pubkey} className="border-b hover:bg-gray-50 transition">
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium text-gray-900">{asset.name}</p>
                    <p className="text-xs text-gray-500 truncate">{asset.pubkey}</p>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{asset.location}</td>
                <td className="px-4 py-3">
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${STATUS_COLORS[asset.status] || 'bg-gray-100'}`}>
                    {STATUS_LABELS[asset.status] || 'Unknown'}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {new Date(asset.created_at * 1000).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handlePrevPage}
              disabled={page === 1}
              className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Previous
            </button>
            <button
              onClick={handleNextPage}
              disabled={page === totalPages}
              className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
