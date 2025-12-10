"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
export default function LandingHero() {
  const scrollToSolutions = () => {
    const solutionsSection = document.getElementById('solutions');
    solutionsSection?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-[70vh] flex items-center overflow-hidden py-16">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="/landing-assets/dubai-skyline.jpg"
          alt="Dubai skyline showcasing luxury real estate opportunities"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-white/40" />
      </div>

      {/* Content */}
      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 leading-tight">
            Discover <span className="text-primary">Underpriced</span> Dubai Properties
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-6 leading-relaxed">
            Data-driven insights for retail investors seeking exceptional real estate opportunities in Dubai's dynamic market
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/portal/signup"
              className="inline-flex items-center text-lg px-8 py-4 text-primary-foreground bg-primary rounded-lg shadow-lg hover:shadow-xl hover:bg-primary/90 transition-all"
            >
              Get Started <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              href="/portal/login"
              className="inline-flex items-center text-lg px-8 py-4 text-primary border-2 border-primary rounded-lg hover:bg-primary/10 transition-all"
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

