"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import LandingHeader from "@/components/landing/Header";
import LandingFooter from "@/components/landing/Footer";
import { useTranslations } from "@/hooks/useTranslations";

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const { t } = useTranslations("faq", {
    "faq.title": "Frequently Asked Questions",
    "faq.subtitle": "Find answers to common questions about Rensights",
    "faq.q1": "Will we have flexibility to manage it later?",
    "faq.a1": "Yes, you'll have full flexibility to manage your account, subscription, and preferences at any time through your account dashboard.",
    "faq.q2": "What payment methods do you accept?",
    "faq.a2": "We accept all major credit cards and debit cards through our secure payment processor.",
    "faq.q3": "Can I cancel my subscription anytime?",
    "faq.a3": "Yes, you can cancel your subscription at any time. Your access will continue until the end of your current billing period.",
    "faq.q4": "What happens if I exceed my report limit?",
    "faq.a4": "If you exceed your monthly report limit, you can upgrade to a higher tier or wait until the next billing cycle for your limit to reset.",
    "faq.q5": "How accurate are the property valuations?",
    "faq.a5": "Our AI-powered valuation models analyze thousands of data points including recent sales, market trends, and property characteristics to provide highly accurate estimates.",
    "faq.q6": "Do you provide support for international investors?",
    "faq.a6": "Yes, Rensights is specifically designed for foreign investors looking to invest in Dubai real estate. We provide guidance on the buying process, ownership requirements, and market insights.",
    "faq.q7": "How often is the data updated?",
    "faq.a7": "Our property data is updated weekly, and market trends are refreshed daily to ensure you have the most current information.",
    "faq.q8": "What cities are currently covered?",
    "faq.a8": "Currently, we focus on Dubai. We're continuously expanding our coverage and will notify users when new cities become available.",
  });

  const faqs = [
    {
      question: t("faq.q1"),
      answer: t("faq.a1"),
    },
    {
      question: t("faq.q2"),
      answer: t("faq.a2"),
    },
    {
      question: t("faq.q3"),
      answer: t("faq.a3"),
    },
    {
      question: t("faq.q4"),
      answer: t("faq.a4"),
    },
    {
      question: t("faq.q5"),
      answer: t("faq.a5"),
    },
    {
      question: t("faq.q6"),
      answer: t("faq.a6"),
    },
    {
      question: t("faq.q7"),
      answer: t("faq.a7"),
    },
    {
      question: t("faq.q8"),
      answer: t("faq.a8"),
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <LandingHeader />
      
      <section className="pt-32 pb-16 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {t("faq.title")}
            </h1>
            <p className="text-lg text-muted-foreground text-center mb-12">
              {t("faq.subtitle")}
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







