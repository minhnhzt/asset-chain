'use client';

import React, { useState } from 'react';
import { RegisterAssetForm } from '@/app/components/RegisterAssetForm';
import { AssetList } from '@/app/components/AssetList';

/**
 * Dashboard Page
 * Main interface for asset management
 * 
 * Features:
 * - Asset registration form
 * - Asset listing with pagination
 * - Real-time updates
 * - Responsive design for desktop and mobile
 */
export default function DashboardPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleAssetRegistered = (assetData: any) => {
    // Trigger asset list refresh
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Asset Management Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Register, track, and manage your assets on Solana blockchain
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Registration Form */}
          <div className="lg:col-span-1">
            <RegisterAssetForm onSuccess={handleAssetRegistered} />
          </div>

          {/* Right Column - Asset List */}
          <div className="lg:col-span-2">
            <div className="bg-white p-6 border border-gray-200 rounded-lg shadow-sm">
              <h2 className="text-xl font-bold mb-4 text-gray-800">Registered Assets</h2>
              <AssetList refreshTrigger={refreshTrigger} />
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-white border border-gray-200 rounded-lg">
            <h3 className="font-semibold text-gray-900 text-sm">Quick Start</h3>
            <p className="text-gray-600 text-xs mt-2">
              1. Connect wallet • 2. Fill asset info • 3. Upload metadata to IPFS • 4. Register
            </p>
          </div>
          <div className="p-4 bg-white border border-gray-200 rounded-lg">
            <h3 className="font-semibold text-gray-900 text-sm">Key Features</h3>
            <p className="text-gray-600 text-xs mt-2">
              • SPL token minting • Status tracking • Maintenance logging • CSV export (coming soon)
            </p>
          </div>
          <div className="p-4 bg-white border border-gray-200 rounded-lg">
            <h3 className="font-semibold text-gray-900 text-sm">Network</h3>
            <p className="text-gray-600 text-xs mt-2">
              Solana Devnet • Connected via Phantom wallet • Live transaction history
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white mt-16">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <p className="text-sm text-gray-600">
            Solana Asset MVP • Devnet Demo • © 2025. For testing purposes only.
          </p>
        </div>
      </footer>
    </div>
  );
}
