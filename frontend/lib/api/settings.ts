import { apiRequest } from './client';

export interface StorePhone {
  id: string;
  phone: string;
  name?: string;
  isWhatsApp: boolean;
  isTelegram: boolean;
  isMain: boolean;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStorePhoneData {
  phone: string;
  name?: string;
  isWhatsApp?: boolean;
  isTelegram?: boolean;
  isMain?: boolean;
  sortOrder?: number;
  isActive?: boolean;
}

export interface UpdateStorePhoneData extends Partial<CreateStorePhoneData> {}

export interface StoreAddress {
  id: string;
  type: 'main' | 'warehouse' | 'pickup_point';
  name?: string;
  country: string;
  city: string;
  street: string;
  building: string;
  office?: string;
  postalCode?: string;
  coordinates?: string;
  workingHours?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStoreAddressData {
  type?: 'main' | 'warehouse' | 'pickup_point';
  name?: string;
  country?: string;
  city: string;
  street: string;
  building: string;
  office?: string;
  postalCode?: string;
  coordinates?: string;
  workingHours?: string;
  isActive?: boolean;
}

export interface UpdateStoreAddressData extends Partial<CreateStoreAddressData> {}

// Phone management
export async function getStorePhones(): Promise<StorePhone[]> {
  return apiRequest('/settings/phones');
}

export async function createStorePhone(
  data: CreateStorePhoneData,
  accessToken: string,
): Promise<StorePhone> {
  return apiRequest('/settings/phones', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function updateStorePhone(
  id: string,
  data: UpdateStorePhoneData,
  accessToken: string,
): Promise<StorePhone> {
  return apiRequest(`/settings/phones/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function deleteStorePhone(
  id: string,
  accessToken: string,
): Promise<StorePhone> {
  return apiRequest(`/settings/phones/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

// Address management
export async function getStoreAddresses(): Promise<StoreAddress[]> {
  return apiRequest('/settings/addresses');
}

export async function getMainStoreAddress(): Promise<StoreAddress | null> {
  return apiRequest('/settings/addresses/main');
}

export async function createStoreAddress(
  data: CreateStoreAddressData,
  accessToken: string,
): Promise<StoreAddress> {
  return apiRequest('/settings/addresses', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function updateStoreAddress(
  id: string,
  data: UpdateStoreAddressData,
  accessToken: string,
): Promise<StoreAddress> {
  return apiRequest(`/settings/addresses/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function deleteStoreAddress(
  id: string,
  accessToken: string,
): Promise<StoreAddress> {
  return apiRequest(`/settings/addresses/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

// General settings
export async function getSettings(accessToken: string): Promise<Record<string, any>> {
  return apiRequest('/settings', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function getSetting(
  key: string,
  accessToken: string,
): Promise<{ key: string; value: any }> {
  return apiRequest(`/settings/${key}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function updateSetting(
  key: string,
  value: any,
  accessToken: string,
): Promise<any> {
  return apiRequest('/settings', {
    method: 'PUT',
    body: JSON.stringify({ key, value }),
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  });
}