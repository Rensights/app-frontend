"use client";

import { useState, useEffect, useCallback, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { AppSidebar } from "./AppSidebar";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface AppLayoutProps {
  children: ReactNode;
  requireAuth?: boolean;
}

export function AppLayout({ children, requireAuth = true }: AppLayoutProps) {
  const router = useRouter();
  const { loading, user, logout } = useUser();
  // Initialize sidebar as open (desktop default) - will be adjusted on mount
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  // Set sidebar state based on screen size after mount to avoid hydration issues
  useEffect(() => {
    setIsMounted(true);
    const checkScreenSize = () => {
      const isDesktop = window.innerWidth > 1024;
      // On desktop (>1024px), always keep sidebar open
      // On mobile, maintain current state (don't force close to avoid flickering)
      if (isDesktop) {
        setIsSidebarOpen(true); // Force open on desktop
      }
    };

    // Check immediately on mount
    checkScreenSize();
    
    // Handle window resize
    window.addEventListener('resize', checkScreenSize);
    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

  const toggleSidebar = useCallback(() => {
    // On desktop, sidebar should always be visible, so don't toggle
    if (window.innerWidth > 1024) {
      return; // Sidebar is always visible on desktop via CSS
    }
    setIsSidebarOpen((prev) => !prev);
  }, []);

  const closeSidebar = useCallback(() => {
    // On desktop, don't allow closing
    if (window.innerWidth > 1024) {
      return; // Sidebar is always visible on desktop via CSS
    }
    setIsSidebarOpen(false);
  }, []);

  const handleLogout = useCallback(() => {
    logout();
  }, [logout]);

  // Redirect to login if auth is required but no user is found
  useEffect(() => {
    if (!loading && requireAuth && !user) {
      // Check if we have a token in localStorage
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      
      // If no token, definitely redirect to login
      if (!token) {
        router.push('/');
        return;
      }
      
      // If we have a token but no user after loading, it means the token is invalid
      // The API client should have cleared it, but we'll redirect anyway
      router.push('/');
    }
  }, [loading, requireAuth, user, router]);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="dashboard-page">
        <LoadingSpinner fullPage={true} message="Loading..." />
      </div>
    );
  }

  // If auth required but no user, don't render the page content
  // The useEffect above will handle the redirect
  if (requireAuth && !user) {
    return (
      <div className="dashboard-page">
        <LoadingSpinner fullPage={true} message="Redirecting to login..." />
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <AppSidebar 
        isOpen={isSidebarOpen} 
        onClose={closeSidebar} 
        onLogout={handleLogout} 
      />
      
      <main className="main-content">
        <button
          className="menu-toggle"
          type="button"
          aria-label="Toggle navigation"
          onClick={toggleSidebar}
        >
          <span />
          <span />
          <span />
        </button>
        {children}
      </main>
    </div>
  );
}

