"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useUser } from "@/context/UserContext";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import LandingHeader from "@/components/landing/Header";

/**
 * Portal Layout - For authentication pages
 * 
 * If user is already logged in, redirect them to dashboard
 * This prevents logged-in users from accessing login/signup pages
 */
export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useUser();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const allowWhenAuthenticated = pathname === "/portal/early-access";

  useEffect(() => {
    // Wait for auth state to load
    if (loading) return;

    // If user is authenticated, redirect to dashboard
    // Portal pages (login, signup, forgot-password, etc.) are only for unauthenticated users
    if (user && !allowWhenAuthenticated) {
      setIsRedirecting(true);
      // Use replace to prevent back button navigation to portal pages
      router.replace("/dashboard");
    }
  }, [user, loading, router, allowWhenAuthenticated]);

  // Show loading spinner while checking auth state
  if (loading || isRedirecting) {
    return (
      <>
        <LandingHeader />
        <div style={{ 
          minHeight: "calc(100vh - 20px)", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center",
          background: "linear-gradient(135deg, #f6b042 0%, #f39c12 100%)"
        }}>
          <LoadingSpinner message={isRedirecting ? "Redirecting..." : "Loading..."} />
        </div>
      </>
    );
  }

  // If user is authenticated, show loading (redirect is in progress)
  if (user && !allowWhenAuthenticated) {
    return (
      <>
        <LandingHeader />
        <div style={{ 
          minHeight: "calc(100vh - 20px)", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center",
          background: "linear-gradient(135deg, #f6b042 0%, #f39c12 100%)"
        }}>
          <LoadingSpinner message="Redirecting..." />
        </div>
      </>
    );
  }

  // User is not authenticated, show portal pages
  return (
    <>
      <LandingHeader />
      {children}
    </>
  );
}
