'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function AssetsPage() {
  const [assets] = useState([
    { id: 1, name: 'Excavator XL-2000', location: 'Site A', status: 'ACTIVE', value: '$45,000', lastMaintenance: '2 days ago' },
    { id: 2, name: 'Generator 500KW', location: 'Site B', status: 'MAINTENANCE', value: '$12,000', lastMaintenance: '1 week ago' },
    { id: 3, name: 'Pump System', location: 'Site A', status: 'ACTIVE', value: '$8,500', lastMaintenance: '5 days ago' },
    { id: 4, name: 'Crane RTL-150', location: 'Site C', status: 'ACTIVE', value: '$65,000', lastMaintenance: '3 weeks ago' },
    { id: 5, name: 'Loader CAT 950', location: 'Site A', status: 'RETIRED', value: '$0', lastMaintenance: 'Never' },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50';
      case 'MAINTENANCE':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'RETIRED':
        return 'bg-red-500/20 text-red-400 border-red-500/50';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Assets</h1>
          <p className="text-slate-400 mt-1">Manage all registered assets</p>
        </div>
        <button className="px-6 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition">
          + Register Asset
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Search assets..."
          className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
        />
        <select className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500 transition">
          <option>All Status</option>
          <option>ACTIVE</option>
          <option>MAINTENANCE</option>
          <option>RETIRED</option>
        </select>
      </div>

      {/* Assets Table */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700 bg-slate-800/50">
              <th className="text-left py-4 px-6 text-slate-400 font-medium">Name</th>
              <th className="text-left py-4 px-6 text-slate-400 font-medium">Location</th>
              <th className="text-left py-4 px-6 text-slate-400 font-medium">Status</th>
              <th className="text-left py-4 px-6 text-slate-400 font-medium">Value</th>
              <th className="text-left py-4 px-6 text-slate-400 font-medium">Last Maintenance</th>
              <th className="text-left py-4 px-6 text-slate-400 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {assets.map((asset) => (
              <tr key={asset.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition">
                <td className="py-4 px-6 text-white font-medium">{asset.name}</td>
                <td className="py-4 px-6 text-slate-400">{asset.location}</td>
                <td className="py-4 px-6">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(asset.status)}`}>
                    {asset.status}
                  </span>
                </td>
                <td className="py-4 px-6 text-slate-300">{asset.value}</td>
                <td className="py-4 px-6 text-slate-400">{asset.lastMaintenance}</td>
                <td className="py-4 px-6">
                  <div className="flex gap-2">
                    <button className="text-blue-400 hover:text-blue-300 text-sm transition">View</button>
                    <button className="text-slate-400 hover:text-slate-300 text-sm transition">Edit</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">Showing 1-5 of 12 assets</p>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-400 hover:text-white transition">
            Previous
          </button>
          <button className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-400 hover:text-white transition">
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
