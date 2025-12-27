"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";

export default function LandingFooter() {
  const { language } = useLanguage();
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContent();
  }, [language]);

  const loadContent = async () => {
    try {
      const data = await apiClient.getLandingPageSection('footer', language);
      setContent(data.content || {});
    } catch (error: any) {
      // Only log errors that aren't 404s (404 means section doesn't exist in DB, which is fine)
      if (error?.status !== 404) {
        console.error("Error loading footer content:", error);
      }
      setContent({});
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <footer className="border-t bg-card py-6"><div className="container mx-auto px-4 text-center">Loading...</div></footer>;
  }

  const tagline = content?.tagline || "Data-backed real estate investing in Dubai";
  const companyLinks = content?.companyLinks || (content?.companyLinksJson ? JSON.parse(content.companyLinksJson) : [
    { label: "About Us", href: "/about" },
    { label: "Solutions", href: "/solutions" },
    { label: "Pricing", href: "/pricing" },
  ]);
  const legalLinks = content?.legalLinks || (content?.legalLinksJson ? JSON.parse(content.legalLinksJson) : [
    { label: "Privacy Policy & Terms", href: "/privacy-terms" },
    { label: "FAQ", href: "/faq" },
    { label: "Contact", href: "/contact" },
  ]);
  const copyright = content?.copyright || `© ${new Date().getFullYear()} Rensights. All rights reserved.`;

  return (
    <footer className="border-t bg-card py-6">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-xl bg-primary"></div>
              <span className="text-xl font-semibold">{content?.brandName || "Rensights"}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {tagline}
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">{content?.companyTitle || "Company"}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {companyLinks.map((link: any, index: number) => (
                <li key={index}>
                  <Link href={link.href} className="hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">{content?.legalTitle || "Legal"}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {legalLinks.map((link: any, index: number) => (
                <li key={index}>
                  <Link href={link.href} className="hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t text-center text-sm text-muted-foreground">
          <p>{copyright}</p>
        </div>
      </div>
    </footer>
  );
}
