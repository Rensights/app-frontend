"use client";

import dynamic from "next/dynamic";
import LandingHeader from "@/components/landing/Header";
import LandingHero from "@/components/landing/Hero";

// OPTIMIZATION: Lazy load below-the-fold components for better initial page load
const WhyInvestInDubai = dynamic(() => import("@/components/landing/WhyInvestInDubai"), {
  loading: () => <div className="min-h-[400px]" />, // Placeholder to prevent layout shift
});

const LandingSolutions = dynamic(() => import("@/components/landing/Solutions"), {
  loading: () => <div className="min-h-[400px]" />,
});

const LandingHowItWorks = dynamic(() => import("@/components/landing/HowItWorks"), {
  loading: () => <div className="min-h-[400px]" />,
});

const LandingPricing = dynamic(() => import("@/components/landing/Pricing"), {
  loading: () => <div className="min-h-[400px]" />,
});

const LandingFooter = dynamic(() => import("@/components/landing/Footer"), {
  loading: () => <div className="min-h-[200px]" />,
});

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <LandingHeader />
      <LandingHero />
      <WhyInvestInDubai />
      <LandingSolutions />
      <LandingHowItWorks />
      <LandingPricing />
      <LandingFooter />
    </div>
  );
}
