"use client";

import { Sparkles, TrendingUp, MapPin, FileText } from "lucide-react";

export default function LandingWhatsNew() {
  const updates = [
    {
      icon: Sparkles,
      date: "Coming Soon",
      title: "Trusted Advisor",
      description: "Get personalized support from experienced advisors to help you navigate deals and negotiate with agents confidently.",
      upcoming: true,
    },
    {
      icon: Sparkles,
      date: "December 2024",
      title: "Enhanced AI Valuation Models",
      description: "Our AI now analyzes 10x more data points for even more accurate property valuations.",
    },
    {
      icon: MapPin,
      date: "November 2024",
      title: "Dubai Coverage Expansion",
      description: "Added Palm Jumeirah, Dubai Marina, and Business Bay to our coverage areas.",
    },
    {
      icon: TrendingUp,
      date: "October 2024",
      title: "New Market Trend Indicators",
      description: "Track price momentum, liquidity scores, and investment velocity in real-time.",
    },
  ];

  return (
    <section id="whats-new" className="py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center mb-12">
          <h2 className="text-3xl font-bold sm:text-4xl">What's New</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Stay updated with the latest features and improvements to Rensights
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 max-w-5xl mx-auto">
          {updates.map((update) => (
            <div 
              key={update.title} 
              className={`bg-card rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow ${
                update.upcoming ? 'border-2 border-primary' : ''
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary flex-shrink-0">
                  <update.icon className="h-6 w-6" />
                </div>
                <div>
                  <div className={`text-xs font-semibold mb-1 ${update.upcoming ? 'text-primary' : 'text-primary'}`}>
                    {update.date}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{update.title}</h3>
                  <p className="text-sm text-muted-foreground">{update.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
