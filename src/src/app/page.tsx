"use client";

import LandingHeader from "@/components/landing/Header";
import LandingHero from "@/components/landing/Hero";
import WhyInvestInDubai from "@/components/landing/WhyInvestInDubai";
import LandingSolutions from "@/components/landing/Solutions";
import LandingHowItWorks from "@/components/landing/HowItWorks";
import LandingPricing from "@/components/landing/Pricing";
import LandingAbout from "@/components/landing/About";
import LandingWhatsNew from "@/components/landing/WhatsNew";
import LandingContact from "@/components/landing/Contact";
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
      <LandingAbout />
      <LandingWhatsNew />
      <LandingContact />
      <LandingFooter />
    </div>
  );
}
