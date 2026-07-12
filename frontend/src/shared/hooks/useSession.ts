'use client';

import { useState, useEffect } from 'react';

export interface SessionUser {
  id: string;
  email: string;
  role: string;
  name: string;
}

export function useSession() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let mounted = true;
    
    const initSession = async () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('sb-token') : null;
      const profileStr = typeof window !== 'undefined' ? localStorage.getItem('sb-profile') : null;

      if (token && profileStr) {
        try {
          const profile = JSON.parse(profileStr);
          if (mounted) {
            setUser({
              id: profile.id || '',
              email: profile.email || '',
              role: profile.role || '',
              name: profile.fullName || '',
            });
            setIsAuthenticated(true);
          }
        } catch (e) {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('sb-token');
            localStorage.removeItem('sb-profile');
          }
        }
      }
      if (mounted) {
        setLoading(false);
      }
    };

    initSession();

    return () => {
      mounted = false;
    };
  }, []);

  return {
    user: user ? { email: user.email } : null,
    profile: user ? {
      id: user.id,
      full_name: user.name,
      role: user.role,
    } : null,
    session: { access_token: typeof window !== 'undefined' ? localStorage.getItem('sb-token') : null },
    loading,
    isAuthenticated,
  };
}
