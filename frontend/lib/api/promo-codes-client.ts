import { apiRequestWithAuth } from './client-with-auth';
import { PromoCode } from './promo-codes';

export const promoCodesClientApi = {
  // For user's own promo codes - will use JWT from localStorage
  async getUserPromoCodes(): Promise<PromoCode[]> {
    const accessToken = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (!accessToken) {
      throw new Error('No access token');
    }
    
    return apiRequestWithAuth('/promo-codes/my', { 
      token: accessToken 
    });
  },

  // For validating promo code - can be used by anonymous users
  async validatePromoCode(code: string): Promise<{
    isValid: boolean;
    error?: string;
    discountType?: 'FIXED_AMOUNT' | 'PERCENTAGE';
    discountValue?: number;
    discountAmount?: number;
  }> {
    return apiRequestWithAuth('/promo-codes/validate', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  },
};