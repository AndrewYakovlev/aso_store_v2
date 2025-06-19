'use client';

import React, { createContext, useContext, useState } from 'react';

interface ActiveChatContextType {
  activeChatId: string | null;
  setActiveChatId: (chatId: string | null) => void;
}

const ActiveChatContext = createContext<ActiveChatContextType | undefined>(undefined);

export function ActiveChatProvider({ children }: { children: React.ReactNode }) {
  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  return (
    <ActiveChatContext.Provider value={{ activeChatId, setActiveChatId }}>
      {children}
    </ActiveChatContext.Provider>
  );
}

export function useActiveChat() {
  const context = useContext(ActiveChatContext);
  if (context === undefined) {
    throw new Error('useActiveChat must be used within an ActiveChatProvider');
  }
  return context;
}