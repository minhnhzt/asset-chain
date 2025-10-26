import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// In-memory storage for proofs (will migrate to database)
const proofs = new Map<
  string,
  {
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
>();

/**
 * POST /api/multisig-proofs
 * Create a new blockchain-anchored approval proof
 *
 * Body:
 * {
 *   requestId: string,
 *   assetId: string,
 *   approvals: Array<{ approverPubkey: string, approvalStatus: 'APPROVED' | 'REJECTED', timestamp: number }>,
 *   approverCount: number,
 *   approvalThreshold: number
 * }
 *
 * Response: { proofId, status, approvalsHash, timestamp, pda? }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      requestId,
      assetId,
      approvals,
      approverCount,
      approvalThreshold,
    } = body;

    // Validate input
    if (!requestId || !assetId || !approvals || !Array.isArray(approvals)) {
      return NextResponse.json(
        { error: 'Missing or invalid required fields' },
        { status: 400 }
      );
    }

    if (approverCount < approvalThreshold) {
      return NextResponse.json(
        { error: 'Approver count cannot be less than approval threshold' },
        { status: 400 }
      );
    }

    // Generate SHA256 hash of approval data
    // This hash will be stored on-chain to prove the approvals
    const approvalsData = JSON.stringify(approvals.sort((a, b) => 
      a.approverPubkey.localeCompare(b.approverPubkey)
    ));
    const approvalsHash = crypto
      .createHash('sha256')
      .update(approvalsData)
      .digest('hex');

    // Create proof record
    const proofId = `proof_${requestId}_${Date.now()}`;
    const proof = {
      requestId,
      assetId,
      approvalsHash,
      approverCount,
      approvalThreshold,
      timestamp: Date.now(),
      status: 'ANCHORING' as const,
      pda: `${assetId}_${requestId}`, // PDA address when deployed on-chain
    };

    // Store proof
    proofs.set(proofId, proof);

    // Simulate blockchain anchoring (will call smart contract in Phase 2)
    // For now, we simulate success after a short delay
    setTimeout(() => {
      const existingProof = proofs.get(proofId);
      if (existingProof) {
        existingProof.status = 'ANCHORED';
        existingProof.txHash = `tx_${approvalsHash.substring(0, 8)}`;
      }
    }, 500);

    return NextResponse.json(
      {
        proofId,
        requestId,
        status: proof.status,
        approvalsHash,
        approverCount,
        approvalThreshold,
        timestamp: proof.timestamp,
        pda: proof.pda,
        message: 'Anchoring proof to blockchain...',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating proof:', error);
    return NextResponse.json(
      { error: 'Failed to create proof', details: String(error) },
      { status: 500 }
    );
  }
}

/**
 * GET /api/multisig-proofs
 * List all blockchain-anchored proofs with optional filtering
 *
 * Query params:
 * - requestId: Filter by request ID
 * - assetId: Filter by asset ID
 * - status: Filter by status (ANCHORING, ANCHORED, VERIFIED, FAILED)
 *
 * Response: Array of proofs
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const requestIdFilter = searchParams.get('requestId');
    const assetIdFilter = searchParams.get('assetId');
    const statusFilter = searchParams.get('status');

    let allProofs = Array.from(proofs.values());

    // Apply filters
    if (requestIdFilter) {
      allProofs = allProofs.filter(
        (p) => p.requestId === requestIdFilter
      );
    }

    if (assetIdFilter) {
      allProofs = allProofs.filter(
        (p) => p.assetId === assetIdFilter
      );
    }

    if (statusFilter) {
      allProofs = allProofs.filter(
        (p) => p.status === statusFilter
      );
    }

    // Sort by timestamp descending
    allProofs.sort((a, b) => b.timestamp - a.timestamp);

    return NextResponse.json({
      proofs: allProofs,
      total: allProofs.length,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Error fetching proofs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch proofs', details: String(error) },
      { status: 500 }
    );
  }
}
