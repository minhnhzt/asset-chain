/**
 * Asset Management Dashboard - Integrated with Backend API
 * Uses real data from Solana blockchain via backend API
 */

'use client';

import { useState } from 'react';
import { 
  Plus, 
  Filter, 
  Download, 
  Upload, 
  RefreshCw,
  Package,
  Search,
  Loader2
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { useAssets } from '@/app/hooks/useAssets';
import { formatAssetStatus, getStatusColor } from '@/app/lib/assetService';
import { RegisterAssetForm } from './RegisterAssetForm';
import { AssetList } from './AssetList';

export function AssetManagementDashboard() {
  const { assets, loading, error, refetch } = useAssets();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<number | null>(null);
  const [showRegisterForm, setShowRegisterForm] = useState(false);

  // Filter assets based on search and status
  const filteredAssets = assets.filter(asset => {
    const matchesSearch = 
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === null || asset.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Calculate statistics
  const stats = {
    total: assets.length,
    active: assets.filter(a => a.status === 0).length,
    maintenance: assets.filter(a => a.status === 1).length,
    retired: assets.filter(a => a.status === 2).length,
  };

  const handleAssetRegistered = () => {
    setShowRegisterForm(false);
    refetch();
  };

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              <p className="text-lg font-semibold">Error loading assets</p>
              <p className="text-sm mt-2">{error}</p>
              <Button onClick={refetch} className="mt-4">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Asset Management</h1>
          <p className="text-gray-600 mt-1">
            Manage your organization's assets on Solana blockchain
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={refetch}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => setShowRegisterForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Register Asset
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
            <Package className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <div className="h-3 w-3 rounded-full bg-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Maintenance</CardTitle>
            <div className="h-3 w-3 rounded-full bg-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.maintenance}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Retired</CardTitle>
            <div className="h-3 w-3 rounded-full bg-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.retired}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search assets by name or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={statusFilter === null ? 'default' : 'outline'}
                onClick={() => setStatusFilter(null)}
                size="sm"
              >
                All
              </Button>
              <Button
                variant={statusFilter === 0 ? 'default' : 'outline'}
                onClick={() => setStatusFilter(0)}
                size="sm"
              >
                Active
              </Button>
              <Button
                variant={statusFilter === 1 ? 'default' : 'outline'}
                onClick={() => setStatusFilter(1)}
                size="sm"
              >
                Maintenance
              </Button>
              <Button
                variant={statusFilter === 2 ? 'default' : 'outline'}
                onClick={() => setStatusFilter(2)}
                size="sm"
              >
                Retired
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assets List */}
      {loading && assets.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              <span className="ml-3 text-gray-600">Loading assets...</span>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>
              Assets {filteredAssets.length > 0 && `(${filteredAssets.length})`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AssetList />
          </CardContent>
        </Card>
      )}

      {/* Register Asset Modal */}
      {showRegisterForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Register New Asset</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowRegisterForm(false)}
                >
                  ✕
                </Button>
              </div>
              <RegisterAssetForm onSuccess={handleAssetRegistered} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
