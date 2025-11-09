import { NextResponse } from 'next/server';

/**
 * GET /api/auth/token
 * Returns an authentication token for the current user session
 * 
 * Development mode: Returns mock token
 * Production: Would integrate with Auth0 once SDK supports Next.js 16
 */
export async function GET() {
  try {
    // For now, always return development token
    // TODO: Integrate with Auth0 SDK when Next.js 16 support is stable
    return NextResponse.json({
      token: 'dev-mock-token',
      expiresIn: 3600,
      user: { 
        id: 'dev-user', 
        name: 'Dev User',
        email: 'dev@newsception.app'
      },
    });
  } catch (error) {
    console.error('Error retrieving auth token:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve authentication token' },
      { status: 500 }
    );
  }
}
