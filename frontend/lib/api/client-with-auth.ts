'use client';

import { apiRequest, ApiRequestOptions } from './client';
import { ClientAnonymousTokenService } from '../services/client-token.service';

export async function apiRequestWithAuth<T = any>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  // Get anonymous token from localStorage
  const anonymousToken = ClientAnonymousTokenService.getToken();
  
  // Add anonymous token to request if available
  if (anonymousToken && !options.token) {
    options.anonymousToken = anonymousToken;
  }
  
  return apiRequest<T>(endpoint, options);
}