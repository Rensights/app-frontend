"use client";

import { Check } from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";
import { useUser } from "@/context/UserContext";
import { apiClient } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import { useTranslations } from "@/hooks/useTranslations";

export default function LandingPricing() {
  const toast = useToast();
  const { user, subscription } = useUser();
  const { t } = useTranslations("pricing", {
    "pricing.title": "Pricing",
    "pricing.subtitle": "Transparent pricing for every stage of your investment journey",
    "pricing.annualNote": "Save 20% with annual billing",
    "pricing.popular": "MOST POPULAR",
    "pricing.free.name": "Free Registration",
    "pricing.free.description": "Get started with basic insights",
    "pricing.free.feature1": "1 tailored pricing analysis of properties selected by you",
    "pricing.free.feature2": "City analysis",
    "pricing.standard.name": "Standard Package",
    "pricing.standard.description": "Perfect for active property seekers",
    "pricing.standard.feature1": "5 tailored pricing analysis of properties selected by you",
    "pricing.standard.feature2": "Advanced city analysis",
    "pricing.standard.feature3": "Potentially underpriced deals",
    "pricing.trusted.name": "Trusted Advisor",
    "pricing.trusted.description": "Full support for confident investing",
    "pricing.trusted.feature1": "Everything in Standard",
    "pricing.trusted.feature2": "Trusted advisor support",
    "pricing.trusted.feature3": "Deal with agents assistance",
    "pricing.trusted.feature4": "Personalized guidance",
    "pricing.button.getStarted": "Get Started",
    "pricing.button.pay": "Pay",
    "pricing.button.requestEarlyAccess": "Request Early Access",
    "pricing.annualPriceNote": "/month billed annually",
    "pricing.free.price": "$0",
    "pricing.free.period": "/month",
    "pricing.standard.price": "$20",
    "pricing.standard.period": "/month",
    "pricing.standard.annualPrice": "$16",
    "pricing.trusted.price": "$2,000",
    "pricing.trusted.period": "/year",
  });

  const userTier = user?.userTier || subscription?.planType || null;
  const isPremiumTier = userTier === "PREMIUM" || userTier === "ENTERPRISE";
  const isFreeTier = !userTier || userTier === "FREE";

  const plans = [
    {
      id: "free",
      nameKey: "pricing.free.name",
      priceKey: "pricing.free.price",
      periodKey: "pricing.free.period",
      descriptionKey: "pricing.free.description",
      features: ["pricing.free.feature1", "pricing.free.feature2"],
    },
    {
      id: "standard",
      nameKey: "pricing.standard.name",
      priceKey: "pricing.standard.price",
      periodKey: "pricing.standard.period",
      annualPriceKey: "pricing.standard.annualPrice",
      descriptionKey: "pricing.standard.description",
      features: [
        "pricing.standard.feature1",
        "pricing.standard.feature2",
        "pricing.standard.feature3",
      ],
      popular: true,
    },
    {
      id: "trusted",
      nameKey: "pricing.trusted.name",
      priceKey: "pricing.trusted.price",
      periodKey: "pricing.trusted.period",
      descriptionKey: "pricing.trusted.description",
      features: [
        "pricing.trusted.feature1",
        "pricing.trusted.feature2",
        "pricing.trusted.feature3",
        "pricing.trusted.feature4",
      ],
      ctaKey: "pricing.button.requestEarlyAccess",
    },
  ];

  return (
    <section id="pricing" className="py-16 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center mb-12">
          <h2 className="text-3xl font-bold sm:text-4xl">{t("pricing.title")}</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            {t("pricing.subtitle")}
          </p>
          <p className="mt-2 text-sm text-primary font-semibold">
            {t("pricing.annualNote")}
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-2xl bg-card p-8 shadow-lg hover:shadow-xl transition-shadow relative flex flex-col ${
                plan.popular ? "border-2 border-primary" : "border"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-xs font-semibold">
                    {t("pricing.popular")}
                  </span>
                </div>
              )}
              <div className="text-center">
                <h3 className="text-xl font-semibold">{t(plan.nameKey)}</h3>
                <div className="mt-4 flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold">{t(plan.priceKey)}</span>
                  <span className="text-muted-foreground">{t(plan.periodKey)}</span>
                </div>
                {plan.annualPriceKey && (
                  <div className="mt-1 text-sm text-primary">
                    {t(plan.annualPriceKey)}{t("pricing.annualPriceNote")}
                  </div>
                )}
                <p className="mt-2 text-sm text-muted-foreground">
                  {t(plan.descriptionKey)}
                </p>
              </div>

              <ul className="mt-8 space-y-3 flex-grow">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{t(feature)}</span>
                  </li>
                ))}
              </ul>

              <div className="pt-8 flex justify-center mt-auto">
                {(() => {
                  // For Free Registration plan, only show "Get Started" button if user is NOT logged in
                  if (plan.id === "free") {
                    if (user) {
                      return null;
                    }
                    return (
                      <Link href="/portal/signup">
                        <Button className="w-full" variant="outline">
                          {t("pricing.button.getStarted")}
                        </Button>
                      </Link>
                    );
                  }

                  if (plan.id === "standard") {
                    // Hide if user is premium tier
                    if (isPremiumTier) {
                      return null;
                    }
                    
                    // If free tier and logged in, show "Pay" button that redirects to Stripe
                    if (isFreeTier && user) {
                      return (
                        <Button 
                          className="w-full" 
                          variant={plan.popular ? "default" : "outline"}
                          onClick={async (e) => {
                            e.preventDefault();
                            try {
                              const { url } = await apiClient.createCheckoutSession("PREMIUM");
                              if (url) {
                                window.location.href = url;
                              } else {
                                toast.showError("Failed to create checkout session");
                              }
                            } catch (err: any) {
                              toast.showError(err?.message || "Failed to start payment");
                        }
                      }}
                    >
                      {t("pricing.button.pay")}
                    </Button>
                  );
                }
                
                    if (!user) {
                      return (
                        <Link href="/portal/signup">
                          <Button className="w-full" variant={plan.popular ? "default" : "outline"}>
                            {t("pricing.button.getStarted")}
                          </Button>
                        </Link>
                      );
                    }
                  }

                  if (plan.id === "trusted") {
                    return (
                      <Link href="/portal/early-access">
                        <Button className="w-full" variant={plan.popular ? "default" : "outline"}>
                          {t(plan.ctaKey || "pricing.button.requestEarlyAccess")}
                        </Button>
                      </Link>
                    );
                  }

                  return (
                    <Link href="/portal/signup">
                      <Button className="w-full" variant={plan.popular ? "default" : "outline"}>
                        {t("pricing.button.getStarted")}
                      </Button>
                    </Link>
                  );
                })()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
