import { NextRequest, NextResponse } from 'next/server';
import { MultiSigRequest } from '@/app/types';

// This would be shared with the main multisig-requests route in production
const multiSigRequests: Map<string, MultiSigRequest> = new Map();

/**
 * POST /api/multisig-requests/[requestId]
 * Approve or reject a multi-sig request
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ requestId: string }> }
) {
  try {
    const { requestId } = await params;
    const body = await request.json();
    const { approverPubkey, approvalStatus } = body;

    if (!approverPubkey || !approvalStatus) {
      return NextResponse.json(
        { success: false, error: 'Missing approverPubkey or approvalStatus' },
        { status: 400 }
      );
    }

    if (!['APPROVED', 'REJECTED'].includes(approvalStatus)) {
      return NextResponse.json(
        { success: false, error: 'Invalid approvalStatus' },
        { status: 400 }
      );
    }

    const multiSigRequest = multiSigRequests.get(requestId);
    if (!multiSigRequest) {
      return NextResponse.json(
        { success: false, error: 'Request not found' },
        { status: 404 }
      );
    }

    // Check if approver is authorized
    if (!multiSigRequest.approvers.includes(approverPubkey)) {
      return NextResponse.json(
        { success: false, error: 'Not an authorized approver' },
        { status: 403 }
      );
    }

    // Check if already approved/rejected
    if (
      multiSigRequest.approvedBy.includes(approverPubkey) ||
      multiSigRequest.rejectedBy.includes(approverPubkey)
    ) {
      return NextResponse.json(
        { success: false, error: 'Already voted on this request' },
        { status: 400 }
      );
    }

    // Process approval/rejection
    if (approvalStatus === 'APPROVED') {
      multiSigRequest.approvedBy.push(approverPubkey);
      multiSigRequest.currentApprovals += 1;
    } else {
      multiSigRequest.rejectedBy.push(approverPubkey);
      multiSigRequest.status = 'REJECTED';
    }

    multiSigRequest.updatedAt = Date.now();

    // Check if we have enough approvals
    if (multiSigRequest.currentApprovals >= multiSigRequest.requiredApprovals) {
      multiSigRequest.status = 'APPROVED';
    }

    // Check if we have too many rejections (majority rejects)
    const rejectionThreshold = Math.ceil(multiSigRequest.approvers.length / 2);
    if (multiSigRequest.rejectedBy.length >= rejectionThreshold) {
      multiSigRequest.status = 'REJECTED';
    }

    return NextResponse.json(
      {
        success: true,
        message: `Request ${approvalStatus.toLowerCase()} successfully`,
        request: multiSigRequest,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error processing approval:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process approval' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/multisig-requests/[requestId]
 * Get details of a specific multi-sig request
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ requestId: string }> }
) {
  try {
    const { requestId } = await params;

    const multiSigRequest = multiSigRequests.get(requestId);
    if (!multiSigRequest) {
      return NextResponse.json(
        { success: false, error: 'Request not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        request: multiSigRequest,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching request:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch request' },
      { status: 500 }
    );
  }
}
