"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  userTier?: string;
  emailVerified?: boolean;
  customerId?: string;
  createdAt?: string;
}

interface Subscription {
  id: string;
  planType: string;
  status: string;
  startDate?: string;
  endDate?: string;
  [key: string]: any;
}

interface UserContextType {
  user: User | null;
  subscription: Subscription | null;
  loading: boolean;
  error: Error | null;
  refreshUser: () => Promise<void>;
  refreshSubscription: () => Promise<void>;
  logout: () => void;
}

export const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadUser = useCallback(async () => {
    try {
      setLoading(true);
      // Don't use cache for user loading - always fetch fresh after login/logout
      // Use caching - these requests are already cached in API client
      const [userData, subscriptionData] = await Promise.all([
        apiClient.getCurrentUser(),
        apiClient.getCurrentSubscription().catch(() => null),
      ]);
      setUser(userData);
      setSubscription(subscriptionData);
      setError(null);
    } catch (err: any) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to load user:', err);
      }
      setError(err);
      setUser(null);
      setSubscription(null);
      
      // If authentication failed (401/403), clear token and ensure redirect
      // The API client should already have cleared the token, but we ensure user state is cleared
      if (err.status === 401 || err.status === 403) {
        apiClient.clearToken();
        // Don't redirect here - AppLayout will handle it based on user state
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const userData = await apiClient.getCurrentUser();
      setUser(userData);
      setError(null);
    } catch (err: any) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to refresh user:', err);
      }
      setError(err);
    }
  }, []);

  const refreshSubscription = useCallback(async () => {
    try {
      const subscriptionData = await apiClient.getCurrentSubscription().catch(() => null);
      setSubscription(subscriptionData);
    } catch (err: any) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to refresh subscription:', err);
      }
    }
  }, []);

  const logout = useCallback(async () => {
    // Clear all state first to prevent any redirects during logout
    setUser(null);
    setSubscription(null);
    setError(null);
    setLoading(true); // Set loading to true to prevent AppLayout from checking auth during logout
    
    try {
      // Call backend logout endpoint to clear HttpOnly cookie
      // This must happen before navigation to ensure cookie is cleared
      await apiClient.logout();
    } catch (error) {
      // Continue with logout even if backend call fails
      if (process.env.NODE_ENV === 'development') {
        console.error('Logout API call failed:', error);
      }
    } finally {
      // Clear API client cache completely (including pending requests)
      apiClient.clearCache();
      
      // Force a hard navigation to ensure complete state reset
      if (typeof window !== 'undefined') {
        // Use replace to prevent back button issues and clear history
        // Add cache busting parameter to ensure fresh page load
        const timestamp = Date.now();
        window.location.replace(`/portal/login?_=${timestamp}`);
      }
    }
  }, []);

  // SECURITY: Load user - cookie is automatically sent with request
  // No need to check localStorage (token is in HttpOnly cookie)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Public paths: landing pages, portal pages (login, signup, forgot password, etc.)
    const publicPaths = [
      '/', // Landing page
      '/about',
      '/contact',
      '/faq',
      '/pricing',
      '/privacy-terms',
      '/solutions',
      '/portal/login',
      '/portal/signup',
      '/portal/forgot-password',
      '/portal/reset-password',
      '/portal/early-access'
    ];
    const currentPath = window.location.pathname;
    const isPublicPath = publicPaths.some(path => 
      currentPath === path || currentPath.startsWith(path + '/')
    );
    
    if (!isPublicPath) {
      // On authenticated routes, load user normally
      const timer = setTimeout(() => {
        loadUser();
      }, 100);
      
      return () => clearTimeout(timer);
    } else if (currentPath.startsWith('/portal/')) {
      // On portal pages, do a lightweight auth check
      // This allows portal layout to redirect authenticated users
      // But we fail fast if no auth cookie exists
      const timer = setTimeout(async () => {
        try {
          // Quick auth check - will fail fast if not authenticated
          const userData = await apiClient.getCurrentUser();
          setUser(userData);
          setLoading(false);
        } catch (err: any) {
          // Not authenticated - this is expected on portal pages
          setUser(null);
          setLoading(false);
        }
      }, 50); // Faster check for portal pages
      
      return () => clearTimeout(timer);
    } else {
      // Landing page - no auth check needed
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  return (
    <UserContext.Provider
      value={{
        user,
        subscription,
        loading,
        error,
        refreshUser,
        refreshSubscription,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

