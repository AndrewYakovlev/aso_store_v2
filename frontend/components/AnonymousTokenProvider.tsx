'use client';

import { useEffect } from 'react';

export function AnonymousTokenProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Ensure anonymous token on client side by calling our route handler
    fetch('/api/auth/anonymous', { 
      method: 'GET',
      credentials: 'include'
    })
      .then(async (response) => {
        if (response.ok) {
          const data = await response.json();
          // Sync with localStorage for client-side access
          if (data.token && data.userId) {
            localStorage.setItem('anonymous_token', data.token);
            localStorage.setItem('anonymous_user_id', data.userId);
          }
        }
      })
      .catch(console.error);
  }, []);

  return <>{children}</>;
}