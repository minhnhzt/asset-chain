import { NextRequest, NextResponse } from 'next/server';
import { PublicKey, Connection } from '@solana/web3.js';
import { AnchorProvider, Program } from '@coral-xyz/anchor';
import { SOLANA_CONFIG } from '@/app/config/solana';
import { createConnection, getAssetRegistryProgram, formatAssetStatus } from '@/app/lib/blockchain';

// Import IDL
import AssetRegistryIDL from '../../../target/idl/asset_registry.json';

// Cache for assets (in-memory, will be replaced with Redis in production)
interface CachedAsset {
  pubkey: string;
  owner: string;
  name: string;
  location: string;
  metadata_cid: string;
  status: number;
  created_at: number;
  updated_at: number;
}

interface AssetCache {
  assets: CachedAsset[];
  timestamp: number;
}

let assetCache: AssetCache = {
  assets: [],
  timestamp: 0,
};

const CACHE_TTL = 60 * 1000; // 60 seconds

/**
 * GET /api/assets
 * Fetch all registered assets with basic caching
 * Requirement: Listing 100 assets < 2s
 */
export async function GET(request: NextRequest) {
  try {
    // Check cache validity
    const now = Date.now();
    if (assetCache.assets.length > 0 && now - assetCache.timestamp < CACHE_TTL) {
      return NextResponse.json(
        {
          success: true,
          data: assetCache.assets,
          cached: true,
          count: assetCache.assets.length,
        },
        { status: 200 }
      );
    }

    // Fetch from blockchain
    const connection = createConnection();
    const programId = new PublicKey(SOLANA_CONFIG.programs.assetRegistry);

    // Get all asset accounts
    const accounts = await connection.getProgramAccounts(programId, {
      filters: [
        {
          // Filter for Asset accounts (discriminator check)
          dataSize: 8 + 32 + 128 + 256 + 256 + 1 + 8 + 8 + 1, // Approximate asset account size
        },
      ],
    });

    const assets: CachedAsset[] = accounts.map((account) => {
      try {
        // Parse account data (simplified - in production, use Anchor's deserialization)
        const data = account.account.data;
        
        // TODO: Properly deserialize using Anchor
        // For now, return basic info
        return {
          pubkey: account.pubkey.toString(),
          owner: '', // Will be parsed from account data
          name: '', // Will be parsed from account data
          location: '', // Will be parsed from account data
          metadata_cid: '', // Will be parsed from account data
          status: 0, // Will be parsed from account data
          created_at: Math.floor(Date.now() / 1000),
          updated_at: Math.floor(Date.now() / 1000),
        };
      } catch (err) {
        console.error('Error parsing asset account:', err);
        return null;
      }
    }).filter((asset): asset is CachedAsset => asset !== null);

    // Update cache
    assetCache = {
      assets,
      timestamp: now,
    };

    return NextResponse.json(
      {
        success: true,
        data: assets,
        cached: false,
        count: assets.length,
        network: SOLANA_CONFIG.network,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('GET /api/assets error:', error);
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
 * POST /api/assets
 * Register a new asset
 * Body: { name, location, metadata_cid, walletPublicKey }
 * 
 * This endpoint returns transaction instructions for client-side signing
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, location, metadata_cid, walletPublicKey } = body;

    // Validate inputs
    if (!name || !location || !metadata_cid || !walletPublicKey) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: name, location, metadata_cid, walletPublicKey',
        },
        { status: 400 }
      );
    }

    if (name.length > 128) {
      return NextResponse.json(
        {
          success: false,
          error: 'Asset name must be <= 128 characters',
        },
        { status: 400 }
      );
    }

    if (location.length > 256) {
      return NextResponse.json(
        {
          success: false,
          error: 'Location must be <= 256 characters',
        },
        { status: 400 }
      );
    }

    if (metadata_cid.length > 64) {
      return NextResponse.json(
        {
          success: false,
          error: 'IPFS CID must be <= 64 characters',
        },
        { status: 400 }
      );
    }

    // Derive the asset PDA
    const owner = new PublicKey(walletPublicKey);
    const programId = new PublicKey(SOLANA_CONFIG.programs.assetRegistry);
    
    const [assetPda, assetBump] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('asset'),
        owner.toBuffer(),
        Buffer.from(name),
      ],
      programId
    );

    // Return transaction building instructions for the client
    // The client will use this to build and sign the transaction
    const response = {
      success: true,
      message: 'Asset registration data prepared',
      data: {
        owner: owner.toString(),
        name,
        location,
        metadata_cid,
        assetPda: assetPda.toString(),
        assetBump,
        programId: programId.toString(),
      },
      // Instructions for client-side transaction building
      instructions: {
        program: 'asset_registry',
        method: 'register_asset',
        accounts: {
          asset: assetPda.toString(),
          owner: owner.toString(),
          systemProgram: 'SystemProgram',
        },
        args: {
          name,
          location,
          metadata_cid,
        },
      },
    };

    // Invalidate cache
    assetCache = {
      assets: [],
      timestamp: 0,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('POST /api/assets error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
