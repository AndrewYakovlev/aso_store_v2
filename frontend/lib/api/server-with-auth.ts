import { apiRequest, ApiRequestOptions } from './client';
import { AnonymousTokenService } from '../services/anonymous-token.service';
import { cookies } from 'next/headers';

/**
 * Makes an API request with authentication from server components.
 * Priority order:
 * 1. JWT token from cookies (for authenticated users)
 * 2. JWT token passed in options (for explicit auth)
 * 3. Anonymous token from cookies
 */
export async function serverApiRequest<T = any>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const cookieStore = await cookies();
  
  // Check for JWT token in cookies (authenticated user)
  const accessToken = cookieStore.get('access_token')?.value;
  
  // Priority: JWT token from cookies > explicit token in options > anonymous token
  if (accessToken && !options.token) {
    options.token = accessToken;
  } else if (!options.token) {
    // No JWT token, try anonymous token
    const anonymousToken = await AnonymousTokenService.getToken();
    if (anonymousToken) {
      options.anonymousToken = anonymousToken;
    }
  }
  
  return apiRequest<T>(endpoint, options);
}