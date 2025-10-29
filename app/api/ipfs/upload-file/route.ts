import { NextRequest, NextResponse } from 'next/server';
import { uploadFileToPinata, getIPFSUrl } from '@/app/lib/pinata';

/**
 * POST /api/ipfs/upload-file
 * Upload a file (image, document, etc.) to IPFS via Pinata
 * Body: FormData with 'file' field
 * Returns: { success, cid, url }
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: 'No file provided - include a file in the "file" field',
        },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB for MVP)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        {
          success: false,
          error: `File too large - max size is ${maxSize / 1024 / 1024}MB`,
        },
        { status: 400 }
      );
    }

    // Upload to Pinata
    const result = await uploadFileToPinata(file, file.name);

    return NextResponse.json(
      {
        success: true,
        cid: result.IpfsHash,
        size: result.PinSize,
        timestamp: result.Timestamp,
        url: getIPFSUrl(result.IpfsHash),
        fileName: file.name,
        fileType: file.type,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/ipfs/upload-file error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to upload file to IPFS',
      },
      { status: 500 }
    );
  }
}
