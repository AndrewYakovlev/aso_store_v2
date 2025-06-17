import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { authApi } from '@/lib/api/auth';

const ANONYMOUS_TOKEN_COOKIE = 'anonymous_token';
const ANONYMOUS_USER_ID_COOKIE = 'anonymous_user_id';

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ANONYMOUS_TOKEN_COOKIE)?.value;
  const userId = cookieStore.get(ANONYMOUS_USER_ID_COOKIE)?.value;

  if (token) {
    try {
      // Validate existing token
      await authApi.validateAnonymousToken(token);
      return NextResponse.json({ token, userId });
    } catch (error) {
      // Token is invalid, will get a new one below
    }
  }

  // Get new token
  try {
    const response = await authApi.getAnonymousToken();
    
    // Set cookies for 365 days
    const maxAge = 365 * 24 * 60 * 60; // 365 days in seconds
    
    cookieStore.set(ANONYMOUS_TOKEN_COOKIE, response.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge,
      path: '/',
    });

    cookieStore.set(ANONYMOUS_USER_ID_COOKIE, response.anonymousUserId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge,
      path: '/',
    });

    return NextResponse.json({ 
      token: response.token, 
      userId: response.anonymousUserId 
    });
  } catch (error) {
    console.error('Failed to get anonymous token:', error);
    return NextResponse.json(
      { error: 'Failed to get anonymous token' },
      { status: 500 }
    );
  }
}