import { apiRequest } from './client';

export interface AnonymousTokenResponse {
  token: string;
  anonymousUserId: string;
}

export interface ValidateTokenResponse {
  valid: boolean;
  anonymousUserId: string;
}

export interface SendOtpResponse {
  message: string;
  retryAfter?: number;
  code?: string; // Only in development
}

export interface VerifyOtpResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    phone: string;
    firstName?: string;
    lastName?: string;
    middleName?: string;
  };
}

export interface UserProfile {
  id: string;
  phone: string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  isPhoneVerified: boolean;
  createdAt: string;
}

export const authApi = {
  async getAnonymousToken(): Promise<AnonymousTokenResponse> {
    return apiRequest<AnonymousTokenResponse>('/auth/anonymous/token', {
      method: 'POST',
    });
  },

  async validateAnonymousToken(token: string): Promise<ValidateTokenResponse> {
    return apiRequest<ValidateTokenResponse>('/auth/anonymous/validate', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  },

  async sendOtp(phone: string): Promise<SendOtpResponse> {
    return apiRequest<SendOtpResponse>('/auth/otp/send', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    });
  },

  async verifyOtp(phone: string, code: string, anonymousToken?: string): Promise<VerifyOtpResponse> {
    return apiRequest<VerifyOtpResponse>('/auth/otp/verify', {
      method: 'POST',
      body: JSON.stringify({ phone, code, anonymousToken }),
    });
  },

  async refreshTokens(refreshToken: string): Promise<VerifyOtpResponse> {
    return apiRequest<VerifyOtpResponse>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  },

  async getProfile(accessToken: string): Promise<UserProfile> {
    return apiRequest<UserProfile>('/auth/profile', {
      method: 'GET',
      token: accessToken,
    });
  },

  async updateProfile(accessToken: string, data: {
    firstName?: string;
    lastName?: string;
    middleName?: string;
  }): Promise<UserProfile> {
    return apiRequest<UserProfile>('/auth/profile', {
      method: 'PUT',
      token: accessToken,
      body: JSON.stringify(data),
    });
  },
};