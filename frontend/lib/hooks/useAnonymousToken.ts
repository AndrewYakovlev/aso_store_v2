'use client';

import { useState, useEffect } from 'react';

export function useAnonymousToken() {
  const [data, setData] = useState<{ token: string | null; userId: string | null }>({
    token: null,
    userId: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadToken = async () => {
      try {
        // First check localStorage
        const localToken = localStorage.getItem('anonymous_token');
        const localUserId = localStorage.getItem('anonymous_user_id');
        
        if (localToken && localUserId) {
          setData({ token: localToken, userId: localUserId });
        }

        // Then fetch from server to ensure validity
        const response = await fetch('/api/auth/anonymous', {
          method: 'GET',
          credentials: 'include'
        });
        
        if (response.ok) {
          const result = await response.json();
          setData({ token: result.token, userId: result.userId });
          
          // Sync with localStorage
          if (result.token && result.userId) {
            localStorage.setItem('anonymous_token', result.token);
            localStorage.setItem('anonymous_user_id', result.userId);
          }
        }
      } catch (error) {
        console.error('Failed to load anonymous token:', error);
      } finally {
        setLoading(false);
      }
    };

    loadToken();
  }, []);

  return { token: data.token, userId: data.userId, loading };
}