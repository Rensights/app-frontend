"use client";

import { useRouter } from "next/navigation";
import "../dashboard/dashboard.css";
import "./city-analysis.css";
import { useTranslations } from "@/hooks/useTranslations";

export default function CityAnalysisPage() {
  const router = useRouter();
  const { t } = useTranslations("cityAnalysis", {
    "cityAnalysis.title": "🏙️ Dubai City Analysis",
    "cityAnalysis.subtitle": "Data-Driven Investment Intelligence for Smart Investors",
    "cityAnalysis.summaryTitle": "City Market Summary",
    "cityAnalysis.summary1": "Median property price in Dubai is 1,850,000 AED (504,000 USD)",
    "cityAnalysis.summary2": "Year-over-year price appreciation stands at 12.4%",
    "cityAnalysis.summary3": "Gross rental yield averages 6.8% across all property types",
    "cityAnalysis.summary4": "Net rental yield after maintenance costs is 5.2%",
    "cityAnalysis.summary5": "Sales-to-listing ratio is 0.78 indicating balanced market conditions",
    "cityAnalysis.summary6": "Market volatility index is at moderate level (6.2/10)",
    "cityAnalysis.summary7": "Average age of properties is 8.5 years",
    "cityAnalysis.summary8": "Off-plan properties offer 7.2% yield vs 6.4% for ready homes",
    "cityAnalysis.summary9": "Investment recovery period averages 15.6 years",
    "cityAnalysis.modulesTitle": "Detailed Analysis Modules",
    "cityAnalysis.module1.title": "📍 Analysis by Dubai Areas",
    "cityAnalysis.module1.body": "6 comprehensive area reports with comparative charts covering Downtown, Marina, JBR, Business Bay, JVC, and Arabian Ranches",
    "cityAnalysis.module2.title": "🏗️ Property Type Comparison",
    "cityAnalysis.module2.body": "6 detailed charts comparing off-plan vs ready properties including ROI, appreciation, and risk analysis",
    "cityAnalysis.module3.title": "🏠 Analysis of Properties by Size",
    "cityAnalysis.module3.body": "5 charts analyzing studio, 1-bedroom, 2-bedroom, 3-bedroom, and 4+ bedroom properties with yield and demand metrics",
    "cityAnalysis.module4.title": "💰 Profitability Assessment",
    "cityAnalysis.module4.body": "ROI calculator and profit projection models for different investment horizons",
    "cityAnalysis.module5.title": "🎯 Which Property to Buy",
    "cityAnalysis.module5.body": "Detailed analysis and comparison of properties by occupancy rates, proximity to metro, amenities, and other key variables to identify optimal investment opportunities",
    "cityAnalysis.module6.title": "🤝 Price Negotiation Intelligence",
    "cityAnalysis.module6.body": "Real market value analysis to help negotiate optimal purchase prices",
    "cityAnalysis.cta": "See Full City Analysis",
  });

  return (
    <section className="content-section active">
      <div className="city-analysis-container">
        {/* Header Section */}
        <div className="city-analysis-header">
          <h2>{t("cityAnalysis.title")}</h2>
          <p>{t("cityAnalysis.subtitle")}</p>
        </div>

        {/* Summary Section */}
        <div className="city-analysis-summary">
          {/* Left Column - City Market Summary */}
          <div className="city-analysis-left">
            <h3>{t("cityAnalysis.summaryTitle")}</h3>
            <ul className="city-metrics-list">
              <li>{t("cityAnalysis.summary1")}</li>
              <li>{t("cityAnalysis.summary2")}</li>
              <li>{t("cityAnalysis.summary3")}</li>
              <li>{t("cityAnalysis.summary4")}</li>
              <li>{t("cityAnalysis.summary5")}</li>
              <li>{t("cityAnalysis.summary6")}</li>
              <li>{t("cityAnalysis.summary7")}</li>
              <li>{t("cityAnalysis.summary8")}</li>
              <li>{t("cityAnalysis.summary9")}</li>
            </ul>
          </div>

          {/* Right Column - Detailed Analysis Modules */}
          <div className="city-analysis-right">
            <h3>{t("cityAnalysis.modulesTitle")}</h3>
            <div className="city-analysis-cards">
              <div className="city-analysis-card">
                <h4>{t("cityAnalysis.module1.title")}</h4>
                <p>{t("cityAnalysis.module1.body")}</p>
              </div>

              <div className="city-analysis-card">
                <h4>{t("cityAnalysis.module2.title")}</h4>
                <p>{t("cityAnalysis.module2.body")}</p>
              </div>

              <div className="city-analysis-card">
                <h4>{t("cityAnalysis.module3.title")}</h4>
                <p>{t("cityAnalysis.module3.body")}</p>
              </div>

              <div className="city-analysis-card">
                <h4>{t("cityAnalysis.module4.title")}</h4>
                <p>{t("cityAnalysis.module4.body")}</p>
              </div>

              <div className="city-analysis-card">
                <h4>{t("cityAnalysis.module5.title")}</h4>
                <p>{t("cityAnalysis.module5.body")}</p>
              </div>

              <div className="city-analysis-card">
                <h4>{t("cityAnalysis.module6.title")}</h4>
                <p>{t("cityAnalysis.module6.body")}</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="city-analysis-cta">
          <button 
            className="city-cta-button"
            onClick={() => router.push('/city-analysis/detailed')}
          >
            {t("cityAnalysis.cta")}
          </button>
        </div>
      </div>
    </section>
  );
}





