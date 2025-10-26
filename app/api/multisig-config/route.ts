import { NextRequest, NextResponse } from 'next/server';
import { AssetMultiSigConfig } from '@/app/types';

// In-memory storage (use database in production)
const multiSigConfigs: Map<string, AssetMultiSigConfig> = new Map();

/**
 * GET /api/multisig-config
 * Fetch multi-sig configuration for an asset
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const assetId = searchParams.get('assetId');

    if (!assetId) {
      return NextResponse.json(
        { success: false, error: 'assetId query parameter required' },
        { status: 400 }
      );
    }

    const config = multiSigConfigs.get(assetId);

    if (!config) {
      return NextResponse.json(
        {
          success: true,
          config: null,
          message: 'No multi-sig configuration for this asset',
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        config,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching multi-sig config:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch configuration' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/multisig-config
 * Create or update multi-sig configuration for an asset
 * Requires M-of-N approval from current approvers
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { assetId, approvers, requiredApprovals, owner } = body;

    // Validation
    if (!assetId || !approvers || !requiredApprovals || !owner) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: assetId, approvers, requiredApprovals, owner',
        },
        { status: 400 }
      );
    }

    if (!Array.isArray(approvers) || approvers.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Approvers must be a non-empty array' },
        { status: 400 }
      );
    }

    if (requiredApprovals <= 0 || requiredApprovals > approvers.length) {
      return NextResponse.json(
        {
          success: false,
          error: 'requiredApprovals must be between 1 and total approvers',
        },
        { status: 400 }
      );
    }

    // Create or update configuration
    const config: AssetMultiSigConfig = {
      assetId,
      approvers,
      requiredApprovals,
      totalApprovers: approvers.length,
      createdAt: multiSigConfigs.has(assetId)
        ? multiSigConfigs.get(assetId)!.createdAt
        : Date.now(),
      updatedAt: Date.now(),
      owner,
    };

    multiSigConfigs.set(assetId, config);

    return NextResponse.json(
      {
        success: true,
        message: 'Multi-sig configuration saved',
        config,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error saving multi-sig config:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save configuration' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/multisig-config
 * Remove multi-sig configuration from an asset (set to single-sig)
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const assetId = searchParams.get('assetId');

    if (!assetId) {
      return NextResponse.json(
        { success: false, error: 'assetId query parameter required' },
        { status: 400 }
      );
    }

    if (!multiSigConfigs.has(assetId)) {
      return NextResponse.json(
        { success: false, error: 'Configuration not found' },
        { status: 404 }
      );
    }

    multiSigConfigs.delete(assetId);

    return NextResponse.json(
      {
        success: true,
        message: 'Multi-sig configuration removed',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting multi-sig config:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete configuration' },
      { status: 500 }
    );
  }
}
