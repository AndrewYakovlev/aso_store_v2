'use client';

import { apiRequest, ApiRequestOptions } from './client';
import { ClientAnonymousTokenService } from '../services/client-token.service';

/**
 * Makes an API request with authentication.
 * Priority order:
 * 1. JWT token passed in options (for explicit auth)
 * 2. Anonymous token from localStorage
 */
export async function apiRequestWithAuth<T = any>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  // If no explicit token is provided, add anonymous token
  if (!options.token) {
    const anonymousToken = ClientAnonymousTokenService.getToken();
    if (anonymousToken) {
      options.anonymousToken = anonymousToken;
    }
  }
  
  return apiRequest<T>(endpoint, options);
}