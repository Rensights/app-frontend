"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useUser } from "@/context/UserContext";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import LandingHeader from "@/components/landing/Header";

/**
 * Portal Layout - For authentication pages
 *
 * If user is already logged in, redirect them to dashboard (except early access
 * and Google sign-up profile completion on /portal/signup).
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
    if (loading) return;

    if (!user) {
      setIsRedirecting(false);
      return;
    }
    if (allowWhenAuthenticated) {
      setIsRedirecting(false);
      return;
    }
    if (user.registrationProfileComplete === false) {
      if (pathname !== "/portal/signup") {
        setIsRedirecting(true);
        router.replace("/portal/signup?completeRegistration=1");
      } else {
        setIsRedirecting(false);
      }
      return;
    }
    if (pathname?.startsWith("/portal/")) {
      setIsRedirecting(true);
      router.replace("/dashboard");
    } else {
      setIsRedirecting(false);
    }
  }, [user, loading, router, allowWhenAuthenticated, pathname]);

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

  return (
    <>
      <LandingHeader />
      {children}
    </>
  );
}
