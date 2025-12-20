"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import LandingHeader from "@/components/landing/Header";
import LandingFooter from "@/components/landing/Footer";

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "Will we have flexibility to manage it later?",
      answer: "Yes, you'll have full flexibility to manage your account, subscription, and preferences at any time through your account dashboard."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards and debit cards through our secure payment processor."
    },
    {
      question: "Can I cancel my subscription anytime?",
      answer: "Yes, you can cancel your subscription at any time. Your access will continue until the end of your current billing period."
    },
    {
      question: "What happens if I exceed my report limit?",
      answer: "If you exceed your monthly report limit, you can upgrade to a higher tier or wait until the next billing cycle for your limit to reset."
    },
    {
      question: "How accurate are the property valuations?",
      answer: "Our AI-powered valuation models analyze thousands of data points including recent sales, market trends, and property characteristics to provide highly accurate estimates."
    },
    {
      question: "Do you provide support for international investors?",
      answer: "Yes, Rensights is specifically designed for foreign investors looking to invest in Dubai real estate. We provide guidance on the buying process, ownership requirements, and market insights."
    },
    {
      question: "How often is the data updated?",
      answer: "Our property data is updated weekly, and market trends are refreshed daily to ensure you have the most current information."
    },
    {
      question: "What cities are currently covered?",
      answer: "Currently, we focus on Dubai. We're continuously expanding our coverage and will notify users when new cities become available."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <LandingHeader />
      
      <section className="pt-32 pb-16 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Frequently Asked Questions
            </h1>
            <p className="text-lg text-muted-foreground text-center mb-12">
              Find answers to common questions about Rensights
            </p>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="bg-card border rounded-lg overflow-hidden"
                >
                  <button
                    onClick={() => setOpenIndex(openIndex === index ? null : index)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-muted/50 transition-colors"
                  >
                    <span className="font-semibold text-lg">{faq.question}</span>
                    <ChevronDown
                      className={`h-5 w-5 transition-transform ${
                        openIndex === index ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {openIndex === index && (
                    <div className="px-6 py-4 border-t bg-muted/30">
                      <p className="text-muted-foreground">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}



