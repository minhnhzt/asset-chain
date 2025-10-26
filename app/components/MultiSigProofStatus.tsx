'use client';

import { useState } from 'react';
import { MultiSigRequest } from '@/app/types';

interface MultiSigProofStatusProps {
  request: MultiSigRequest;
  onAnchorProof?: (requestId: string) => Promise<void>;
  onVerifyProof?: (requestId: string) => Promise<void>;
  isLoading?: boolean;
}

export default function MultiSigProofStatus({
  request,
  onAnchorProof,
  onVerifyProof,
  isLoading = false,
}: MultiSigProofStatusProps) {
  const [isAnchoring, setIsAnchoring] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const proof = request.blockchainProof;

  // Color mapping for status
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'NOT_ANCHORED':
        return 'bg-gray-100 text-gray-700 border-gray-300';
      case 'ANCHORING':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'ANCHORED':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'VERIFIED':
        return 'bg-emerald-100 text-emerald-700 border-emerald-300';
      case 'FAILED':
        return 'bg-red-100 text-red-700 border-red-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  // Status icon
  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'NOT_ANCHORED':
        return '⊘';
      case 'ANCHORING':
        return '⟳';
      case 'ANCHORED':
        return '⛓';
      case 'VERIFIED':
        return '✓';
      case 'FAILED':
        return '✕';
      default:
        return '?';
    }
  };

  // Status label
  const getStatusLabel = (status?: string) => {
    switch (status) {
      case 'NOT_ANCHORED':
        return 'Not Anchored';
      case 'ANCHORING':
        return 'Anchoring...';
      case 'ANCHORED':
        return 'Anchored';
      case 'VERIFIED':
        return 'Verified';
      case 'FAILED':
        return 'Failed';
      default:
        return 'Unknown';
    }
  };

  const handleAnchorProof = async () => {
    if (!onAnchorProof || !request.blockchainProof || isLoading) return;

    try {
      setIsAnchoring(true);
      await onAnchorProof(request.id);
    } catch (error) {
      console.error('Error anchoring proof:', error);
    } finally {
      setIsAnchoring(false);
    }
  };

  const handleVerifyProof = async () => {
    if (!onVerifyProof || !request.blockchainProof || isLoading) return;

    try {
      setIsVerifying(true);
      await onVerifyProof(request.id);
    } catch (error) {
      console.error('Error verifying proof:', error);
    } finally {
      setIsVerifying(false);
    }
  };

  // If request is not approved, don't show proof section
  if (request.status !== 'APPROVED' && request.status !== 'EXECUTED') {
    return null;
  }

  return (
    <div className="mt-4 border border-gray-200 rounded-lg p-4 bg-white">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-sm text-gray-900">
          🔐 Blockchain Proof
        </h4>
        <span className={`px-2 py-1 text-xs font-medium rounded border ${getStatusColor(
          proof?.status
        )}`}>
          {getStatusIcon(proof?.status)} {getStatusLabel(proof?.status)}
        </span>
      </div>

      {/* Proof Details */}
      {proof ? (
        <div className="space-y-2 mb-3">
          {proof.proofId && (
            <div className="flex justify-between">
              <span className="text-xs text-gray-600">Proof ID:</span>
              <span className="text-xs font-mono text-gray-800">
                {proof.proofId.substring(0, 20)}...
              </span>
            </div>
          )}

          {proof.approvalsHash && (
            <div className="flex justify-between">
              <span className="text-xs text-gray-600">Hash:</span>
              <span className="text-xs font-mono text-gray-800">
                {proof.approvalsHash.substring(0, 16)}...
              </span>
            </div>
          )}

          {proof.txHash && (
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">TX Hash:</span>
              <a
                href={`https://explorer.solana.com/tx/${proof.txHash}?cluster=devnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-mono text-blue-600 hover:text-blue-800 underline"
              >
                View on Solscan ↗
              </a>
            </div>
          )}

          {proof.pda && (
            <div className="flex justify-between">
              <span className="text-xs text-gray-600">PDA:</span>
              <span className="text-xs font-mono text-gray-800">
                {proof.pda.substring(0, 20)}...
              </span>
            </div>
          )}

          {proof.anchoredAt && (
            <div className="flex justify-between">
              <span className="text-xs text-gray-600">Anchored:</span>
              <span className="text-xs text-gray-800">
                {new Date(proof.anchoredAt).toLocaleString()}
              </span>
            </div>
          )}

          {proof.error && (
            <div className="flex justify-between">
              <span className="text-xs text-red-600">Error:</span>
              <span className="text-xs text-red-800">{proof.error}</span>
            </div>
          )}
        </div>
      ) : (
        <p className="text-xs text-gray-600 mb-3">
          No blockchain proof anchored yet. Anchor to create immutable proof on-chain.
        </p>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        {(!proof || proof.status === 'NOT_ANCHORED' || proof.status === 'FAILED') && (
          <button
            onClick={handleAnchorProof}
            disabled={isLoading || isAnchoring}
            className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
          >
            {isAnchoring ? '⟳ Anchoring...' : '⛓ Anchor Proof'}
          </button>
        )}

        {proof && ['ANCHORED', 'VERIFIED'].includes(proof.status) && (
          <button
            onClick={handleVerifyProof}
            disabled={isLoading || isVerifying || proof.status === 'VERIFIED'}
            className="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
          >
            {isVerifying
              ? '✓ Verifying...'
              : proof.status === 'VERIFIED'
              ? '✓ Verified'
              : '✓ Verify Proof'}
          </button>
        )}

        {proof && proof.txHash && (
          <a
            href={`https://explorer.solana.com/tx/${proof.txHash}?cluster=devnet`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 px-3 py-2 bg-gray-200 text-gray-800 text-sm rounded hover:bg-gray-300 transition text-center"
          >
            🔗 Explorer
          </a>
        )}
      </div>

      {/* Info Message */}
      {!proof && (
        <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
          💡 <strong>Tip:</strong> After approval, anchor this request to blockchain for immutable proof.
          Cost: ~$0.0001 SOL (optional)
        </div>
      )}
    </div>
  );
}
