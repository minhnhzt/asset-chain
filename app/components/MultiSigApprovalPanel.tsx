'use client';

import React, { useEffect, useState } from 'react';
import { MultiSigRequest } from '@/app/types';
import MultiSigProofStatus from './MultiSigProofStatus';

interface MultiSigApprovalPanelProps {
  approverPubkey: string;
  onApprovalSubmitted: (request: MultiSigRequest) => void;
  onError: (error: string) => void;
}

export default function MultiSigApprovalPanel({
  approverPubkey,
  onApprovalSubmitted,
  onError,
}: MultiSigApprovalPanelProps) {
  const [requests, setRequests] = useState<MultiSigRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectionMessage, setRejectionMessage] = useState<{
    [key: string]: string;
  }>({});

  useEffect(() => {
    fetchPendingRequests();
    const interval = setInterval(fetchPendingRequests, 5000); // Refresh every 5s
    return () => clearInterval(interval);
  }, []);

  const fetchPendingRequests = async () => {
    try {
      const response = await fetch(
        `/api/multisig-requests?approver=${approverPubkey}&status=PENDING`
      );
      const data = await response.json();

      if (data.success) {
        setRequests(data.requests || []);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  };

  const handleApprove = async (requestId: string) => {
    setProcessingId(requestId);

    try {
      const response = await fetch(
        `/api/multisig-requests/${requestId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            approverPubkey,
            approvalStatus: 'APPROVED',
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to approve');
      }

      onApprovalSubmitted(data.request);
      setRequests(requests.filter(r => r.id !== requestId));
      setRejectionMessage({
        ...rejectionMessage,
        [requestId]: '',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      onError(message);
      console.error('Error approving request:', error);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (requestId: string) => {
    setProcessingId(requestId);

    try {
      const response = await fetch(
        `/api/multisig-requests/${requestId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            approverPubkey,
            approvalStatus: 'REJECTED',
            approvalMessage: rejectionMessage[requestId] || undefined,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to reject');
      }

      onApprovalSubmitted(data.request);
      setRequests(requests.filter(r => r.id !== requestId));
      setRejectionMessage({
        ...rejectionMessage,
        [requestId]: '',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      onError(message);
      console.error('Error rejecting request:', error);
    } finally {
      setProcessingId(null);
    }
  };

  const getRequestTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      UPDATE_METADATA: 'Update Metadata',
      CHANGE_STATUS: 'Change Asset Status',
      RETIRE_ASSET: 'Retire Asset',
      ADD_APPROVER: 'Add New Approver',
    };
    return labels[type] || type;
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
      EXECUTED: 'bg-blue-100 text-blue-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getProgressPercentage = (current: number, required: number) => {
    return Math.round((current / required) * 100);
  };

  if (requests.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">Pending Approvals</h2>
        <p className="text-gray-600">No pending approval requests for you.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">
        Pending Approvals ({requests.length})
      </h2>

      <div className="space-y-4">
        {requests.map((request) => (
          <div
            key={request.id}
            className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {getRequestTypeLabel(request.requestType)}
                </h3>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(request.status)}`}>
                    {request.status}
                  </span>
                  <span className="text-sm text-gray-600">
                    ID: {request.id}
                  </span>
                </div>
              </div>
              <div className="text-sm text-gray-600">
                {new Date(request.createdAt).toLocaleDateString()}
              </div>
            </div>

            {/* Request Details */}
            <div className="bg-gray-50 p-3 rounded mb-4 text-sm">
              <p className="text-gray-700">
                <strong>Asset ID:</strong> {request.assetId}
              </p>
              {request.requestData.newMetadataCid && (
                <p className="text-gray-700 mt-1">
                  <strong>New CID:</strong> {request.requestData.newMetadataCid.substring(0, 16)}...
                </p>
              )}
              {request.requestData.newStatus !== undefined && (
                <p className="text-gray-700 mt-1">
                  <strong>New Status:</strong> {
                    ['Active', 'Maintenance', 'Retired', 'Disposed'][
                      request.requestData.newStatus
                    ]
                  }
                </p>
              )}
            </div>

            {/* Progress */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Approvals
                </span>
                <span className="text-sm text-gray-600">
                  {request.currentApprovals}/{request.requiredApprovals}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{
                    width: `${getProgressPercentage(
                      request.currentApprovals,
                      request.requiredApprovals
                    )}%`,
                  }}
                />
              </div>
            </div>

            {/* Rejection Message Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rejection Reason (optional)
              </label>
              <textarea
                value={rejectionMessage[request.id] || ''}
                onChange={(e) =>
                  setRejectionMessage({
                    ...rejectionMessage,
                    [request.id]: e.target.value,
                  })
                }
                placeholder="Why are you rejecting this request?"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
              />
            </div>

            {/* Blockchain Proof Status - NEW */}
            <MultiSigProofStatus request={request} isLoading={processingId === request.id} />

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => handleApprove(request.id)}
                disabled={processingId === request.id}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 font-medium text-sm transition"
              >
                {processingId === request.id ? 'Processing...' : 'Approve'}
              </button>
              <button
                onClick={() => handleReject(request.id)}
                disabled={processingId === request.id}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 font-medium text-sm transition"
              >
                {processingId === request.id ? 'Processing...' : 'Reject'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
