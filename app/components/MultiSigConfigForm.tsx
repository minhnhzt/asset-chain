'use client';

import React, { useState } from 'react';
import { AssetMultiSigConfig } from '@/app/types';

interface MultiSigConfigFormProps {
  assetId: string;
  onConfigCreated: (config: AssetMultiSigConfig) => void;
  onError: (error: string) => void;
  ownerPubkey: string;
}

export default function MultiSigConfigForm({
  assetId,
  onConfigCreated,
  onError,
  ownerPubkey,
}: MultiSigConfigFormProps) {
  const [approverInputs, setApproverInputs] = useState<string[]>(['']);
  const [requiredApprovals, setRequiredApprovals] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleApproverChange = (index: number, value: string) => {
    const newInputs = [...approverInputs];
    newInputs[index] = value;
    setApproverInputs(newInputs);
  };

  const handleAddApprover = () => {
    setApproverInputs([...approverInputs, '']);
  };

  const handleRemoveApprover = (index: number) => {
    setApproverInputs(approverInputs.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      // Filter out empty approver entries
      const approvers = approverInputs
        .filter(a => a.trim().length > 0)
        .map(a => a.trim());

      if (approvers.length === 0) {
        throw new Error('At least one approver is required');
      }

      if (requiredApprovals > approvers.length) {
        throw new Error('Required approvals cannot exceed number of approvers');
      }

      if (requiredApprovals < 1) {
        throw new Error('At least 1 approval is required');
      }

      const response = await fetch('/api/multisig-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assetId,
          approvers,
          requiredApprovals,
          owner: ownerPubkey,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to create configuration');
      }

      setSuccess(true);
      onConfigCreated(data.config);
      
      // Reset form
      setApproverInputs(['']);
      setRequiredApprovals(1);
      
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      onError(message);
      console.error('Error creating multi-sig config:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">
        Configure Multi-Signature
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Approvers List */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Add Approvers (Solana Wallet Addresses)
          </label>
          
          <div className="space-y-3">
            {approverInputs.map((approver, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={approver}
                  onChange={(e) => handleApproverChange(index, e.target.value)}
                  placeholder="Enter Solana wallet address (e.g., 7xL...)"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {approverInputs.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveApprover(index)}
                    className="px-3 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 text-sm font-medium"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleAddApprover}
            className="mt-3 px-4 py-2 bg-blue-50 text-blue-700 border border-blue-300 rounded-md hover:bg-blue-100 text-sm font-medium transition"
          >
            + Add Another Approver
          </button>
        </div>

        {/* Required Approvals */}
        <div>
          <label htmlFor="requiredApprovals" className="block text-sm font-medium text-gray-700 mb-2">
            Required Approvals (M-of-N)
          </label>
          <div className="flex items-center gap-4">
            <input
              type="number"
              id="requiredApprovals"
              min="1"
              max={approverInputs.filter(a => a.trim()).length || 1}
              value={requiredApprovals}
              onChange={(e) => setRequiredApprovals(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-600">
              of {approverInputs.filter(a => a.trim()).length} approvers required
            </span>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || approverInputs.filter(a => a.trim()).length === 0}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition"
        >
          {loading ? 'Setting up...' : 'Configure Multi-Signature'}
        </button>

        {success && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-800 text-sm font-medium">
              ✓ Multi-signature configuration created successfully
            </p>
          </div>
        )}
      </form>

      <div className="mt-6 p-4 bg-blue-50 rounded-md border border-blue-200">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">How it works:</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Add wallet addresses of people who will approve changes</li>
          <li>• Set how many approvals are needed (e.g., 2 of 3)</li>
          <li>• All future modifications to this asset require these approvals</li>
        </ul>
      </div>
    </div>
  );
}
