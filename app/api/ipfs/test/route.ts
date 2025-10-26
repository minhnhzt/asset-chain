import { NextResponse } from 'next/server';
import { testPinataConnection } from '@/app/lib/pinata';

/**
 * GET /api/ipfs/test
 * Test Pinata connection and credentials
 */
export async function GET() {
  try {
    const isConnected = await testPinataConnection();
    
    if (isConnected) {
      return NextResponse.json(
        {
          success: true,
          message: 'Pinata connection successful',
          connected: true,
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        {
          success: false,
          message: 'Pinata connection failed - check your credentials',
          connected: false,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Pinata connection test error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        connected: false,
      },
      { status: 500 }
    );
  }
}
