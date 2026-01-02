"use client";

import { Button } from "./ui/button";
import { LineChart, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";

export default function LandingCTA() {
  const { language } = useLanguage();
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContent();
  }, [language]);

  const loadContent = async () => {
    try {
      const data = await apiClient.getLandingPageSection('solutions', language);
      setContent(data.content || {});
    } catch (error) {
      console.error("Error loading CTA content:", error);
      setContent({});
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="py-16 text-center">Loading...</div>;
  }

  const bottomTitle = content?.bottomTitle || "Ready to Start Your Investment Journey?";
  const bottomDescription = content?.bottomDescription || "Join thousands of smart investors who are using data-driven insights to find the best property deals in Dubai";

  return (
    <section className="py-20 bg-gradient-to-b from-muted/30 to-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="inline-flex flex-col items-center gap-4 p-8 rounded-2xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
            <LineChart className="w-12 h-12 text-primary" />
            <h3 className="text-2xl font-bold">{bottomTitle}</h3>
            <p className="text-muted-foreground max-w-2xl">
              {bottomDescription}
            </p>
            <Link href="/pricing">
              <Button size="lg" className="mt-4">
                {content?.bottomCtaText || "Get Started Today"} <ArrowRight className="ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}


