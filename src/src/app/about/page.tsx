"use client";

import LandingHeader from "@/components/landing/Header";
import LandingFooter from "@/components/landing/Footer";
import LandingAbout from "@/components/landing/About";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <LandingHeader />
      <main className="pt-16">
        <LandingAbout />
      </main>
      <LandingFooter />
    </div>
  );
}





