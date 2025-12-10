"use client";

import { Check } from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";

export default function LandingPricing() {
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
    },
  ];

  return (
    <section id="pricing" className="py-16 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center mb-12">
          <h2 className="text-3xl font-bold sm:text-4xl">Choose Your Plan</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Transparent pricing for every stage of your investment journey
          </p>
          <p className="mt-2 text-sm text-primary font-semibold">
            Save 20% with annual billing
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl bg-card p-8 shadow-lg hover:shadow-xl transition-shadow relative ${
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

              <ul className="mt-8 space-y-3">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8 flex justify-center">
                <Link href="/portal/signup">
                  <Button className="w-full" variant={plan.popular ? "default" : "outline"}>
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

