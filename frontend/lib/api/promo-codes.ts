import { apiRequestWithAuth } from './client-with-auth';

export interface PromoCode {
  id: string;
  code: string;
  description?: string;
  discountType: 'FIXED_AMOUNT' | 'PERCENTAGE';
  discountValue: number;
  minOrderAmount?: number;
  maxUsesTotal?: number;
  maxUsesPerUser: number;
  firstOrderOnly: boolean;
  validFrom: string;
  validUntil?: string;
  isPublic: boolean;
  isActive: boolean;
  createdByTrigger?: string;
  currentUses?: number;
  createdAt: string;
  updatedAt: string;
}

export interface PromoCodeTrigger {
  id: string;
  triggerType: string;
  isActive: boolean;
  validFrom: string;
  validUntil?: string;
  settings: {
    discountType: 'FIXED_AMOUNT' | 'PERCENTAGE';
    discountValue: number;
    minOrderAmount?: number;
    maxUsesPerUser: number;
    firstOrderOnly: boolean;
    validityDays: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreatePromoCodeDto {
  code?: string;
  description?: string;
  discountType: 'FIXED_AMOUNT' | 'PERCENTAGE';
  discountValue: number;
  minOrderAmount?: number;
  maxUsesTotal?: number;
  maxUsesPerUser?: number;
  firstOrderOnly?: boolean;
  validFrom?: string;
  validUntil?: string;
  isPublic?: boolean;
  isActive?: boolean;
}

export interface UpdatePromoCodeDto extends Partial<CreatePromoCodeDto> {}

export interface CreatePromoCodeTriggerDto {
  triggerType: string;
  isActive: boolean;
  validFrom?: string;
  validUntil?: string;
  settings: {
    discountType: 'FIXED_AMOUNT' | 'PERCENTAGE';
    discountValue: number;
    minOrderAmount?: number;
    maxUsesPerUser: number;
    firstOrderOnly: boolean;
    validityDays: number;
  };
}

export interface UpdatePromoCodeTriggerDto extends Partial<CreatePromoCodeTriggerDto> {}

export interface PromoCodesFilter {
  page?: number;
  limit?: number;
  isActive?: boolean;
  isPublic?: boolean;
  search?: string;
}

export interface PaginatedPromoCodes {
  items: PromoCode[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const promoCodesApi = {
  async getPromoCodes(token: string, filter?: PromoCodesFilter): Promise<PaginatedPromoCodes> {
    const params = new URLSearchParams();
    if (filter?.page) params.append('page', filter.page.toString());
    if (filter?.limit) params.append('limit', filter.limit.toString());
    if (filter?.isActive !== undefined) params.append('isActive', filter.isActive.toString());
    if (filter?.isPublic !== undefined) params.append('isPublic', filter.isPublic.toString());
    if (filter?.search) params.append('search', filter.search);

    const queryString = params.toString();
    const url = `/promo-codes${queryString ? `?${queryString}` : ''}`;
    
    return apiRequestWithAuth(url, { token });
  },

  async getPromoCode(token: string, id: string): Promise<PromoCode> {
    return apiRequestWithAuth(`/promo-codes/${id}`, { token });
  },

  async createPromoCode(token: string, data: CreatePromoCodeDto): Promise<PromoCode> {
    return apiRequestWithAuth('/promo-codes', {
      method: 'POST',
      body: JSON.stringify(data),
      token,
    });
  },

  async updatePromoCode(token: string, id: string, data: UpdatePromoCodeDto): Promise<PromoCode> {
    return apiRequestWithAuth(`/promo-codes/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
      token,
    });
  },

  async deletePromoCode(token: string, id: string): Promise<void> {
    return apiRequestWithAuth(`/promo-codes/${id}`, {
      method: 'DELETE',
      token,
    });
  },

  async getTriggers(token: string): Promise<PromoCodeTrigger[]> {
    return apiRequestWithAuth('/promo-codes/triggers', { token });
  },

  async getTrigger(token: string, id: string): Promise<PromoCodeTrigger> {
    return apiRequestWithAuth(`/promo-codes/triggers/${id}`, { token });
  },

  async createTrigger(token: string, data: CreatePromoCodeTriggerDto): Promise<PromoCodeTrigger> {
    return apiRequestWithAuth('/promo-codes/triggers', {
      method: 'POST',
      body: JSON.stringify(data),
      token,
    });
  },

  async updateTrigger(token: string, id: string, data: UpdatePromoCodeTriggerDto): Promise<PromoCodeTrigger> {
    return apiRequestWithAuth(`/promo-codes/triggers/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
      token,
    });
  },

  async deleteTrigger(token: string, id: string): Promise<void> {
    return apiRequestWithAuth(`/promo-codes/triggers/${id}`, {
      method: 'DELETE',
      token,
    });
  },

  async assignToUser(token: string, promoCodeId: string, userId: string): Promise<void> {
    return apiRequestWithAuth(`/promo-codes/${promoCodeId}/assign/${userId}`, {
      method: 'POST',
      token,
    });
  },

  async getUserPromoCodes(token: string): Promise<PromoCode[]> {
    return apiRequestWithAuth('/promo-codes/user', { token });
  },

  async getAllUsageHistory(token: string, filters: {
    promoCodeId?: string;
    userId?: string;
    orderId?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    items: Array<{
      id: string;
      promoCode: {
        code: string;
        description?: string;
        discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
        discountValue: number;
      };
      user: {
        id: string;
        phone: string;
        firstName?: string;
        lastName?: string;
      } | null;
      order: {
        orderNumber: string;
        totalAmount: number;
        status: string;
      };
      orderAmount: number;
      discountAmount: number;
      usedAt: string;
    }>;
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const params = new URLSearchParams();
    if (filters.promoCodeId) params.append('promoCodeId', filters.promoCodeId);
    if (filters.userId) params.append('userId', filters.userId);
    if (filters.orderId) params.append('orderId', filters.orderId);
    if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.append('dateTo', filters.dateTo);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    const queryString = params.toString();
    const url = `/promo-codes/usage/all${queryString ? `?${queryString}` : ''}`;
    
    return apiRequestWithAuth(url, { token });
  },
};