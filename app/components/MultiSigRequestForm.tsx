'use client';

import React, { useState } from 'react';
import { MultiSigRequest } from '@/app/types';

interface MultiSigRequestFormProps {
  assetId: string;
  approvers: string[];
  requiredApprovals: number;
  onRequestCreated: (request: MultiSigRequest) => void;
  onError: (error: string) => void;
  requesterPubkey: string;
}

export default function MultiSigRequestForm({
  assetId,
  approvers,
  requiredApprovals,
  onRequestCreated,
  onError,
  requesterPubkey,
}: MultiSigRequestFormProps) {
  const [requestType, setRequestType] = useState<
    'UPDATE_METADATA' | 'CHANGE_STATUS' | 'RETIRE_ASSET' | 'ADD_APPROVER'
  >('UPDATE_METADATA');
  const [newMetadataCid, setNewMetadataCid] = useState('');
  const [newStatus, setNewStatus] = useState('1');
  const [newApproverPubkey, setNewApproverPubkey] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      // Validate based on request type
      const requestData: Record<string, string | number> = {};

      if (requestType === 'UPDATE_METADATA') {
        if (!newMetadataCid.trim()) {
          throw new Error('Please provide a metadata CID');
        }
        requestData.newMetadataCid = newMetadataCid.trim();
      } else if (requestType === 'CHANGE_STATUS') {
        requestData.newStatus = parseInt(newStatus);
      } else if (requestType === 'ADD_APPROVER') {
        if (!newApproverPubkey.trim()) {
          throw new Error('Please provide an approver wallet address');
        }
        requestData.newApproverPubkey = newApproverPubkey.trim();
      }

      const response = await fetch('/api/multisig-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestType,
          assetId,
          approvers,
          requiredApprovals,
          requestData,
          createdBy: requesterPubkey,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to create request');
      }

      setSuccess(true);
      onRequestCreated(data.request);

      // Reset form
      setNewMetadataCid('');
      setNewStatus('1');
      setNewApproverPubkey('');

      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      onError(message);
      console.error('Error creating multi-sig request:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">
        Create Approval Request
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Request Type */}
        <div>
          <label htmlFor="requestType" className="block text-sm font-medium text-gray-700 mb-2">
            Request Type
          </label>
          <select
            id="requestType"
            value={requestType}
            onChange={(e) => setRequestType(e.target.value as 'UPDATE_METADATA' | 'CHANGE_STATUS' | 'RETIRE_ASSET' | 'ADD_APPROVER')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="UPDATE_METADATA">Update Metadata</option>
            <option value="CHANGE_STATUS">Change Status</option>
            <option value="RETIRE_ASSET">Retire Asset</option>
            <option value="ADD_APPROVER">Add New Approver</option>
          </select>
        </div>

        {/* Conditional Fields */}
        {requestType === 'UPDATE_METADATA' && (
          <div>
            <label htmlFor="metadataCid" className="block text-sm font-medium text-gray-700 mb-2">
              New Metadata CID (IPFS)
            </label>
            <input
              type="text"
              id="metadataCid"
              value={newMetadataCid}
              onChange={(e) => setNewMetadataCid(e.target.value)}
              placeholder="e.g., QmVxk7..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="mt-1 text-sm text-gray-600">
              Enter the IPFS content identifier for the new metadata
            </p>
          </div>
        )}

        {requestType === 'CHANGE_STATUS' && (
          <div>
            <label htmlFor="newStatus" className="block text-sm font-medium text-gray-700 mb-2">
              New Asset Status
            </label>
            <select
              id="newStatus"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="0">Active</option>
              <option value="1">Under Maintenance</option>
              <option value="2">Retired</option>
              <option value="3">Disposed</option>
            </select>
          </div>
        )}

        {requestType === 'ADD_APPROVER' && (
          <div>
            <label htmlFor="newApprover" className="block text-sm font-medium text-gray-700 mb-2">
              New Approver Wallet Address
            </label>
            <input
              type="text"
              id="newApprover"
              value={newApproverPubkey}
              onChange={(e) => setNewApproverPubkey(e.target.value)}
              placeholder="Enter Solana wallet address"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        {/* Approval Info */}
        <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
          <p className="text-sm font-medium text-gray-700 mb-2">Approval Requirement</p>
          <p className="text-sm text-gray-600">
            This request requires <strong>{requiredApprovals} of {approvers.length}</strong> approvals from:
          </p>
          <div className="mt-2 space-y-1">
            {approvers.slice(0, 3).map((approver, idx) => (
              <p key={idx} className="text-sm text-gray-600 font-mono">
                {approver.substring(0, 8)}...{approver.substring(approver.length - 4)}
              </p>
            ))}
            {approvers.length > 3 && (
              <p className="text-sm text-gray-600">+ {approvers.length - 3} more</p>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition"
        >
          {loading ? 'Creating Request...' : 'Create Approval Request'}
        </button>

        {success && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-800 text-sm font-medium">
              ✓ Request created successfully and sent to approvers
            </p>
          </div>
        )}
      </form>
    </div>
  );
}
