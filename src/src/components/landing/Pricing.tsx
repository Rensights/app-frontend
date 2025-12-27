"use client";

import { Check } from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";
import { useContext } from "react";
import { UserContext } from "@/context/UserContext";
import { useToast } from "@/components/ui/Toast";

export default function LandingPricing() {
  const { language } = useLanguage();
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Get toast
  const toast = useToast();
  
  // Get user info to check tier
  const userContext = useContext(UserContext);
  const user = userContext?.user || null;
  const subscription = userContext?.subscription || null;
  
  const userTier = user?.userTier || subscription?.planType || null;
  const isPremiumTier = userTier === 'PREMIUM' || userTier === 'ENTERPRISE';
  const isFreeTier = !userTier || userTier === 'FREE';

  useEffect(() => {
    loadContent();
  }, [language]);

  const loadContent = async () => {
    try {
      const data = await apiClient.getLandingPageSection('pricing', language);
      setContent(data.content || {});
    } catch (error: any) {
      // Only log errors that aren't 404s (404 means section doesn't exist in DB, which is fine)
      if (error?.status !== 404) {
        console.error("Error loading pricing content:", error);
      }
      setContent({});
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="py-16 text-center">Loading...</div>;
  }

  const title = content?.title || "Choose Your Plan";
  const subtitle = content?.subtitle || "Transparent pricing for every stage of your investment journey";
  const savingsText = content?.savingsText || "Save 20% with annual billing";
  const plans = content?.plans || (content?.plansJson ? JSON.parse(content.plansJson) : [
    {
      name: "Free Registration",
      price: "$0",
      period: "/month",
      description: "Get started with basic insights",
      features: [
        "1 tailored pricing analysis of properties selected by you",
        "City analysis",
      ],
    },
    {
      name: "Standard Package",
      price: "$20",
      period: "/month",
      annualPrice: "$16",
      description: "Perfect for active property seekers",
      features: [
        "5 tailored pricing analysis of properties selected by you",
        "Advanced city analysis",
        "Potentially underpriced deals",
      ],
      popular: true,
    },
    {
      name: "Trusted Advisor",
      price: "$2,000",
      period: "/year",
      description: "Full support for confident investing",
      features: [
        "Everything in Standard",
        "Trusted advisor support",
        "Deal with agents assistance",
        "Personalized guidance",
      ],
      ctaText: "Request Early Access",
      ctaHref: "/portal/early-access",
    },
  ]);

  return (
    <section id="pricing" className="py-16 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center mb-12">
          <h2 className="text-3xl font-bold sm:text-4xl">{title}</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            {subtitle}
          </p>
          <p className="mt-2 text-sm text-primary font-semibold">
            {savingsText}
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
          {plans.map((plan: any, index: number) => (
            <div
              key={index}
              className={`rounded-2xl bg-card p-8 shadow-lg hover:shadow-xl transition-shadow relative flex flex-col ${
                plan.popular ? "border-2 border-primary" : "border"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-xs font-semibold">
                    {plan.popularBadge || "MOST POPULAR"}
                  </span>
                </div>
              )}
              <div className="text-center">
                <h3 className="text-xl font-semibold">{plan.name}</h3>
                <div className="mt-4 flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                {plan.annualPrice && (
                  <div className="mt-1 text-sm text-primary">
                    {plan.annualPrice}/month billed annually
                  </div>
                )}
                <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>
              </div>

              <ul className="mt-8 space-y-3 flex-grow">
                {plan.features?.map((feature: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="pt-8 flex justify-center mt-auto">
                {(() => {
                  // Hide Free plan button
                  if (plan.name === "Free Registration" || plan.name?.toLowerCase().includes("free")) {
                    return null;
                  }
                  
                  // For Standard Package
                  if (plan.name === "Standard Package" || plan.name?.toLowerCase().includes("standard")) {
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
                          Pay
                        </Button>
                      );
                    }
                    
                    // If not logged in, show "Get Started" button that links to signup
                    if (!user) {
                      return (
                        <Link href="/portal/signup">
                          <Button className="w-full" variant={plan.popular ? "default" : "outline"}>
                            Get Started
                          </Button>
                        </Link>
                      );
                    }
                  }
                  
                  // Default behavior for other plans
                  return (
                    <Link href={plan.ctaHref ?? "/pricing"}>
                      <Button className="w-full" variant={plan.popular ? "default" : "outline"}>
                        {plan.ctaText ?? "Get Started"}
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
