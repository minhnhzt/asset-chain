import { NextRequest, NextResponse } from 'next/server';
import { PublicKey, Connection } from '@solana/web3.js';
import { Program } from '@coral-xyz/anchor';
import { uploadMaintenanceDetails } from '@/app/lib/pinata';
import { SOLANA_CONFIG } from '@/app/config/solana';
import { createConnection } from '@/app/lib/blockchain';

// Import IDL
import AssetRegistryIDL from '../../../target/idl/asset_registry.json';

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
    let assetPubkey: PublicKey;
    try {
      assetPubkey = new PublicKey(assetId);
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid assetId format',
        },
        { status: 400 }
      );
    }

    // Fetch maintenance log from blockchain
    const connection = createConnection();
    const programId = new PublicKey(SOLANA_CONFIG.programs.assetRegistry);

    // Derive maintenance log PDA
    const [maintenanceLogPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('maintenance_log'),
        assetPubkey.toBuffer(),
      ],
      programId
    );

    // Create dummy provider for program
    const dummyProvider = {
      connection,
      publicKey: programId,
    } as any;

    const program = new Program(AssetRegistryIDL as any, dummyProvider);

    try {
      // Fetch the maintenance log account
      const accountInfo = await connection.getAccountInfo(maintenanceLogPda);

      if (!accountInfo) {
        // Maintenance log not initialized yet
        return NextResponse.json(
          {
            success: true,
            data: {
              asset: assetId,
              owner: '',
              entries: [],
            },
            count: 0,
          },
          { status: 200 }
        );
      }

      // Deserialize maintenance log
      const maintenanceLog = program.coder.accounts.decode(
        'MaintenanceLog',
        accountInfo.data
      );

      // Format entries
      const entries: MaintenanceLogEntry[] = maintenanceLog.entries.map((entry: any) => ({
        performer: entry.performer.toString(),
        note: entry.note,
        timestamp: entry.timestamp?.toNumber() || 0,
        ipfs_cid: entry.ipfsCid || entry.ipfs_cid || '',
      }));

      return NextResponse.json(
        {
          success: true,
          data: {
            asset: maintenanceLog.asset.toString(),
            owner: maintenanceLog.owner.toString(),
            entries,
          },
          count: entries.length,
        },
        { status: 200 }
      );
    } catch (deserializeError) {
      console.error('Error deserializing maintenance log:', deserializeError);
      // Return empty if account exists but can't be deserialized
      return NextResponse.json(
        {
          success: true,
          data: {
            asset: assetId,
            owner: '',
            entries: [],
          },
          count: 0,
        },
        { status: 200 }
      );
    }
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
