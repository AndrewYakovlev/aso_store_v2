import { cookies } from 'next/headers';

const ANONYMOUS_TOKEN_COOKIE = 'anonymous_token';
const ANONYMOUS_USER_ID_COOKIE = 'anonymous_user_id';

export class AnonymousTokenService {
  static async getToken(): Promise<string | null> {
    const cookieStore = await cookies();
    return cookieStore.get(ANONYMOUS_TOKEN_COOKIE)?.value || null;
  }

  static async getUserId(): Promise<string | null> {
    const cookieStore = await cookies();
    return cookieStore.get(ANONYMOUS_USER_ID_COOKIE)?.value || null;
  }

  static async ensureToken(): Promise<{ token: string; userId: string }> {
    // Use the route handler to ensure token
    const response = await fetch(`${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/api/auth/anonymous`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error('Failed to ensure anonymous token');
    }

    return response.json();
  }
}