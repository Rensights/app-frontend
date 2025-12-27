"use client";

import { Button, buttonVariants } from "./ui/button";
import { Map, TrendingUp, FileCheck, ArrowRight, Building2, Search, CheckCircle2, LineChart, Target, Shield } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";

const iconMap: Record<string, any> = {
  Map, TrendingUp, FileCheck, Building2, Search, CheckCircle2, Target, Shield,
};

export default function LandingSolutions() {
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
      console.error("Error loading solutions content:", error);
      // Fallback will be handled in render
      setContent({});
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="py-20 text-center">Loading...</div>;
  }

  const title = content?.title || "Your Journey to Smart Property Investment";
  const subtitle = content?.subtitle || "A data-driven, step-by-step approach to finding and validating the best property deals in Dubai";
  const bottomTitle = content?.bottomTitle || "Ready to Start Your Investment Journey?";
  const bottomDescription = content?.bottomDescription || "Join thousands of smart investors who are using data-driven insights to find the best property deals in Dubai";
  const solutions = content?.solutions || (content?.solutionsJson ? JSON.parse(content.solutionsJson) : [
    {
      id: "explore-learn",
      icon: "Map",
      badge: "Step 1",
      title: "Explore & Learn",
      subtitle: "Don't know where to start?",
      description: "Get comprehensive city insights with interactive dashboards and detailed guides.",
      features: [
        { icon: "Building2", text: "City dashboards with prices, yields, and growth areas" },
        { icon: "FileCheck", text: "Step-by-step guide on buying process and ownership" },
      ],
      color: "from-blue-500 to-cyan-500",
      link: "/solutions",
    },
    {
      id: "find-deals",
      icon: "Search",
      badge: "Step 2",
      title: "Find Deals",
      subtitle: "Looking for the best deals?",
      description: "Discover potentially underpriced properties through AI-powered analysis and expert filtering.",
      features: [
        { icon: "Target", text: "AI-powered deal scores based on yield signals" },
        { icon: "TrendingUp", text: "Expert-filtered shortlists matching your criteria" },
      ],
      color: "from-purple-500 to-pink-500",
      link: "/solutions",
    },
    {
      id: "validate-invest",
      icon: "FileCheck",
      badge: "Step 3",
      title: "Validate & Invest",
      subtitle: "Already found a property?",
      description: "Get expert validation with data-backed price analysis and comprehensive risk assessment.",
      features: [
        { icon: "CheckCircle2", text: "Price check using live market comparables" },
        { icon: "Shield", text: "Risk, liquidity, and appreciation insights" },
      ],
      color: "from-orange-500 to-red-500",
      link: "/solutions",
    },
  ]);

  return (
    <section id="solutions" className="py-20 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-16 text-center max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold sm:text-5xl mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {title}
          </h2>
          <p className="text-lg text-muted-foreground">
            {subtitle}
          </p>
        </div>

        {/* Solutions Grid */}
        <div className="grid gap-8 md:grid-cols-3 max-w-7xl mx-auto relative">
          {solutions.map((solution: any, index: number) => {
            const Icon = iconMap[solution.icon] || Map;
            return (
              <article
                key={solution.id || index}
                className="group relative"
              >
                {/* Connection Arrow (between cards) */}
                {index < solutions.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <ArrowRight className="w-8 h-8 text-primary/40 animate-pulse" />
                  </div>
                )}

                {/* Card */}
                <div className="relative h-full rounded-3xl border-2 border-border bg-card p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden flex flex-col">
                  {/* Gradient Background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${solution.color || 'from-blue-500 to-cyan-500'} opacity-0 group-hover:opacity-5 transition-opacity duration-500 pointer-events-none`} />
                  
                  {/* Badge */}
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6">
                    {solution.badge}
                  </div>

                  {/* Icon with animated background */}
                  <div className="relative mb-6">
                    <div className={`absolute inset-0 bg-gradient-to-br ${solution.color || 'from-blue-500 to-cyan-500'} opacity-10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500`} />
                    <div className={`relative flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br ${solution.color || 'from-blue-500 to-cyan-500'} shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500`}>
                      <Icon className="h-10 w-10 text-white" />
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-2xl font-bold mb-2">{solution.title}</h3>
                  <p className="text-sm font-medium text-muted-foreground mb-3">{solution.subtitle}</p>
                  <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{solution.description}</p>
                  
                  {/* Features with icons */}
                  <ul className="space-y-4 mb-8 flex-grow">
                    {solution.features?.map((feature: any, idx: number) => {
                      const FeatureIcon = iconMap[feature.icon] || Building2;
                      return (
                        <li key={idx} className="flex items-start gap-3 group/item">
                          <div className="flex-shrink-0 mt-0.5">
                            <div className="p-1.5 rounded-lg bg-primary/10 group-hover/item:bg-primary/20 transition-colors">
                              <FeatureIcon className="h-4 w-4 text-primary" />
                            </div>
                          </div>
                          <span className="text-sm leading-relaxed">{feature.text}</span>
                        </li>
                      );
                    })}
                  </ul>

                  {/* CTA Button */}
                  <div className="pt-6 border-t border-border relative z-10 mt-auto">
                    <Link 
                      href={solution.link || "/solutions"}
                      className={cn(buttonVariants({ size: "sm", variant: "default" }), "w-full group/btn relative z-10")}
                    >
                      {solution.ctaText || "Explore"}
                      <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
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
