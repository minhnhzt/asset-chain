'use client';

import React, { useEffect, useState } from 'react';
import { MultiSigRequest } from '@/app/types';

interface MultiSigRequestHistoryProps {
  assetId?: string;
}

export default function MultiSigRequestHistory({
  assetId,
}: MultiSigRequestHistoryProps) {
  const [requests, setRequests] = useState<MultiSigRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, [assetId, filter]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      let url = '/api/multisig-requests?';
      const params = [];
      
      if (assetId) {
        params.push(`assetId=${encodeURIComponent(assetId)}`);
      }
      
      if (filter !== 'ALL') {
        params.push(`status=${filter}`);
      }

      url += params.join('&');

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setRequests(data.requests || []);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    const colors: { [key: string]: string } = {
      PENDING: 'bg-yellow-100 text-yellow-800 border border-yellow-300',
      APPROVED: 'bg-green-100 text-green-800 border border-green-300',
      REJECTED: 'bg-red-100 text-red-800 border border-red-300',
      EXECUTED: 'bg-blue-100 text-blue-800 border border-blue-300',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getTypeIcon = (type: string) => {
    const icons: { [key: string]: string } = {
      UPDATE_METADATA: '📝',
      CHANGE_STATUS: '🔄',
      RETIRE_ASSET: '🚫',
      ADD_APPROVER: '👤',
    };
    return icons[type] || '📋';
  };

  const getApprovalPercentage = (current: number, required: number) => {
    return Math.round((current / required) * 100);
  };

  if (loading && requests.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <div className="flex justify-center items-center h-32">
          <div className="text-gray-500">Loading requests...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">
        {assetId ? 'Asset Approval History' : 'All Approval Requests'}
      </h2>

      {/* Filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${
              filter === status
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Requests List */}
      {requests.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No requests found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Asset
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Approvals
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Created
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {requests.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getTypeIcon(request.requestType)}</span>
                      <span className="text-sm font-medium text-gray-900">
                        {request.requestType.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-600 font-mono">
                      {request.assetId.substring(0, 12)}...
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(request.status)}`}
                    >
                      {request.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            request.status === 'APPROVED'
                              ? 'bg-green-500'
                              : request.status === 'REJECTED'
                              ? 'bg-red-500'
                              : 'bg-blue-500'
                          }`}
                          style={{
                            width: `${getApprovalPercentage(request.currentApprovals, request.requiredApprovals)}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm text-gray-700 whitespace-nowrap">
                        {request.currentApprovals}/{request.requiredApprovals}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-600">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
