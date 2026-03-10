"use client";

import { useEffect, useState } from "react";
import LandingHeader from "@/components/landing/Header";
import LandingHero from "@/components/landing/Hero";
import WhyInvestInDubai from "@/components/landing/WhyInvestInDubai";
import LandingSolutions from "@/components/landing/Solutions";
import LandingHowItWorks from "@/components/landing/HowItWorks";
import LandingPricing from "@/components/landing/Pricing";
import LandingCTA from "@/components/landing/CTA";
import LandingFooter from "@/components/landing/Footer";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useLanguage } from "@/context/LanguageContext";
import { apiClient } from "@/lib/api";
import type { Language } from "@/components/LanguageSwitcher";

const API_URL = typeof window !== "undefined"
  ? (window as any).__API_URL__ || process.env.NEXT_PUBLIC_API_URL || ""
  : process.env.NEXT_PUBLIC_API_URL || "";

export default function LandingPage() {
  const { language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [landingData, setLandingData] = useState<{
    header: any;
    hero: any;
    whyInvest: any;
    solutions: any;
    howItWorks: any;
    pricing: any;
    footer: any;
    hasArticles: boolean;
    languages: Language[];
  }>({
    header: {},
    hero: {},
    whyInvest: {},
    solutions: {},
    howItWorks: {},
    pricing: {},
    footer: {},
    hasArticles: false,
    languages: [],
  });

  useEffect(() => {
    let isMounted = true;

    const safeSection = async (key: string) => {
      try {
        const data = await apiClient.getLandingPageSection(key, language);
        return data?.content || {};
      } catch {
        return {};
      }
    };

    const loadLanding = async () => {
      setLoading(true);
      const languagesPromise = API_URL
        ? fetch(`${API_URL}/api/languages`)
            .then((res) => (res.ok ? res.json() : []))
            .catch(() => [])
        : Promise.resolve([]);

      const [
        header,
        hero,
        whyInvest,
        solutions,
        howItWorks,
        pricing,
        footer,
        articles,
        languages,
      ] = await Promise.all([
        safeSection("header"),
        safeSection("hero"),
        safeSection("why-invest"),
        safeSection("solutions"),
        safeSection("how-it-works"),
        safeSection("pricing"),
        safeSection("footer"),
        apiClient.getArticles().catch(() => []),
        languagesPromise,
      ]);

      if (!isMounted) return;
      setLandingData({
        header,
        hero,
        whyInvest,
        solutions,
        howItWorks,
        pricing,
        footer,
        hasArticles: Array.isArray(articles) && articles.length > 0,
        languages: Array.isArray(languages) ? languages : [],
      });
      setLoading(false);
    };

    loadLanding();
    return () => {
      isMounted = false;
    };
  }, [language]);

  if (loading) {
    return <LoadingSpinner fullPage={true} message="Loading..." />;
  }

  return (
    <div className="min-h-screen bg-background">
      <LandingHeader
        initialContent={landingData.header}
        prefetchedHasArticles={landingData.hasArticles}
        availableLanguages={landingData.languages}
      />
      <LandingHero initialContent={landingData.hero} />
      <WhyInvestInDubai initialContent={landingData.whyInvest} />
      <LandingSolutions initialContent={landingData.solutions} />
      <LandingHowItWorks initialContent={landingData.howItWorks} />
      <LandingPricing initialContent={landingData.pricing} />
      <LandingCTA initialContent={landingData.solutions} />
      <LandingFooter initialContent={landingData.footer} />
    </div>
  );
}
