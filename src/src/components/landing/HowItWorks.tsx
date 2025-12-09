"use client";

import { Database, Brain, Mail, LayoutDashboard } from "lucide-react";

export default function LandingHowItWorks() {
  const steps = [
    {
      icon: Database,
      number: "1",
      title: "Data Collection",
      description: "We aggregate thousands of property listings in the selected markets and curate the best investment opportunities",
    },
    {
      icon: Brain,
      number: "2",
      title: "AI Valuation & Expert Review",
      description: "Our proprietary algorithms score each listing based on potential return and risk factors, after which industry experts review final list",
    },
    {
      icon: Mail,
      number: "3",
      title: "Weekly Email Alerts",
      description: "Every week, you get notification with list of new deals match your criteria",
    },
    {
      icon: LayoutDashboard,
      number: "4",
      title: "Actionable Dashboard",
      description: "You also get aggregated property market analysis to make data driven decisions",
    },
  ];

  return (
    <section id="how-it-works" className="py-16 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center mb-12">
          <h2 className="text-3xl font-bold sm:text-4xl">How it works?</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Through advanced valuation algorithms, we filter and score each property based on variables like price trends, rental yields, and neighborhood growth potential. Then, you receive a list of undervalued properties with data-backed insights. It saves you countless hours of manually scanning listings, giving you a comprehensive snapshot of true market opportunities.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
          {steps.map((step) => (
            <div key={step.number} className="bg-card rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow text-center">
              <div className="flex justify-center mb-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <step.icon className="h-8 w-8" />
                </div>
              </div>
              <div className="text-2xl font-bold text-primary mb-2">{step.number}</div>
              <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
