"use client";

import { TrendingUp, Shield, FileCheck, Award } from "lucide-react";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";

const iconMap: Record<string, any> = {
  TrendingUp,
  Shield,
  FileCheck,
  Award,
};

export default function WhyInvestInDubai() {
  const { language } = useLanguage();
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContent();
  }, [language]);

  const loadContent = async () => {
    try {
      const data = await apiClient.getLandingPageSection('why-invest', language);
      setContent(data.content || {});
    } catch (error) {
      console.error("Error loading why-invest content:", error);
      // Fallback to default content
      setContent({
        title: "Why Invest in Dubai",
        benefits: [
          {
            icon: "TrendingUp",
            title: "High Profitability",
            description: "Average rental yields reach 6–8%, among the highest globally. Investors enjoy both steady rental income and strong capital appreciation.",
          },
          {
            icon: "Shield",
            title: "Tax-Free Returns",
            description: "Dubai has no property tax or capital gains tax, allowing investors to maximize their net returns compared to most global cities.",
          },
          {
            icon: "FileCheck",
            title: "Easy Investment Process",
            description: "Foreign investors can own property 100% in designated areas, with a transparent, fast, and secure buying process regulated by the Dubai Land Department.",
          },
          {
            icon: "Award",
            title: "Residence Permit Opportunity",
            description: "By purchasing property above certain thresholds, investors can qualify for renewable residence visas, providing long-term access and benefits in the UAE.",
          },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="py-16 sm:py-24 text-center">Loading...</div>;
  }

  const title = content?.title || "Why Invest in Dubai";
  const benefits = content?.benefits || (content?.benefitsJson ? JSON.parse(content.benefitsJson) : []);

  return (
    <section id="why-invest" className="py-16 sm:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {title}
          </h2>
        </div>

        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit: any, index: number) => {
            const IconComponent = iconMap[benefit.icon] || TrendingUp;
            return (
              <div
                key={index}
                className="rounded-2xl border bg-card p-6 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <IconComponent className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
