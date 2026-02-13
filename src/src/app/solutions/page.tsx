"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { ArrowRight, Map, Search, FileCheck, Building2, Target, TrendingUp, CheckCircle2, Shield } from "lucide-react";
import { Button } from "@/components/landing/ui/button";
import LandingHeader from "@/components/landing/Header";
import LandingFooter from "@/components/landing/Footer";
import Link from "next/link";
import { useTranslations } from "@/hooks/useTranslations";
import { apiClient } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";

const DEFAULT_VIDEO_IDS = [
  "dQw4w9WgXcQ",
  "dQw4w9WgXcQ",
  "dQw4w9WgXcQ",
  "dQw4w9WgXcQ",
];

const parseYouTubeId = (value: string | null | undefined): string | null => {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  // If already looks like a YouTube ID, return as-is
  if (/^[a-zA-Z0-9_-]{10,}$/.test(trimmed) && !trimmed.includes("/")) {
    return trimmed;
  }

  // Try to extract from common YouTube URL formats
  const match =
    trimmed.match(/[?&]v=([^&]+)/) ||
    trimmed.match(/youtu\.be\/([^?&#/]+)/) ||
    trimmed.match(/youtube\.com\/embed\/([^?&#/]+)/);

  return match?.[1] || null;
};

const extractVideoIds = (content: Record<string, any>): string[] => {
  if (!content) return [];

  if (Array.isArray(content.videos)) {
    return content.videos
      .map((v: any) => parseYouTubeId(typeof v === "string" ? v : v?.url || v?.id))
      .filter(Boolean) as string[];
  }

  if (typeof content.videos === "string") {
    try {
      const parsed = JSON.parse(content.videos);
      if (Array.isArray(parsed)) {
        return parsed
          .map((v: any) => parseYouTubeId(typeof v === "string" ? v : v?.url || v?.id))
          .filter(Boolean) as string[];
      }
    } catch {
      const single = parseYouTubeId(content.videos);
      if (single) {
        return [single];
      }
    }
  }

  if (typeof content.videosJson === "string") {
    try {
      const parsed = JSON.parse(content.videosJson);
      if (Array.isArray(parsed)) {
        return parsed
          .map((v: any) => parseYouTubeId(typeof v === "string" ? v : v?.url || v?.id))
          .filter(Boolean) as string[];
      }
    } catch {
      // Ignore malformed JSON
    }
  }

  const keyMatches = Object.keys(content)
    .filter((key) =>
      /^video\d+$/i.test(key) ||
      /^youtube\d+$/i.test(key) ||
      /^solutionVideo\d+$/i.test(key) ||
      /^solutionsVideo\d+$/i.test(key)
    )
    .sort((a, b) => {
      const aNum = parseInt(a.replace(/\D+/g, ""), 10);
      const bNum = parseInt(b.replace(/\D+/g, ""), 10);
      return aNum - bNum;
    });

  return keyMatches
    .map((key) => parseYouTubeId(content[key]))
    .filter(Boolean) as string[];
};

export default function SolutionsPage() {
  const { language } = useLanguage();
  const { t } = useTranslations("solutions", {
    "solutions.title": "Solutions",
    "solutions.subtitle": "Data-driven tools to find potentially underpriced properties before everyone else",
    "solutions.step1.badge": "Step 1",
    "solutions.step1.title": "Explore & Learn",
    "solutions.step1.subtitle": "Don't know where to start?",
    "solutions.step1.description": "Get comprehensive city insights with interactive dashboards and detailed guides.",
    "solutions.step1.feature1": "City dashboards with prices, yields, and growth areas",
    "solutions.step1.feature2": "Step-by-step guide on buying process and ownership",
    "solutions.step2.badge": "Step 2",
    "solutions.step2.title": "Find Deals",
    "solutions.step2.subtitle": "Looking for the best deals?",
    "solutions.step2.description": "Discover potentially underpriced properties through AI-powered analysis and expert filtering.",
    "solutions.step2.feature1": "AI-powered deal scores based on yield signals",
    "solutions.step2.feature2": "Expert-filtered shortlists matching your criteria",
    "solutions.step2.metric": "10K+ properties and transactions analyzed weekly",
    "solutions.step3.badge": "Step 3",
    "solutions.step3.title": "Validate & Invest",
    "solutions.step3.subtitle": "Already found a property?",
    "solutions.step3.description": "Get expert validation with data-backed price analysis and comprehensive risk assessment.",
    "solutions.step3.feature1": "Price check using live market comparables",
    "solutions.step3.feature2": "Risk, liquidity, and appreciation insights",
    "solutions.step4.badge": "Step 4",
    "solutions.step4.title": "Monitor & Optimize",
    "solutions.step4.subtitle": "Keep your portfolio on track",
    "solutions.step4.description": "Track performance, optimize returns, and stay ahead with continuous market updates.",
    "solutions.step4.feature1": "Performance tracking dashboards",
    "solutions.step4.feature2": "Market alerts and optimization insights",
    "solutions.cta.title": "Ready to Start Your Investment Journey?",
    "solutions.cta.subtitle": "Join thousands of investors using data-driven insights to find the best property deals in Dubai",
    "solutions.cta.button": "Start Free Trial",
    "solutions.disclaimer.title": "Disclaimer",
    "solutions.disclaimer.body": "Rensights provides property market data and analysis for informational purposes only. We are not licensed property valuers, and our estimates do not constitute formal valuations under any regulatory framework. Nothing on this platform should be considered investment, financial, legal, or tax advice. All data is sourced from public records and third-party listing sources, and may contain inaccuracies or delays. Users should conduct their own due diligence and consult qualified professionals before making any property decisions. Past performance and historical trends do not guarantee future results.",
  });
  const [videoIds, setVideoIds] = useState<string[]>(DEFAULT_VIDEO_IDS);

  useEffect(() => {
    const loadVideos = async () => {
      try {
        const data = await apiClient.getLandingPageSection("solutions", language);
        const extracted = extractVideoIds(data?.content || {});
        if (extracted.length > 0) {
          const padded = [...extracted, ...DEFAULT_VIDEO_IDS].slice(0, 4);
          setVideoIds(padded);
        }
      } catch {
        // Keep defaults if content fetch fails
      }
    };
    loadVideos();
  }, [language]);

  return (
    <div className="min-h-screen bg-background">
      <LandingHeader />
      
      {/* Page Title Section */}
      <section className="pt-32 pb-8 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {t("solutions.title")}
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
            {t("solutions.subtitle")}
          </p>
        </div>
      </section>

      {/* Solution 1: Explore & Learn */}
      <SolutionSection
        id="explore-learn"
        badge={t("solutions.step1.badge")}
        icon={Map}
        title={t("solutions.step1.title")}
        subtitle={t("solutions.step1.subtitle")}
        description={t("solutions.step1.description")}
        features={[
          { icon: Building2, text: t("solutions.step1.feature1") },
          { icon: FileCheck, text: t("solutions.step1.feature2") }
        ]}
        youtubeId={videoIds[0]}
      />

      {/* Solution 2: Find Deals */}
      <SolutionSection
        id="find-deals"
        badge={t("solutions.step2.badge")}
        icon={Search}
        title={t("solutions.step2.title")}
        subtitle={t("solutions.step2.subtitle")}
        description={t("solutions.step2.description")}
        features={[
          { icon: Target, text: t("solutions.step2.feature1") },
          { icon: TrendingUp, text: t("solutions.step2.feature2") }
        ]}
        metric={t("solutions.step2.metric")}
        showButton={false}
        youtubeId={videoIds[1]}
        reverse
      />

      {/* Solution 3: Validate & Invest */}
      <SolutionSection
        id="validate-invest"
        badge={t("solutions.step3.badge")}
        icon={FileCheck}
        title={t("solutions.step3.title")}
        subtitle={t("solutions.step3.subtitle")}
        description={t("solutions.step3.description")}
        features={[
          { icon: CheckCircle2, text: t("solutions.step3.feature1") },
          { icon: Shield, text: t("solutions.step3.feature2") }
        ]}
        youtubeId={videoIds[2]}
      />

      {videoIds[3] && (
        <SolutionSection
          id="monitor-optimize"
          badge={t("solutions.step4.badge")}
          icon={TrendingUp}
          title={t("solutions.step4.title")}
          subtitle={t("solutions.step4.subtitle")}
          description={t("solutions.step4.description")}
          features={[
            { icon: CheckCircle2, text: t("solutions.step4.feature1") },
            { icon: Shield, text: t("solutions.step4.feature2") }
          ]}
          youtubeId={videoIds[3]}
          reverse
        />
      )}

      {/* Bottom CTA */}
      <section className="py-12 bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {t("solutions.cta.title")}
            </h2>
            <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
              {t("solutions.cta.subtitle")}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/portal/signup">
                <Button size="lg" className="text-lg px-10 py-7 h-auto shadow-lg">
                  {t("solutions.cta.button")} <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-10 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto rounded-2xl border border-amber-200/80 bg-amber-50/80 px-6 py-6 text-amber-900 shadow-sm">
            <h3 className="text-xl font-semibold mb-3">{t("solutions.disclaimer.title")}</h3>
            <p className="text-sm leading-relaxed text-amber-900/90">
              {t("solutions.disclaimer.body")}
            </p>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}

// Reusable Solution Section Component
interface SolutionSectionProps {
  id: string;
  badge: string;
  icon: any;
  title: string;
  subtitle: string;
  description: string;
  features: { icon: any; text: string }[];
  metric?: string;
  showButton?: boolean;
  youtubeId: string;
  reverse?: boolean;
}

function SolutionSection({
  id,
  badge,
  icon: Icon,
  title,
  subtitle,
  description,
  features,
  metric,
  showButton = true,
  youtubeId,
  reverse = false
}: SolutionSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: false, margin: "-20%" });
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.9, 1, 1, 0.9]);

  return (
    <section 
      ref={sectionRef}
      id={id}
      className="relative py-12 overflow-hidden"
    >
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-muted/30 to-background" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          className={`grid lg:grid-cols-2 gap-16 ${reverse ? 'lg:flex-row-reverse' : ''}`}
          style={{ opacity, scale }}
        >
          {/* Content */}
          <motion.div 
            className={`flex flex-col ${reverse ? 'lg:order-2' : ''}`}
            initial={{ opacity: 0, x: reverse ? 50 : -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: reverse ? 50 : -50 }}
            transition={{ duration: 0.8 }}
          >
            {/* Badge and Icon */}
            <div className="flex items-center gap-4 mb-8">
              <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary/10 text-primary text-base font-semibold">
                {badge}
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg">
                <Icon className="h-7 w-7 text-white" />
              </div>
            </div>

            {/* Text Content - Aligned with video top */}
            <div>
              <h2 className="text-5xl lg:text-6xl font-bold mb-4 leading-tight">{title}</h2>
              <p className="text-2xl text-muted-foreground mb-6 font-medium">{subtitle}</p>
              <p className="text-xl leading-relaxed text-foreground/90 mb-8">{description}</p>
            </div>

            {/* Features */}
            <ul className="space-y-5">
              {features.map((feature, idx) => {
                const FeatureIcon = feature.icon;
                return (
                  <motion.li 
                    key={idx}
                    className="flex items-start gap-4"
                    initial={{ opacity: 0, x: -20 }}
                    animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                  >
                    <div className="flex-shrink-0 p-2.5 rounded-lg bg-primary/10">
                      <FeatureIcon className="h-6 w-6 text-primary" />
                    </div>
                    <span className="text-lg leading-relaxed pt-1">{feature.text}</span>
                  </motion.li>
                );
              })}
            </ul>

          </motion.div>

          {/* YouTube Embed */}
          <motion.div 
            className={`relative ${reverse ? 'lg:order-1' : ''}`}
            initial={{ opacity: 0, x: reverse ? -50 : 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: reverse ? -50 : 50 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            style={{ paddingTop: '88px' }}
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-video bg-muted">
              <iframe
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${youtubeId}`}
                title={`${title} Demo`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
              
              {/* Decorative Border */}
              <motion.div
                className="absolute inset-0 border-4 border-primary/20 rounded-2xl pointer-events-none"
                animate={{
                  borderColor: ["hsl(var(--primary) / 0.2)", "hsl(var(--primary) / 0.4)", "hsl(var(--primary) / 0.2)"]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            </div>
          </motion.div>
        </motion.div>
        
        {/* Metric - Show below video section, spanning full width */}
        {metric && (
          <motion.div 
            className="mt-8 text-center w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {metric}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
