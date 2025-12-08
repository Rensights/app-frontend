"use client";

import { useState, useEffect, useCallback, ReactNode } from "react";
import { useUser } from "@/context/UserContext";
import { AppSidebar } from "./AppSidebar";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface AppLayoutProps {
  children: ReactNode;
  requireAuth?: boolean;
}

export function AppLayout({ children, requireAuth = true }: AppLayoutProps) {
  const { loading, user, logout } = useUser();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Set sidebar state based on screen size
  useEffect(() => {
    const checkScreenSize = () => {
      if (window.innerWidth > 1024) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  const closeSidebar = useCallback(() => {
    setIsSidebarOpen(false);
  }, []);

  const handleLogout = useCallback(() => {
    logout();
  }, [logout]);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="dashboard-page">
        <LoadingSpinner fullPage={true} message="Loading..." />
      </div>
    );
  }

  // If auth required but no user, redirect to login
  // Note: This will be handled by individual pages that need auth
  if (requireAuth && !user) {
    // Pages will handle their own redirects via useEffect
    return <>{children}</>;
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

