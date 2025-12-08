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

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadUser = useCallback(async () => {
    try {
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
    // Clear all state first
    setUser(null);
    setSubscription(null);
    setError(null);
    setLoading(true); // Set loading to true to prevent AppLayout from checking auth during logout
    // Call backend logout endpoint to clear HttpOnly cookie
    await apiClient.logout();
    // Clear API client cache completely
    apiClient.clearCache();
    // Force a hard navigation with cache busting to ensure clean state
    if (typeof window !== 'undefined') {
      // Use replace to prevent back button issues and clear history
      window.location.replace('/');
    }
  }, []);

  // SECURITY: Load user - cookie is automatically sent with request
  // No need to check localStorage (token is in HttpOnly cookie)
  useEffect(() => {
    // Always attempt to load user - cookie will be sent automatically if present
    // If no cookie, backend will return 401/403 and we handle it in loadUser
    // Only load if not already loading (prevent multiple simultaneous loads)
    if (!loading) {
      loadUser();
    }
  }, [loadUser, loading]);

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

