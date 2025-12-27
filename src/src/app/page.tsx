"use client";

import LandingHeader from "@/components/landing/Header";
import LandingHero from "@/components/landing/Hero";
import WhyInvestInDubai from "@/components/landing/WhyInvestInDubai";
import LandingSolutions from "@/components/landing/Solutions";
import LandingHowItWorks from "@/components/landing/HowItWorks";
import LandingPricing from "@/components/landing/Pricing";
import LandingFooter from "@/components/landing/Footer";

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
