"use client";

import { Check } from "lucide-react";
import { Button } from "@/components/landing/ui/button";
import LandingHeader from "@/components/landing/Header";
import LandingFooter from "@/components/landing/Footer";
import Link from "next/link";
import { useContext } from "react";
import { UserContext } from "@/context/UserContext";
import { apiClient } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";

export default function PricingPage() {
  // Get toast
  const toast = useToast();
  
  // Get user info to check tier
  const userContext = useContext(UserContext);
  const user = userContext?.user || null;
  const subscription = userContext?.subscription || null;
  
  const userTier = user?.userTier || subscription?.planType || null;
  const isPremiumTier = userTier === 'PREMIUM' || userTier === 'ENTERPRISE';
  const isFreeTier = !userTier || userTier === 'FREE';
  
  const plans = [
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
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <LandingHeader />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-16 overflow-visible" style={{ paddingBottom: '0.5rem' }}>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-normal bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent" style={{ lineHeight: '1.3', display: 'inline-block' }}>
              Pricing
            </h1>
          </div>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-4">
            Transparent pricing for every stage of your investment journey
          </p>
          <p className="text-lg text-primary font-semibold">
            Save 20% with annual billing
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section id="packages" className="py-16 bg-muted/30 scroll-mt-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl bg-card p-8 shadow-lg hover:shadow-xl transition-shadow relative flex flex-col ${
                  plan.popular ? "border-2 border-primary" : "border"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-xs font-semibold">
                      MOST POPULAR
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
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="pt-8 flex justify-center mt-auto">
                  {(() => {
                    // For Free Registration plan, show "Get Started" button
                    if (plan.name === "Free Registration" || plan.name?.toLowerCase().includes("free")) {
                      return (
                        <Link href="/portal/signup">
                          <Button className="w-full h-12" variant="outline">
                            Get Started
                          </Button>
                        </Link>
                      );
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
                            Pay
                          </Button>
                        );
                      }
                      
                      // If not logged in, show "Get Started" button that links to signup
                      if (!user) {
                        return (
                          <Link href="/portal/signup">
                            <Button className="w-full h-12" variant={plan.popular ? "default" : "outline"}>
                              Get Started
                            </Button>
                          </Link>
                        );
                      }
                    }
                    
                    // Default behavior for other plans
                    if (plan.ctaText === "Request Early Access") {
                      return (
                        <Link href="/portal/early-access">
                          <Button className="w-full h-12" variant={plan.popular ? "default" : "outline"}>
                            {plan.ctaText}
                          </Button>
                        </Link>
                      );
                    } else {
                      return (
                        <Link href="/portal/signup">
                          <Button className="w-full h-12" variant={plan.popular ? "default" : "outline"}>
                            Get Started
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
              Why Choose Rensights?
            </h2>
            <p className="text-lg text-muted-foreground">
              Data-driven insights to help you make smarter property investment decisions
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-4">
                <Check className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No Hidden Fees</h3>
              <p className="text-muted-foreground">
                Transparent pricing with no surprises
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-4">
                <Check className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Cancel Anytime</h3>
              <p className="text-muted-foreground">
                No long-term commitments required
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-4">
                <Check className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Expert Support</h3>
              <p className="text-muted-foreground">
                Get help when you need it most
              </p>
            </div>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}

