"use client";

import { useRouter } from "next/navigation";
import "../dashboard/dashboard.css";
import "./city-analysis.css";

export default function CityAnalysisPage() {
  const router = useRouter();

  return (
    <section className="content-section active">
      <div className="city-analysis-container">
        {/* Header Section */}
        <div className="city-analysis-header">
          <h2>🏙️ Dubai City Analysis</h2>
          <p>Data-Driven Investment Intelligence for Smart Investors</p>
        </div>

        {/* Summary Section */}
        <div className="city-analysis-summary">
          {/* Left Column - City Market Summary */}
          <div className="city-analysis-left">
            <h3>City Market Summary</h3>
            <ul className="city-metrics-list">
              <li>Median property price in Dubai is 1,850,000 AED (504,000 USD)</li>
              <li>Year-over-year price appreciation stands at 12.4%</li>
              <li>Gross rental yield averages 6.8% across all property types</li>
              <li>Net rental yield after maintenance costs is 5.2%</li>
              <li>Sales-to-listing ratio is 0.78 indicating balanced market conditions</li>
              <li>Market volatility index is at moderate level (6.2/10)</li>
              <li>Average age of properties is 8.5 years</li>
              <li>Off-plan properties offer 7.2% yield vs 6.4% for ready homes</li>
              <li>Investment recovery period averages 15.6 years</li>
            </ul>
          </div>

          {/* Right Column - Detailed Analysis Modules */}
          <div className="city-analysis-right">
            <h3>Detailed Analysis Modules</h3>
            <div className="city-analysis-cards">
              <div className="city-analysis-card">
                <h4>📍 Analysis by Dubai Areas</h4>
                <p>6 comprehensive area reports with comparative charts covering Downtown, Marina, JBR, Business Bay, JVC, and Arabian Ranches</p>
              </div>

              <div className="city-analysis-card">
                <h4>🏗️ Property Type Comparison</h4>
                <p>6 detailed charts comparing off-plan vs ready properties including ROI, appreciation, and risk analysis</p>
              </div>

              <div className="city-analysis-card">
                <h4>🏠 Analysis of Properties by Size</h4>
                <p>5 charts analyzing studio, 1-bedroom, 2-bedroom, 3-bedroom, and 4+ bedroom properties with yield and demand metrics</p>
              </div>

              <div className="city-analysis-card">
                <h4>💰 Profitability Assessment</h4>
                <p>ROI calculator and profit projection models for different investment horizons</p>
              </div>

              <div className="city-analysis-card">
                <h4>🎯 Which Property to Buy</h4>
                <p>Detailed analysis and comparison of properties by occupancy rates, proximity to metro, amenities, and other key variables to identify optimal investment opportunities</p>
              </div>

              <div className="city-analysis-card">
                <h4>🤝 Price Negotiation Intelligence</h4>
                <p>Real market value analysis to help negotiate optimal purchase prices</p>
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
            See Full City Analysis
          </button>
        </div>
      </div>
    </section>
  );
}






