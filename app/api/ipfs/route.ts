import { NextRequest, NextResponse } from 'next/server';
import { uploadJSONToPinata, getIPFSUrl } from '@/app/lib/pinata';

/**
 * POST /api/ipfs
 * Upload JSON metadata to IPFS via Pinata
 * Body: JSON object (metadata)
 * Returns: { success, cid }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request body - must be a JSON object',
        },
        { status: 400 }
      );
    }

    // Upload to Pinata
    const result = await uploadJSONToPinata(body, body.name || 'metadata.json');

    return NextResponse.json(
      {
        success: true,
        cid: result.IpfsHash,
        size: result.PinSize,
        timestamp: result.Timestamp,
        url: getIPFSUrl(result.IpfsHash),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/ipfs error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to upload to IPFS',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/ipfs?cid=...
 * Fetch metadata from IPFS by CID
 * Returns: JSON metadata
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const cid = searchParams.get('cid');

    if (!cid) {
      return NextResponse.json(
        {
          success: false,
          error: 'cid query parameter is required',
        },
        { status: 400 }
      );
    }

    // Fetch from IPFS gateway
    const ipfsUrl = getIPFSUrl(cid);
    const response = await fetch(ipfsUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch from IPFS: ${response.statusText}`);
    }

    const metadata = await response.json();

    return NextResponse.json(metadata, { status: 200 });
  } catch (error) {
    console.error('GET /api/ipfs error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch from IPFS',
      },
      { status: 500 }
    );
  }
}
