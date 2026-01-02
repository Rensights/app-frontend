"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useContext } from "react";
import { apiClient } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";
import { UserContext } from "@/context/UserContext";

export default function LandingHero() {
  const { language } = useLanguage();
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Get user info to check if logged in
  const userContext = useContext(UserContext);
  const user = userContext?.user || null;
  const isLoggedIn = !!user;

  useEffect(() => {
    loadContent();
  }, [language]);

  const loadContent = async () => {
    try {
      const data = await apiClient.getLandingPageSection('hero', language);
      setContent(data.content || {});
    } catch (error) {
      console.error("Error loading hero content:", error);
      // Fallback to default content
      setContent({
        title: "Discover <span class='text-primary'>Underpriced</span> Dubai Properties",
        subtitle: "Data-driven insights for retail investors seeking exceptional real estate opportunities in Dubai's dynamic market",
        imageUrl: "/landing-assets/dubai-skyline.jpg",
        ctaPrimary: "Get Started",
        ctaSecondary: "Login",
      });
    } finally {
      setLoading(false);
    }
  };

  const scrollToSolutions = () => {
    const solutionsSection = document.getElementById('solutions');
    solutionsSection?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) {
    return <div className="min-h-[70vh] flex items-center justify-center">Loading...</div>;
  }

  const title = content?.title || "Discover <span class='text-primary'>Underpriced</span> Dubai Properties";
  const subtitle = content?.subtitle || "Data-driven insights for retail investors seeking exceptional real estate opportunities in Dubai's dynamic market";
  const imageUrl = content?.imageUrl || "/landing-assets/dubai-skyline.jpg";
  const ctaPrimary = content?.ctaPrimary || "Get Started";
  const ctaSecondary = content?.ctaSecondary || "Login";

  return (
    <section className="relative min-h-[70vh] flex items-center overflow-hidden py-16">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={imageUrl}
          alt="Dubai skyline showcasing luxury real estate opportunities"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-white/40" />
      </div>

      {/* Content */}
      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <h1 
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 leading-tight"
            dangerouslySetInnerHTML={{ __html: title }}
          />
          <p className="text-lg md:text-xl text-gray-600 mb-6 leading-relaxed">
            {subtitle}
          </p>
          <div className="flex flex-col sm:flex-row flex-wrap gap-4">
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center text-lg px-8 py-4 text-primary-foreground bg-primary rounded-lg shadow-lg hover:shadow-xl hover:bg-primary/90 transition-all w-full sm:w-auto"
              >
                Dashboard <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            ) : (
              <>
                <Link
                  href="/pricing"
                  className="inline-flex items-center justify-center text-lg px-8 py-4 text-primary-foreground bg-primary rounded-lg shadow-lg hover:shadow-xl hover:bg-primary/90 transition-all w-full sm:w-auto"
                >
                  {ctaPrimary} <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  href="/portal/login"
                  className="inline-flex items-center justify-center text-lg px-8 py-4 text-primary bg-white border-2 border-primary rounded-lg hover:bg-primary/10 hover:border-primary/80 transition-all shadow-md hover:shadow-lg font-semibold w-full sm:w-auto opacity-100"
                  style={{ opacity: 1 }}
                >
                  {ctaSecondary}
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
