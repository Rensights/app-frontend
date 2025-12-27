"use client";

import { Database, Brain, Mail, LayoutDashboard } from "lucide-react";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";

const iconMap: Record<string, any> = {
  Database,
  Brain,
  Mail,
  LayoutDashboard,
};

export default function LandingHowItWorks() {
  const { language } = useLanguage();
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContent();
  }, [language]);

  const loadContent = async () => {
    try {
      const data = await apiClient.getLandingPageSection('how-it-works', language);
      setContent(data.content || {});
    } catch (error: any) {
      // Only log errors that aren't 404s (404 means section doesn't exist in DB, which is fine)
      if (error?.status !== 404) {
        console.error("Error loading how-it-works content:", error);
      }
      setContent({});
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="py-16 text-center">Loading...</div>;
  }

  const title = content?.title || "How it works?";
  const description = content?.description || "Through advanced valuation algorithms, we filter and score each property based on variables like price trends, rental yields, and neighborhood growth potential. Then, you receive a list of undervalued properties with data-backed insights. It saves you countless hours of manually scanning listings, giving you a comprehensive snapshot of true market opportunities.";
  const steps = content?.steps || (content?.stepsJson ? JSON.parse(content.stepsJson) : [
    {
      icon: "Database",
      number: "1",
      title: "Data Collection",
      description: "We aggregate thousands of property listings in the selected markets and curate the best investment opportunities",
    },
    {
      icon: "Brain",
      number: "2",
      title: "AI Valuation & Expert Review",
      description: "Our proprietary algorithms score each listing based on potential return and risk factors, after which industry experts review final list",
    },
    {
      icon: "Mail",
      number: "3",
      title: "Weekly Email Alerts",
      description: "Every week, you get notification with list of new deals match your criteria",
    },
    {
      icon: "LayoutDashboard",
      number: "4",
      title: "Actionable Dashboard",
      description: "You also get aggregated property market analysis to make data driven decisions",
    },
  ]);

  return (
    <section id="how-it-works" className="py-16 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center mb-12">
          <h2 className="text-3xl font-bold sm:text-4xl">{title}</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            {description}
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
          {steps.map((step: any, index: number) => {
            const IconComponent = iconMap[step.icon] || Database;
            return (
              <div key={index} className="bg-card rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow text-center">
                <div className="flex justify-center mb-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <IconComponent className="h-8 w-8" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-primary mb-2">{step.number}</div>
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
