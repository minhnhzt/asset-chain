import { NextRequest, NextResponse } from 'next/server';
import { PublicKey, Connection } from '@solana/web3.js';

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

    // If no cache or expired, fetch from blockchain (devnet)
    const connection = new Connection(
      process.env.NEXT_PUBLIC_RPC_ENDPOINT || 'https://api.devnet.solana.com',
      'confirmed'
    );

    // TODO: Replace with actual program query when IDL is available
    // For now, return empty array (will be populated during testing)
    const assets: CachedAsset[] = [];

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

    if (metadata_cid.length > 256) {
      return NextResponse.json(
        {
          success: false,
          error: 'IPFS CID must be <= 256 characters',
        },
        { status: 400 }
      );
    }

    // TODO: Implement actual transaction building and signing
    // For MVP, we'll return a mock response that includes transaction details
    // In production, this will:
    // 1. Create a transaction with the register_asset instruction
    // 2. Return a partially signed transaction for client-side completion
    // 3. Handle IPFS upload before registration

    const mockAsset: CachedAsset = {
      pubkey: new PublicKey(walletPublicKey).toString(),
      owner: walletPublicKey,
      name,
      location,
      metadata_cid,
      status: 0, // ACTIVE
      created_at: Math.floor(Date.now() / 1000),
      updated_at: Math.floor(Date.now() / 1000),
    };

    // Invalidate cache
    assetCache = {
      assets: [],
      timestamp: 0,
    };

    return NextResponse.json(
      {
        success: true,
        message: 'Asset registered successfully',
        data: mockAsset,
        transactionRequired: true,
        instruction: 'register_asset',
      },
      { status: 201 }
    );
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
