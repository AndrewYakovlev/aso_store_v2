'use client';

import { usePathname } from 'next/navigation';

export function MainWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Don't add padding bottom on chat page
  const isChat = pathname === '/chat';
  
  return (
    <main className={`min-h-screen ${isChat ? '' : 'pb-16 md:pb-0'}`}>
      {children}
    </main>
  );
}