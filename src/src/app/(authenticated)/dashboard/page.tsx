"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import "./dashboard.css";

export default function DashboardPage() {
  const router = useRouter();
  const { subscription } = useUser();

  // Optimized: Memoize subscription badge style
  const subscriptionBadgeStyle = useMemo(() => {
    if (!subscription) return null;
    return {
      marginTop: '10px',
      display: 'inline-block',
      padding: '6px 12px',
      borderRadius: '8px',
      fontSize: '0.85rem',
      fontWeight: '500',
      background: subscription.planType === 'FREE' 
        ? 'rgba(108, 117, 125, 0.1)' 
        : subscription.planType === 'PREMIUM'
        ? 'rgba(243, 156, 18, 0.1)'
        : 'rgba(155, 89, 182, 0.1)',
      color: subscription.planType === 'FREE'
        ? '#6c757d'
        : subscription.planType === 'PREMIUM'
        ? '#f39c12'
        : '#9b59b6',
    };
  }, [subscription]);

  return (
    <section className="content-section active">
      <div className="section-card">
        <div className="section-title">Property Reports</div>

        <div className="report-item">
          <div className="report-header">
            <div className="report-title">Recent Report</div>
            <div className="report-status">Ready</div>
          </div>
          <div className="report-desc">
            2-bed apartment in Dubai Marina - Analysis complete
          </div>
          <div className="report-stats">
            <div>📍 Location Score: 9.2/10</div>
            <div>💰 Fair Value: AED 2,850,000</div>
            <div>📊 Rental Yield Potential: 6.5%</div>
          </div>
        </div>

        <button className="btn">View Report</button>

        <div className="report-actions">
          <button 
            className="btn btn-outline"
            onClick={() => router.push("/analysis-request")}
          >
            Request New Report
          </button>
          <div className="report-note">
            3 reports remaining this month
          </div>
        </div>
      </div>

      <div className="section-card">
        <div className="section-title">What's Included</div>
        <p className="info-text">
          Our detailed property reports provide comprehensive analysis
          including:
        </p>
        <div className="report-includes">
          <div>✓ Location score and neighborhood analysis</div>
          <div>✓ Fair market value estimation in AED</div>
          <div>✓ Rental yield potential calculation</div>
          <div>✓ Comparable properties analysis</div>
          <div>✓ Price trend history</div>
          <div>✓ Investment recommendations</div>
        </div>
      </div>

      <div className="section-card">
        <div className="section-title">Dubai Market Insights</div>
        <div className="market-insights">
          <div>🚀 Dubai real estate up 12% YoY</div>
          <div>🗝️ New projects: Business Bay & Bluewaters</div>
          <div>💎 Luxury market: Strong investor demand</div>
          <div>🏙️ Dubai avg: AED 1,450/sq ft</div>
        </div>
      </div>
    </section>
  );
}
