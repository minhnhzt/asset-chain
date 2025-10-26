import { NextRequest, NextResponse } from 'next/server';
import { PublicKey } from '@solana/web3.js';
import { uploadMaintenanceDetails } from '@/app/lib/pinata';

interface MaintenanceLogEntry {
  performer: string;
  note: string;
  timestamp: number;
  ipfs_cid: string;
}

/**
 * GET /api/maintenance-logs?assetId=...
 * Fetch maintenance logs for a specific asset
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const assetId = searchParams.get('assetId');

    if (!assetId) {
      return NextResponse.json(
        {
          success: false,
          error: 'assetId query parameter is required',
        },
        { status: 400 }
      );
    }

    // Validate assetId is a valid Pubkey
    try {
      new PublicKey(assetId);
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid assetId format',
        },
        { status: 400 }
      );
    }

    // TODO: Query maintenance log account from blockchain
    // For MVP, return empty array
    const entries: MaintenanceLogEntry[] = [];

    return NextResponse.json(
      {
        success: true,
        data: entries,
        count: entries.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('GET /api/maintenance-logs error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/maintenance-logs
 * Add a maintenance log entry
 * Body: { assetId, note, action, performerPublicKey, walletPublicKey }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { assetId, note, action, performerPublicKey, walletPublicKey } = body;

    // Validate inputs
    if (!assetId || !note || !action || !performerPublicKey || !walletPublicKey) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: assetId, note, action, performerPublicKey, walletPublicKey',
        },
        { status: 400 }
      );
    }

    // Validate public keys
    try {
      new PublicKey(assetId);
      new PublicKey(performerPublicKey);
      new PublicKey(walletPublicKey);
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid public key format',
        },
        { status: 400 }
      );
    }

    // Validate note length
    if (note.length > 128) {
      return NextResponse.json(
        {
          success: false,
          error: 'Note must be <= 128 characters',
        },
        { status: 400 }
      );
    }

    // Upload maintenance details to Pinata
    const ipfsCid = await uploadMaintenanceDetails({
      assetId,
      performer: performerPublicKey,
      action,
      notes: note,
      timestamp: new Date().toISOString(),
    });

    const mockEntry: MaintenanceLogEntry = {
      performer: performerPublicKey,
      note,
      timestamp: Math.floor(Date.now() / 1000),
      ipfs_cid: ipfsCid,
    };

    return NextResponse.json(
      {
        success: true,
        message: 'Maintenance log entry added successfully',
        data: mockEntry,
        ipfsCid,
        transactionRequired: true,
        instruction: 'add_maintenance_log',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/maintenance-logs error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
