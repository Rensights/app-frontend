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

  const logout = useCallback(() => {
    // Clear all state first
    setUser(null);
    setSubscription(null);
    setError(null);
    setLoading(false);
    // Clear token and cache
    apiClient.logout();
    // Force a hard navigation to ensure clean state (clears React state and cache)
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  }, []);

  // Only load user if we have a token (don't try to load after logout)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        loadUser();
      } else {
        // No token, set loading to false immediately
        setLoading(false);
        setUser(null);
        setSubscription(null);
      }
    } else {
      // Server-side, just set loading to false
      setLoading(false);
    }
  }, [loadUser]);

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

