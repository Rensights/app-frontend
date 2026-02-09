"use client";

import { Check } from "lucide-react";
import { Button } from "@/components/landing/ui/button";
import LandingHeader from "@/components/landing/Header";
import LandingFooter from "@/components/landing/Footer";
import Link from "next/link";
import { useUser } from "@/context/UserContext";
import { apiClient } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import { useTranslations } from "@/hooks/useTranslations";

export default function PricingPage() {
  // Get toast
  const toast = useToast();
  
  // Get user info to check tier
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
    "pricing.why.title": "Why Choose Rensights?",
    "pricing.why.subtitle": "Data-driven insights to help you make smarter property investment decisions",
    "pricing.why.noFees.title": "No Hidden Fees",
    "pricing.why.noFees.desc": "Transparent pricing with no surprises",
    "pricing.why.cancel.title": "Cancel Anytime",
    "pricing.why.cancel.desc": "No long-term commitments required",
    "pricing.why.support.title": "Expert Support",
    "pricing.why.support.desc": "Get help when you need it most",
  });
  
  const userTier = user?.userTier || subscription?.planType || null;
  const isPremiumTier = userTier === 'PREMIUM' || userTier === 'ENTERPRISE';
  const isFreeTier = !userTier || userTier === 'FREE';
  
  const plans = [
    {
      id: "free",
      nameKey: "pricing.free.name",
      price: "$0",
      period: "/month",
      descriptionKey: "pricing.free.description",
      features: [
        "pricing.free.feature1",
        "pricing.free.feature2",
      ],
    },
    {
      id: "standard",
      nameKey: "pricing.standard.name",
      price: "$20",
      period: "/month",
      annualPrice: "$16",
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
      price: "$2,000",
      period: "/year",
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
    <div className="min-h-screen bg-background">
      <LandingHeader />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-16 leading-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent pb-2">
            {t("pricing.title")}
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-4">
            {t("pricing.subtitle")}
          </p>
          <p className="text-lg text-primary font-semibold">
            {t("pricing.annualNote")}
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section id="packages" className="py-16 bg-muted/30 scroll-mt-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
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
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                  {plan.annualPrice && (
                    <div className="mt-1 text-sm text-primary">
                      {plan.annualPrice}{t("pricing.annualPriceNote")}
                    </div>
                  )}
                  <p className="mt-2 text-sm text-muted-foreground">{t(plan.descriptionKey)}</p>
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
                      // Hide button if user is already logged in
                      if (user) {
                        return null;
                      }
                      return (
                        <Link href="/portal/signup">
                          <Button className="w-full h-12" variant="outline">
                            {t("pricing.button.getStarted")}
                          </Button>
                        </Link>
                      );
                    }
                    
                    // For Standard Package
                    if (plan.id === "standard") {
                      // Hide if user is premium tier
                      if (isPremiumTier) {
                        return null;
                      }
                      
                      // If free tier and logged in, show "Pay" button that redirects to Stripe
                      if (isFreeTier && user) {
                        return (
                          <Button 
                            className="w-full h-12" 
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
                      
                      // If not logged in, show "Get Started" button that links to signup
                      if (!user) {
                        return (
                          <Link href="/portal/signup">
                            <Button className="w-full h-12" variant={plan.popular ? "default" : "outline"}>
                              {t("pricing.button.getStarted")}
                            </Button>
                          </Link>
                        );
                      }
                    }
                    
                    // Default behavior for other plans
                    if (plan.id === "trusted") {
                      return (
                        <Link href="/portal/early-access">
                          <Button className="w-full h-12" variant={plan.popular ? "default" : "outline"}>
                            {t(plan.ctaKey || "pricing.button.requestEarlyAccess")}
                          </Button>
                        </Link>
                      );
                    } else {
                      return (
                        <Link href="/portal/signup">
                          <Button className="w-full h-12" variant={plan.popular ? "default" : "outline"}>
                            {t("pricing.button.getStarted")}
                          </Button>
                        </Link>
                      );
                    }
                  })()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ or Additional Info Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t("pricing.why.title")}
            </h2>
            <p className="text-lg text-muted-foreground">
              {t("pricing.why.subtitle")}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-4">
                <Check className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{t("pricing.why.noFees.title")}</h3>
              <p className="text-muted-foreground">
                {t("pricing.why.noFees.desc")}
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-4">
                <Check className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{t("pricing.why.cancel.title")}</h3>
              <p className="text-muted-foreground">
                {t("pricing.why.cancel.desc")}
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-4">
                <Check className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{t("pricing.why.support.title")}</h3>
              <p className="text-muted-foreground">
                {t("pricing.why.support.desc")}
              </p>
            </div>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
