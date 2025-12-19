"use client";

import { Target, Users, TrendingUp, Shield } from "lucide-react";

export default function LandingAbout() {
  const values = [
    {
      icon: Target,
      title: "Data-Driven Insights",
      description: "We analyze thousands of listings using AI to surface the best opportunities.",
    },
    {
      icon: Users,
      title: "Expert Curation",
      description: "Our team of local experts verifies every insight to ensure quality.",
    },
    {
      icon: TrendingUp,
      title: "Market Intelligence",
      description: "Real-time market trends and analytics to help you invest smarter.",
    },
    {
      icon: Shield,
      title: "Investor-First",
      description: "Built for foreign investors, by people who understand the challenges.",
    },
  ];

  return (
    <section id="about" className="py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center mb-12">
          <h2 className="text-3xl font-bold sm:text-4xl">About Rensights</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            We're on a mission to make real estate investing in Dubai accessible, 
            transparent, and data-driven for foreign investors worldwide.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
          {values.map((value) => (
            <div key={value.title} className="text-center">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4">
                <value.icon className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{value.title}</h3>
              <p className="text-sm text-muted-foreground">{value.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

