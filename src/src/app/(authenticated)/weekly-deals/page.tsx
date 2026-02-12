"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { apiClient } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useWeeklyDealsEnabled } from "@/hooks/useWeeklyDealsEnabled";
import "../dashboard/dashboard.css";
import "../deals/deals.css";
import { useTranslations } from "@/hooks/useTranslations";

export default function WeeklyDealsPage() {
  const router = useRouter();
  const toast = useToast();
  const { user } = useUser();
  const isFreeUser = !user || user.userTier === 'FREE';
  const [isUpgrading, setIsUpgrading] = useState(false);
  const { enabled: weeklyDealsEnabled, loading: weeklyDealsLoading } = useWeeklyDealsEnabled();
  const { t } = useTranslations("weeklyDeals", {
    "weeklyDeals.upgrade.title": "Upgrade to Standard Package",
    "weeklyDeals.upgrade.price": "$20",
    "weeklyDeals.upgrade.perMonth": "/month",
    "weeklyDeals.upgrade.subtitle": "Access exclusive deals and premium features with Standard Package.",
    "weeklyDeals.upgrade.feature1": "5 tailored pricing analysis of properties selected by you",
    "weeklyDeals.upgrade.feature2": "Advanced city analysis",
    "weeklyDeals.upgrade.feature3": "Potentially underpriced deals",
    "weeklyDeals.upgrade.feature4": "Full access to property analytics",
    "weeklyDeals.upgrade.button": "Upgrade to Standard Package",
    "weeklyDeals.section.title": "Weekly Property Deals",
    "weeklyDeals.alert.title": "Latest Alert",
    "weeklyDeals.alert.subtitle": "Hot deals discovered across Dubai areas this week!",
    "weeklyDeals.alert.area1": "🏙️ Downtown Dubai:",
    "weeklyDeals.alert.area2": "⚓ Dubai Marina:",
    "weeklyDeals.alert.area3": "🏢 Business Bay:",
    "weeklyDeals.alert.area4": "🌴 Jumeirah Beach:",
    "weeklyDeals.alert.deals": "deals",
    "weeklyDeals.alert.total": "Total active alerts:",
    "weeklyDeals.alert.view": "View This Week's Alerts",
    "weeklyDeals.highlights.title": "This Week's Highlights",
    "weeklyDeals.highlights.market": "🔥 Hottest market:",
    "weeklyDeals.highlights.marketValue": "Dubai Marina (4 deals)",
    "weeklyDeals.highlights.discount": "💎 Best discount found:",
    "weeklyDeals.highlights.discountValue": "22% below market",
    "weeklyDeals.highlights.performing": "🏆 Best performing area:",
    "weeklyDeals.highlights.performingValue": "Downtown Dubai",
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

  const handleUpgrade = async () => {
    try {
      setIsUpgrading(true);
      const { url } = await apiClient.createCheckoutSession('PREMIUM');
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

  if (weeklyDealsLoading) {
    return (
      <div className="dashboard-page">
        <LoadingSpinner fullPage={true} message="Loading..." />
      </div>
    );
  }

  if (weeklyDealsEnabled === false) {
    return (
      <div className="dashboard-page">
        <LoadingSpinner fullPage={true} message="Redirecting..." />
      </div>
    );
  }

  return (
    <section className="content-section active" style={{ position: 'relative' }}>
      {isFreeUser && (
        <div className="upgrade-overlay">
          <div className="upgrade-content">
            <div className="upgrade-icon">🔒</div>
            <h2>{t("weeklyDeals.upgrade.title")}</h2>
            <div className="upgrade-pricing">
              <div className="pricing-amount">{t("weeklyDeals.upgrade.price")}<span className="pricing-period">{t("weeklyDeals.upgrade.perMonth")}</span></div>
            </div>
            <p>{t("weeklyDeals.upgrade.subtitle")}</p>
            <ul className="upgrade-features">
              <li>✓ {t("weeklyDeals.upgrade.feature1")}</li>
              <li>✓ {t("weeklyDeals.upgrade.feature2")}</li>
              <li>✓ {t("weeklyDeals.upgrade.feature3")}</li>
              <li>✓ {t("weeklyDeals.upgrade.feature4")}</li>
            </ul>
            <button 
              className="upgrade-button" 
              onClick={handleUpgrade}
              disabled={isUpgrading}
            >
              {isUpgrading ? "Processing..." : t("weeklyDeals.upgrade.button")}
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
              {[
                { label: t("weeklyDeals.alert.area1"), count: 3 },
                { label: t("weeklyDeals.alert.area2"), count: 4 },
                { label: t("weeklyDeals.alert.area3"), count: 3 },
                { label: t("weeklyDeals.alert.area4"), count: 3 },
              ].map((alert) => (
                <div key={alert.label} className="alert-row">
                  <span>{alert.label}</span>
                  <span className="alert-number">{alert.count} {t("weeklyDeals.alert.deals")}</span>
                </div>
              ))}
            </div>

            <div className="alert-stats">
              <span>{t("weeklyDeals.alert.total")}</span>
              <span className="alert-number">13</span>
            </div>
          </div>

          <button className="btn" onClick={() => router.push('/deals')}>{t("weeklyDeals.alert.view")}</button>
        </div>

        <div className="section-card">
          <div className="section-title">{t("weeklyDeals.highlights.title")}</div>
          <div className="highlights">
            <div>
              <span>{t("weeklyDeals.highlights.market")}</span>
              <span className="alert-performance">
                {t("weeklyDeals.highlights.marketValue")}
              </span>
            </div>
            <div>
              <span>{t("weeklyDeals.highlights.discount")}</span>
              <span className="alert-performance">{t("weeklyDeals.highlights.discountValue")}</span>
            </div>
            <div>
              <span>{t("weeklyDeals.highlights.performing")}</span>
              <span className="alert-performance">{t("weeklyDeals.highlights.performingValue")}</span>
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



