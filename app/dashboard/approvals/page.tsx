'use client';

import { useState } from 'react';

export default function ApprovalsPage() {
  const [requests] = useState([
    {
      id: 1,
      type: 'Asset Registration',
      description: 'Register new Excavator XL-2000',
      requester: 'John Doe',
      status: 'PENDING',
      votes: { approved: 2, total: 3 },
      createdAt: '2 hours ago',
    },
    {
      id: 2,
      type: 'Maintenance Completion',
      description: 'Log generator maintenance completion',
      requester: 'Jane Smith',
      status: 'APPROVED',
      votes: { approved: 3, total: 3 },
      createdAt: '4 hours ago',
    },
    {
      id: 3,
      type: 'Asset Status Update',
      description: 'Change pump status to MAINTENANCE',
      requester: 'Mike Johnson',
      status: 'PENDING',
      votes: { approved: 1, total: 3 },
      createdAt: '1 day ago',
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50';
      case 'PENDING':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'REJECTED':
        return 'bg-red-500/20 text-red-400 border-red-500/50';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Multi-Sig Approvals</h1>
        <p className="text-slate-400 mt-1">Review and vote on pending requests</p>
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        {[
          { label: 'Total Requests', value: '12', icon: '📋', color: 'from-blue-500 to-cyan-500' },
          { label: 'Pending', value: '2', icon: '⏳', color: 'from-yellow-500 to-orange-500' },
          { label: 'Approved', value: '8', icon: '✓', color: 'from-emerald-500 to-teal-500' },
          { label: 'Rejected', value: '2', icon: '✕', color: 'from-red-500 to-pink-500' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-slate-900/50 border border-slate-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">{stat.icon}</span>
              <span className="text-slate-400 text-xs font-medium">This Month</span>
            </div>
            <div className="text-2xl font-bold text-white">{stat.value}</div>
            <div className="text-slate-400 text-sm mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Approval Requests */}
      <div className="space-y-4">
        {requests.map((request) => (
          <div key={request.id} className="bg-slate-900/50 border border-slate-800 rounded-lg p-6 hover:border-slate-700 transition">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-1">{request.type}</h3>
                <p className="text-slate-400 text-sm">{request.description}</p>
                <p className="text-slate-500 text-xs mt-2">
                  Requested by <span className="text-slate-300">{request.requester}</span> • {request.createdAt}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(request.status)}`}>
                {request.status}
              </span>
            </div>

            {/* Vote Progress */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-400">Approvals</span>
                <span className="text-sm text-white font-medium">
                  {request.votes.approved}/{request.votes.total}
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all"
                  style={{ width: `${(request.votes.approved / request.votes.total) * 100}%` }}
                />
              </div>
            </div>

            {/* Voters */}
            <div className="mb-4">
              <p className="text-sm text-slate-400 mb-2">Approvers</p>
              <div className="flex -space-x-2">
                {[
                  { name: 'Alice', voted: true },
                  { name: 'Bob', voted: true },
                  { name: 'Charlie', voted: request.status === 'APPROVED' },
                ].map((voter, idx) => (
                  <div
                    key={idx}
                    className={`w-10 h-10 rounded-full border-2 border-slate-900 flex items-center justify-center text-xs font-bold ${
                      voter.voted
                        ? 'bg-gradient-to-br from-emerald-400 to-teal-400 text-slate-900'
                        : 'bg-gradient-to-br from-slate-600 to-slate-700 text-slate-300'
                    }`}
                    title={voter.name}
                  >
                    {voter.name[0]}
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            {request.status === 'PENDING' && (
              <div className="flex gap-3">
                <button className="flex-1 px-4 py-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 rounded-lg hover:bg-emerald-500/30 transition font-medium text-sm">
                  ✓ Approve
                </button>
                <button className="flex-1 px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/50 rounded-lg hover:bg-red-500/30 transition font-medium text-sm">
                  ✕ Reject
                </button>
                <button className="px-4 py-2 bg-slate-800 text-slate-400 border border-slate-700 rounded-lg hover:text-white transition font-medium text-sm">
                  View Details
                </button>
              </div>
            )}

            {request.status === 'APPROVED' && (
              <div className="flex items-center gap-3 text-emerald-400">
                <span className="text-lg">✓</span>
                <span className="text-sm">Approved by all • Ready to execute</span>
                <button className="ml-auto px-4 py-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 rounded-lg hover:bg-emerald-500/30 transition font-medium text-sm">
                  Execute
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
