"use client";

import { Target, Users, TrendingUp, Shield } from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";

export default function LandingAbout() {
  const { t } = useTranslations("about", {
    "about.title": "About Rensights",
    "about.subtitle": "We're on a mission to make real estate investing in Dubai accessible, transparent, and data-driven for foreign investors worldwide.",
    "about.value1.title": "Data-Driven Insights",
    "about.value1.desc": "We analyze thousands of listings using AI to surface the best opportunities.",
    "about.value2.title": "Expert Curation",
    "about.value2.desc": "Our team of local experts verifies every insight to ensure quality.",
    "about.value3.title": "Market Intelligence",
    "about.value3.desc": "Real-time market trends and analytics to help you invest smarter.",
    "about.value4.title": "Investor-First",
    "about.value4.desc": "Built for foreign investors, by people who understand the challenges.",
  });

  const values = [
    {
      icon: Target,
      title: t("about.value1.title"),
      description: t("about.value1.desc"),
    },
    {
      icon: Users,
      title: t("about.value2.title"),
      description: t("about.value2.desc"),
    },
    {
      icon: TrendingUp,
      title: t("about.value3.title"),
      description: t("about.value3.desc"),
    },
    {
      icon: Shield,
      title: t("about.value4.title"),
      description: t("about.value4.desc"),
    },
  ];

  return (
    <section id="about" className="py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center mb-12">
          <h2 className="text-3xl font-bold sm:text-4xl">{t("about.title")}</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            {t("about.subtitle")}
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
