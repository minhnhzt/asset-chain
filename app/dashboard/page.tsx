'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function DashboardPage() {
  const [assets] = useState([
    { id: 1, name: 'Excavator XL-2000', location: 'Site A', status: 'ACTIVE', value: '$45,000' },
    { id: 2, name: 'Generator 500KW', location: 'Site B', status: 'MAINTENANCE', value: '$12,000' },
    { id: 3, name: 'Pump System', location: 'Site A', status: 'ACTIVE', value: '$8,500' },
  ]);

  const [approvals] = useState([
    { id: 1, type: 'Asset Registration', requester: 'John Doe', status: 'PENDING', votes: '2/3' },
    { id: 2, type: 'Maintenance Log', requester: 'Jane Smith', status: 'APPROVED', votes: '3/3' },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50';
      case 'MAINTENANCE':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'PENDING':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'APPROVED':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/50';
    }
  };

  return (
    <div className="space-y-8">
      {/* Quick Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        {[
          { label: 'Total Assets', value: '12', icon: '📦', color: 'from-blue-500 to-cyan-500' },
          { label: 'Active', value: '10', icon: '✓', color: 'from-emerald-500 to-teal-500' },
          { label: 'Maintenance', value: '2', icon: '🔧', color: 'from-yellow-500 to-orange-500' },
          { label: 'Pending Approvals', value: '3', icon: '⏳', color: 'from-purple-500 to-pink-500' },
        ].map((stat, idx) => (
          <div
            key={idx}
            className="bg-slate-900/50 border border-slate-800 rounded-lg p-6 hover:border-slate-700 transition"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center text-lg`}>
                {stat.icon}
              </div>
              <span className="text-slate-400 text-xs font-medium">This Month</span>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
            <div className="text-slate-400 text-sm">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Recent Assets */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white">Recent Assets</h2>
          <Link
            href="/dashboard/assets"
            className="text-sm text-blue-400 hover:text-blue-300 transition font-medium"
          >
            View All →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left py-3 px-4 text-slate-400 font-medium">Asset</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium">Location</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium">Status</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium">Value</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {assets.map((asset) => (
                <tr key={asset.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition">
                  <td className="py-4 px-4 text-white font-medium">{asset.name}</td>
                  <td className="py-4 px-4 text-slate-400">{asset.location}</td>
                  <td className="py-4 px-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(asset.status)}`}>
                      {asset.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-slate-300">{asset.value}</td>
                  <td className="py-4 px-4">
                    <button className="text-blue-400 hover:text-blue-300 text-sm font-medium transition">
                      View →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pending Approvals */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white">Pending Approvals</h2>
            <Link
              href="/dashboard/approvals"
              className="text-sm text-blue-400 hover:text-blue-300 transition font-medium"
            >
              View All →
            </Link>
          </div>

          <div className="space-y-4">
            {approvals.map((approval) => (
              <div
                key={approval.id}
                className="bg-slate-800/30 border border-slate-700 rounded-lg p-4 hover:border-slate-600 transition"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-white">{approval.type}</h3>
                    <p className="text-sm text-slate-400">by {approval.requester}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(approval.status)}`}>
                    {approval.status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 border-2 border-slate-900 flex items-center justify-center text-xs font-bold text-slate-900"
                      >
                        {i}
                      </div>
                    ))}
                  </div>
                  <span className="text-sm text-slate-400 font-medium">{approval.votes} votes</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white">Quick Actions</h2>
          <Link
            href="/dashboard/assets"
            className="block bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/50 rounded-lg p-6 hover:border-blue-400/50 transition"
          >
            <div className="text-2xl mb-3">📦</div>
            <h3 className="font-semibold text-white mb-1">Register New Asset</h3>
            <p className="text-sm text-slate-400">Add a new physical or digital asset</p>
          </Link>

          <Link
            href="/dashboard/maintenance"
            className="block bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/50 rounded-lg p-6 hover:border-emerald-400/50 transition"
          >
            <div className="text-2xl mb-3">🔧</div>
            <h3 className="font-semibold text-white mb-1">Log Maintenance</h3>
            <p className="text-sm text-slate-400">Record maintenance or repair activities</p>
          </Link>

          <Link
            href="/dashboard/approvals"
            className="block bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/50 rounded-lg p-6 hover:border-purple-400/50 transition"
          >
            <div className="text-2xl mb-3">✓</div>
            <h3 className="font-semibold text-white mb-1">Review Approvals</h3>
            <p className="text-sm text-slate-400">Manage multi-sig approval workflows</p>
          </Link>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
        <h2 className="text-lg font-bold text-white mb-6">Recent Activity</h2>

        <div className="space-y-4">
          {[
            { icon: '📦', event: 'Asset registered', detail: 'Excavator XL-2000 by John Doe', time: '2 hours ago' },
            { icon: '✓', event: 'Approval completed', detail: 'Maintenance log request approved', time: '4 hours ago' },
            { icon: '🔧', event: 'Maintenance logged', detail: 'Generator maintenance completed', time: '1 day ago' },
            { icon: '🔐', event: 'Proof anchored', detail: 'Multi-sig approval anchored to blockchain', time: '1 day ago' },
          ].map((activity, idx) => (
            <div key={idx} className="flex items-start gap-4 pb-4 border-b border-slate-800/50 last:border-0 last:pb-0">
              <div className="text-2xl">{activity.icon}</div>
              <div className="flex-1">
                <p className="text-white font-medium">{activity.event}</p>
                <p className="text-sm text-slate-400">{activity.detail}</p>
              </div>
              <span className="text-xs text-slate-500 whitespace-nowrap">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
