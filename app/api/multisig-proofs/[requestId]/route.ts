import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Map to track proofs (shared with main route.ts)
// In production, this would be a database
interface StoredProof {
  requestId: string;
  assetId: string;
  approvalsHash: string;
  approverCount: number;
  approvalThreshold: number;
  timestamp: number;
  status: 'ANCHORING' | 'ANCHORED' | 'VERIFIED' | 'FAILED';
  txHash?: string;
  pda?: string;
  error?: string;
}

// This would be imported from a shared store in production
// For now, we'll use a simple module-level cache
const proofCache = new Map<string, StoredProof>();

// Helper function to get or create proof (mocks the proofs Map from route.ts)
function getProofFromId(requestId: string): StoredProof | undefined {
  // In production, fetch from database where requestId = param
  // For MVP, search through all proofs (inefficient but functional)
  return Array.from(proofCache.values()).find(p => p.requestId === requestId);
}

/**
 * GET /api/multisig-proofs/[requestId]
 * Get details of a specific blockchain proof
 *
 * Response: { requestId, assetId, status, approvalsHash, txHash?, pda?, timestamp }
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ requestId: string }> }
) {
  try {
    const { requestId } = await params;

    if (!requestId) {
      return NextResponse.json(
        { error: 'Request ID is required' },
        { status: 400 }
      );
    }

    // In production: query database
    // For MVP: return mock proof data
    const proof = {
      requestId,
      status: 'ANCHORED',
      approvalsHash: `hash_${requestId}`,
      approverCount: 3,
      approvalThreshold: 2,
      timestamp: Date.now() - 5000,
      txHash: `tx_${requestId}`,
      pda: `pda_${requestId}`,
      verified: true,
      verifiedAt: Date.now() - 1000,
    };

    return NextResponse.json(proof);
  } catch (error) {
    console.error('Error fetching proof:', error);
    return NextResponse.json(
      { error: 'Failed to fetch proof', details: String(error) },
      { status: 500 }
    );
  }
}

/**
 * POST /api/multisig-proofs/[requestId]/verify
 * Verify a blockchain-anchored proof
 *
 * Body:
 * {
 *   expectedHash: string (SHA256 hash of approvals to verify against),
 *   approvals?: Array (optional, for re-hashing verification)
 * }
 *
 * Response: { isValid, requestId, message, verifiedAt }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ requestId: string }> }
) {
  try {
    const { requestId } = await params;
    const body = await request.json();
    const { expectedHash, approvals } = body;

    if (!requestId) {
      return NextResponse.json(
        { error: 'Request ID is required' },
        { status: 400 }
      );
    }

    if (!expectedHash) {
      return NextResponse.json(
        { error: 'Expected hash is required for verification' },
        { status: 400 }
      );
    }

    // Verify the expected hash
    let isValid = false;
    let verificationMessage = '';

    if (approvals && Array.isArray(approvals)) {
      // Re-hash the provided approvals to verify
      const approvalsData = JSON.stringify(
        approvals.sort((a, b) => 
          a.approverPubkey.localeCompare(b.approverPubkey)
        )
      );
      const computedHash = crypto
        .createHash('sha256')
        .update(approvalsData)
        .digest('hex');

      isValid = computedHash === expectedHash;
      verificationMessage = isValid
        ? 'Approval data matches hash - proof is valid'
        : 'Approval data does not match hash - proof is invalid';
    } else {
      // In production: fetch proof from blockchain and verify
      // For MVP: simulate verification
      isValid = true;
      verificationMessage = 'Proof verified on-chain (simulated)';
    }

    const response = {
      requestId,
      isValid,
      message: verificationMessage,
      verifiedAt: Date.now(),
      expectedHash: expectedHash.substring(0, 16) + '...',
      verification: {
        type: 'PROOF_HASH_VERIFICATION',
        method: approvals ? 'LOCAL_HASH_MATCH' : 'ON_CHAIN_VERIFICATION',
        timestamp: Date.now(),
      },
    };

    return NextResponse.json(response, {
      status: isValid ? 200 : 400,
    });
  } catch (error) {
    console.error('Error verifying proof:', error);
    return NextResponse.json(
      { error: 'Failed to verify proof', details: String(error) },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/multisig-proofs/[requestId]
 * Delete a blockchain proof (for testing/cleanup)
 * Note: In production with actual on-chain proofs, deletion would be disabled
 *
 * Response: { success, requestId, message }
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ requestId: string }> }
) {
  try {
    const { requestId } = await params;

    if (!requestId) {
      return NextResponse.json(
        { error: 'Request ID is required' },
        { status: 400 }
      );
    }

    // In production: would be restricted or disabled
    // For MVP: allow deletion for testing
    return NextResponse.json({
      success: true,
      requestId,
      message: 'Proof deleted (development only)',
    });
  } catch (error) {
    console.error('Error deleting proof:', error);
    return NextResponse.json(
      { error: 'Failed to delete proof', details: String(error) },
      { status: 500 }
    );
  }
}
