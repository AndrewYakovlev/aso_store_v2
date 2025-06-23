'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { getStorePhones, getStoreAddresses, type StorePhone, type StoreAddress } from '@/lib/api/settings';

interface StoreContactsContextType {
  phones: StorePhone[];
  addresses: StoreAddress[];
  mainPhone: StorePhone | null;
  mainAddress: StoreAddress | null;
  loading: boolean;
  refetch: () => Promise<void>;
}

const StoreContactsContext = createContext<StoreContactsContextType | undefined>(undefined);

export function StoreContactsProvider({ children }: { children: React.ReactNode }) {
  const [phones, setPhones] = useState<StorePhone[]>([]);
  const [addresses, setAddresses] = useState<StoreAddress[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchContacts = async () => {
    try {
      const [phonesData, addressesData] = await Promise.all([
        getStorePhones(),
        getStoreAddresses(),
      ]);
      
      setPhones(phonesData.filter(p => p.isActive));
      setAddresses(addressesData.filter(a => a.isActive));
    } catch (error) {
      console.error('Failed to fetch store contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const mainPhone = phones.find(p => p.isMain) || phones[0] || null;
  const mainAddress = addresses.find(a => a.type === 'main') || addresses[0] || null;

  return (
    <StoreContactsContext.Provider
      value={{
        phones,
        addresses,
        mainPhone,
        mainAddress,
        loading,
        refetch: fetchContacts,
      }}
    >
      {children}
    </StoreContactsContext.Provider>
  );
}

export function useStoreContacts() {
  const context = useContext(StoreContactsContext);
  if (!context) {
    throw new Error('useStoreContacts must be used within a StoreContactsProvider');
  }
  return context;
}