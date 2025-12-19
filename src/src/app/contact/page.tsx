"use client";

import LandingHeader from "@/components/landing/Header";
import LandingFooter from "@/components/landing/Footer";
import LandingContact from "@/components/landing/Contact";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      <LandingHeader />
      <main className="pt-16">
        <LandingContact />
      </main>
      <LandingFooter />
    </div>
  );
}



