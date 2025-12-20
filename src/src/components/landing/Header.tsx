"use client";

import { useState, useEffect } from "react";
import { Menu } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { apiClient } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";

export default function LandingHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { language } = useLanguage();
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContent();
  }, [language]);

  const loadContent = async () => {
    try {
      const data = await apiClient.getLandingPageSection('header', language);
      setContent(data.content || {});
    } catch (error) {
      console.error("Error loading header content:", error);
      setContent({});
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
    <header className="sticky top-0 z-50 border-b bg-background/90 backdrop-blur-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-primary"></div>
            <span className="text-xl font-semibold tracking-tight">{brandName}</span>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            <Link href="/solutions" className="text-sm font-medium hover:text-primary transition-colors">
              {navSolutions}
            </Link>
            <Link href="/pricing" className="text-sm font-medium hover:text-primary transition-colors">
              {navPricing}
            </Link>
            {/* Hidden for now - will be enabled later */}
            <Link href="/whats-new" className="text-sm font-medium hover:text-primary transition-colors hidden">
              {navWhatsNew}
            </Link>
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <LanguageSwitcher />
            <Link href="/portal/login">
              <Button variant="outline" size="sm">
                {navLogin}
              </Button>
            </Link>
            <Link href="/pricing">
              <Button size="sm">{navGetStarted}</Button>
            </Link>
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
        <div className="border-t bg-background md:hidden">
          <div className="container mx-auto space-y-3 px-4 py-4 sm:px-6 lg:px-8">
            <Link href="/solutions" className="block text-sm">
              {navSolutions}
            </Link>
            <Link href="/pricing" className="block text-sm">
              {navPricing}
            </Link>
            <div className="pt-3 space-x-3">
              <Link href="/portal/login">
                <Button variant="outline" size="sm">
                  {navLogin}
                </Button>
              </Link>
              <Link href="/pricing">
                <Button size="sm">{navGetStarted}</Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
