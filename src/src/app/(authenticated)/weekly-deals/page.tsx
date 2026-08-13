"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { apiClient, DealsSummary } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useWeeklyDealsEnabled } from "@/hooks/useWeeklyDealsEnabled";
import "../deals/deals.css";
import { useTranslations } from "@/hooks/useTranslations";

/** Summary values arrive display-ready from the module; an absent one must not be faked. */
const displayValue = (value: string | number | null | undefined): string =>
  value === null || value === undefined || value === "" ? "N/A" : String(value);

export default function WeeklyDealsPage() {
  const router = useRouter();
  const toast = useToast();
  const { user } = useUser();
  const isFreeUser = !user || user.userTier === 'FREE';
  const [isUpgrading, setIsUpgrading] = useState(false);
  const { enabled: weeklyDealsEnabled, loading: weeklyDealsLoading } = useWeeklyDealsEnabled();
  // Weekly highlights come from the valuation module's GET /deals -> summary, mapped by the
  // backend. One 1-row request: the page needs the summary block, not the deals themselves.
  const [summary, setSummary] = useState<DealsSummary | null>(null);
  const { t, ready, error } = useTranslations("weeklyDeals", {
    "weeklyDeals.section.title": "Weekly Property Deals",
    "weeklyDeals.alert.title": "Latest Alert",
    "weeklyDeals.alert.subtitle": "Hot deals discovered across Dubai areas this week!",
    // The area rows, the total and the three highlight values are no longer copy — they come
    // from the valuation module's summary, so only the labels are translated here.
    "weeklyDeals.alert.deals": "deals",
    "weeklyDeals.alert.total": "Total active alerts:",
    "weeklyDeals.alert.view": "View This Week's Alerts",
    "weeklyDeals.highlights.title": "This Week's Highlights",
    "weeklyDeals.highlights.market": "🔥 Hottest market:",
    "weeklyDeals.highlights.discount": "💎 Best discount found:",
    "weeklyDeals.highlights.performing": "🏆 Best performing area:",
    "weeklyDeals.about.title": "About Deal Alerts",
    "weeklyDeals.about.p1": "Our AI-powered system analyzes thousands of properties daily to identify underpriced opportunities across Dubai.",
    "weeklyDeals.about.p2": "Each deal is verified by expert analysts to ensure accuracy and potential value. Get notified weekly about properties priced significantly below market value in prime locations.",
    "weeklyDeals.disclaimer.title": "Disclaimer",
    "weeklyDeals.disclaimer.body": "This report is generated for informational and educational purposes only. Rensights.com is a data analytics provider, not a licensed real estate brokerage, financial advisor, or legal consultant. The \"Estimated Price\" and \"Scores\" provided are based on automated algorithms and third-party data; they do not constitute a formal appraisal or a guarantee of profit. All investments carry risk. We strongly recommend consulting with a licensed professional before making any financial commitments.",
    "weeklyDeals.disclaimer.verificationTitle": "Verification Note",
    "weeklyDeals.disclaimer.verificationBody": "We scan external websites for pricing anomalies. We do not verify the physical condition, legal title, or the authenticity of the listing. Users must perform their own due diligence (physical viewing and title deed verification) before transferring funds to any third party.",
    "weeklyDeals.disclaimer.appraisalTitle": "No Formal Appraisal",
    "weeklyDeals.disclaimer.appraisalBody": "The property estimates and scores provided by this platform are generated via automated machine learning algorithms and do not constitute a formal, legal, or professional real estate appraisal. This platform does not account for the physical condition, interior upgrades, or latent defects of a property.",
    "weeklyDeals.disclaimer.sourcesTitle": "Data Sources",
    "weeklyDeals.disclaimer.sourcesBody": "Dubai Land Department (DLD), Bayut, and various public records.",
  });
  const { t: tPricing } = useTranslations("pricing", {
    "pricing.standard.upgradeTitle": "Upgrade to Standard Package",
    "pricing.standard.upgradeSubtitle": "Access exclusive deals and premium features with Standard Package.",
    "pricing.standard.upgradeFeature4": "Full access to property analytics",
    "pricing.standard.upgradeButton": "Upgrade to Standard Package",
    "pricing.standard.price": "$59",
    "pricing.standard.period": "/month",
    "pricing.standard.feature1": "5 tailored pricing analysis of properties selected by you",
    "pricing.standard.feature2": "Advanced city analysis",
    "pricing.standard.feature3": "Potentially underpriced deals",
  });

  const handleUpgrade = async () => {
    try {
      setIsUpgrading(true);
      const { url } = await apiClient.createCheckoutSession('PREMIUM', 'upsell');
      if (url) {
        window.location.href = url;
      } else {
        toast.showError("Failed to create checkout session. Please try again.");
        setIsUpgrading(false);
      }
    } catch (err: any) {
      toast.showError(err?.message || "Failed to start upgrade process. Please try again.");
      setIsUpgrading(false);
    }
  };

  useEffect(() => {
    if (weeklyDealsEnabled === false) {
      router.replace("/dashboard");
    }
  }, [weeklyDealsEnabled, router]);

  useEffect(() => {
    // FREE users get a 403 from /api/deals and only ever see the blurred upgrade overlay,
    // so there is nothing to load for them.
    if (weeklyDealsEnabled !== true || isFreeUser) return;
    let cancelled = false;
    apiClient
      .getDeals(0, 1)
      .then((response) => {
        if (!cancelled) setSummary(response.summary ?? null);
      })
      .catch(() => {
        if (!cancelled) setSummary(null);
      });
    return () => {
      cancelled = true;
    };
  }, [weeklyDealsEnabled, isFreeUser]);

  if (error) {
    return (
      <div className="py-24 text-center text-muted-foreground">
        <p>Something went wrong loading this page. Please refresh and try again.</p>
      </div>
    );
  }

  // Hold until translations arrive so we never flash the default text.
  if (weeklyDealsLoading || !ready) {
    return <LoadingSpinner fullPage message="Loading..." />;
  }

  if (weeklyDealsEnabled === false) {
    return <LoadingSpinner fullPage message="Redirecting..." />;
  }

  return (
    <section
      className="content-section active weekly-deals-page"
      style={{ position: "relative" }}
    >
      {isFreeUser && (
        <div className="upgrade-overlay">
            <div className="upgrade-content">
              <div className="upgrade-icon">🔒</div>
            <h2>{tPricing("pricing.standard.upgradeTitle")}</h2>
            <div className="upgrade-pricing">
              <div className="pricing-amount">
                <span className="pricing-amount-value">
                  {tPricing("pricing.standard.price")}
                </span>
                <span className="pricing-period">{tPricing("pricing.standard.period")}</span>
              </div>
            </div>
            <p>{tPricing("pricing.standard.upgradeSubtitle")}</p>
            <ul className="upgrade-features">
              <li>✓ {tPricing("pricing.standard.feature1")}</li>
              <li>✓ {tPricing("pricing.standard.feature2")}</li>
              <li>✓ {tPricing("pricing.standard.feature3")}</li>
              <li>✓ {tPricing("pricing.standard.upgradeFeature4")}</li>
            </ul>
            <button 
              className="upgrade-button" 
              onClick={handleUpgrade}
              disabled={isUpgrading}
            >
              {isUpgrading ? "Processing..." : tPricing("pricing.standard.upgradeButton")}
            </button>
          </div>
        </div>
      )}
      <div style={{ opacity: isFreeUser ? 0.4 : 1, pointerEvents: isFreeUser ? 'none' : 'auto' }}>
        <div className="section-card">
          <div className="section-title">{t("weeklyDeals.section.title")}</div>

          <div className="alert-item">
            <div className="alert-title">{t("weeklyDeals.alert.title")}</div>
            <div className="alert-desc">
              {t("weeklyDeals.alert.subtitle")}
            </div>

            <div className="alert-list">
              {(summary?.topAreas ?? []).map((topArea) => (
                <div key={topArea.area} className="alert-row">
                  <span>{topArea.area}</span>
                  <span className="alert-number">
                    {topArea.count} {t("weeklyDeals.alert.deals")}
                  </span>
                </div>
              ))}
            </div>

            <div className="alert-stats">
              <span>{t("weeklyDeals.alert.total")}</span>
              <span className="alert-number">{displayValue(summary?.totalActiveDeals)}</span>
            </div>
          </div>

          <button className="btn" onClick={() => router.push('/deals')}>{t("weeklyDeals.alert.view")}</button>
        </div>

        <div className="section-card">
          <div className="section-title">{t("weeklyDeals.highlights.title")}</div>
          <div className="highlights">
            <div>
              <span>{t("weeklyDeals.highlights.market")}</span>
              <span className="alert-performance">{displayValue(summary?.hottestArea)}</span>
            </div>
            <div>
              <span>{t("weeklyDeals.highlights.discount")}</span>
              <span className="alert-performance">{displayValue(summary?.bestDiscountDisplay)}</span>
            </div>
            <div>
              <span>{t("weeklyDeals.highlights.performing")}</span>
              <span className="alert-performance">{displayValue(summary?.bestPerformingArea)}</span>
            </div>
          </div>
        </div>

        <div className="section-card">
          <div className="section-title">{t("weeklyDeals.about.title")}</div>
          <p className="info-text">
            {t("weeklyDeals.about.p1")}
          </p>
          <p className="info-text">
            {t("weeklyDeals.about.p2")}
          </p>
        </div>

        <div className="section-card report-disclaimer">
          <div className="section-title">{t("weeklyDeals.disclaimer.title")}</div>
          <p>
            {t("weeklyDeals.disclaimer.body")}
          </p>
          <h4>{t("weeklyDeals.disclaimer.verificationTitle")}</h4>
          <p>
            {t("weeklyDeals.disclaimer.verificationBody")}
          </p>
          <h4>{t("weeklyDeals.disclaimer.appraisalTitle")}</h4>
          <p>
            {t("weeklyDeals.disclaimer.appraisalBody")}
          </p>
          <h4>{t("weeklyDeals.disclaimer.sourcesTitle")}</h4>
          <p>{t("weeklyDeals.disclaimer.sourcesBody")}</p>
        </div>
      </div>
    </section>
  );
}
