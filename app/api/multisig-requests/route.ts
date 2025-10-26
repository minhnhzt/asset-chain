import { NextRequest, NextResponse } from 'next/server';
import { MultiSigRequest } from '@/app/types';

// In-memory storage for multi-sig requests (in production, use database)
const multiSigRequests: Map<string, MultiSigRequest> = new Map();
let requestIdCounter = 1;

/**
 * GET /api/multisig-requests
 * Fetch all multi-sig requests or filter by status/asset
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const assetId = searchParams.get('assetId');
    const approverPubkey = searchParams.get('approver');

    let results = Array.from(multiSigRequests.values());

    // Filter by status if provided
    if (status) {
      results = results.filter(r => r.status === status);
    }

    // Filter by asset ID if provided
    if (assetId) {
      results = results.filter(r => r.assetId === assetId);
    }

    // Filter by approver (requests where user is an approver)
    if (approverPubkey) {
      results = results.filter(r => r.approvers.includes(approverPubkey));
    }

    return NextResponse.json({
      success: true,
      count: results.length,
      requests: results.sort((a, b) => b.createdAt - a.createdAt),
    });
  } catch (error) {
    console.error('Error fetching multi-sig requests:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch requests' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/multisig-requests
 * Create a new multi-sig approval request
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      requestType,
      assetId,
      approvers,
      requiredApprovals,
      requestData,
      createdBy,
    } = body;

    // Validation
    if (
      !requestType ||
      !assetId ||
      !approvers ||
      !requiredApprovals ||
      !createdBy
    ) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: requestType, assetId, approvers, requiredApprovals, createdBy',
        },
        { status: 400 }
      );
    }

    if (
      ![
        'UPDATE_METADATA',
        'CHANGE_STATUS',
        'RETIRE_ASSET',
        'ADD_APPROVER',
      ].includes(requestType)
    ) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid requestType',
        },
        { status: 400 }
      );
    }

    if (requiredApprovals > approvers.length) {
      return NextResponse.json(
        {
          success: false,
          error: 'Required approvals cannot exceed number of approvers',
        },
        { status: 400 }
      );
    }

    // Create new request
    const newRequest: MultiSigRequest = {
      id: `req_${requestIdCounter++}`,
      requestType,
      assetId,
      requiredApprovals,
      currentApprovals: 0,
      approvers,
      approvedBy: [],
      rejectedBy: [],
      requestData: requestData || {},
      status: 'PENDING',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      createdBy,
    };

    multiSigRequests.set(newRequest.id, newRequest);

    return NextResponse.json(
      {
        success: true,
        message: 'Multi-sig request created successfully',
        request: newRequest,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating multi-sig request:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create request' },
      { status: 500 }
    );
  }
}
