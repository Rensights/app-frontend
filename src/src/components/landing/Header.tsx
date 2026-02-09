"use client";

import { useState, useEffect } from "react";
import { Menu } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { apiClient } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";
import { useUser } from "@/context/UserContext";

export default function LandingHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [content, setContent] = useState<any>({});
  const [loading, setLoading] = useState(false);
  
  // Get language from context - must be called unconditionally
  // If context throws, React will handle it (component won't render)
  const languageContext = useLanguage();
  const language = languageContext?.language || 'en';
  
  // Get user info to check if logged in
  const { user, loading: userLoading } = useUser();
  const isLoggedIn = !!user;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Listen for auth state changes to update header buttons across tabs
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleAuthChange = () => {
        // The useUser hook will automatically update, this just ensures we're listening
        if (process.env.NODE_ENV === 'development') {
          console.log('Auth state changed in header, user:', user);
        }
      };

      window.addEventListener('auth-state-changed', handleAuthChange);
      window.addEventListener('storage', handleAuthChange);

      return () => {
        window.removeEventListener('auth-state-changed', handleAuthChange);
        window.removeEventListener('storage', handleAuthChange);
      };
    }
  }, [user]);

  useEffect(() => {
    if (mounted) {
      loadContent();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language, mounted]);

  const loadContent = async () => {
    // Don't load if not mounted (prevents SSR/client mismatch)
    if (!mounted || typeof window === 'undefined') return;
    
    // Check if API client is available
    if (!apiClient || typeof apiClient.getLandingPageSection !== 'function') {
      console.warn("API client not available, using default header content");
      return;
    }
    
    try {
      setLoading(true);
      const data = await apiClient.getLandingPageSection('header', language);
      if (data?.content) {
        setContent(data.content);
      }
    } catch (error) {
      console.error("Error loading header content:", error);
      // Use empty object as fallback - don't crash
      // Content already initialized to {} so this is safe
    } finally {
      setLoading(false);
    }
  };

  const navSolutions = content?.navSolutions || "Solutions";
  const navPricing = content?.navPricing || "Pricing";
  const navWhatsNew = content?.navWhatsNew || "What's New";
  const navLogin = content?.navLogin || "Login";
  const navGetStarted = content?.navGetStarted || "Get Started";
  const brandName = content?.brandName || "Rensights";

  return (
    <header 
      className="sticky top-0 z-50 border-b backdrop-blur-md h-16 overflow-hidden"
      style={{
        backgroundColor: typeof window !== 'undefined' 
          ? 'rgba(248, 250, 252, 0.9)' 
          : 'rgba(248, 250, 252, 0.9)',
        borderColor: '#e5e7eb'
      }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-full items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div 
              className="h-6 w-6 rounded-lg"
              style={{
                backgroundColor: '#f6b042'
              }}
            ></div>
            <span className="text-lg font-semibold tracking-tight">{brandName}</span>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            <Link 
              href="/solutions" 
              className="text-base font-medium transition-colors"
              style={{
                color: '#1f2937',
                textDecoration: 'none'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#f6b042'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#1f2937'}
            >
              {navSolutions}
            </Link>
            <Link 
              href="/pricing" 
              className="text-base font-medium transition-colors"
              style={{
                color: '#1f2937',
                textDecoration: 'none'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#f6b042'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#1f2937'}
            >
              {navPricing}
            </Link>
            {/* Hidden for now - will be enabled later */}
            <Link href="/whats-new" className="text-sm font-medium transition-colors hidden">
              {navWhatsNew}
            </Link>
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <LanguageSwitcher />
            {isLoggedIn ? (
              <Link href="/dashboard">
                <Button size="sm">Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link href="/portal/login">
                  <Button variant="outline" size="sm">
                    {navLogin}
                  </Button>
                </Link>
                <Link href="/pricing#packages">
                  <Button size="sm">{navGetStarted}</Button>
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="inline-flex items-center rounded-xl border p-2 md:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div 
          className="border-t md:hidden"
          style={{
            backgroundColor: '#ffffff',
            borderColor: '#e5e7eb'
          }}
        >
          <div className="container mx-auto space-y-3 px-4 py-4 sm:px-6 lg:px-8">
            <Link href="/solutions" className="block text-sm">
              {navSolutions}
            </Link>
            <Link href="/pricing" className="block text-sm">
              {navPricing}
            </Link>
            <div className="pt-3 space-x-3">
              {isLoggedIn ? (
                <Link href="/dashboard">
                  <Button size="sm">Dashboard</Button>
                </Link>
              ) : (
                <>
                  <Link href="/portal/login">
                    <Button variant="outline" size="sm">
                      {navLogin}
                    </Button>
                  </Link>
                  <Link href="/pricing#packages">
                    <Button size="sm">{navGetStarted}</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
