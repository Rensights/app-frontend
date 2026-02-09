"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { apiClient } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import "../dashboard/dashboard.css";
import "../deals/deals.css";

export default function WeeklyDealsPage() {
  const router = useRouter();
  const toast = useToast();
  const { user } = useUser();
  const isFreeUser = !user || user.userTier === 'FREE';
  const [isUpgrading, setIsUpgrading] = useState(false);

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

  return (
    <section className="content-section active" style={{ position: 'relative' }}>
      {isFreeUser && (
        <div className="upgrade-overlay">
          <div className="upgrade-content">
            <div className="upgrade-icon">🔒</div>
            <h2>Upgrade to Standard Package</h2>
            <div className="upgrade-pricing">
              <div className="pricing-amount">$20<span className="pricing-period">/month</span></div>
            </div>
            <p>Access exclusive deals and premium features with Standard Package.</p>
            <ul className="upgrade-features">
              <li>✓ 5 tailored pricing analysis of properties selected by you</li>
              <li>✓ Advanced city analysis</li>
              <li>✓ Potentially underpriced deals</li>
              <li>✓ Full access to property analytics</li>
            </ul>
            <button 
              className="upgrade-button" 
              onClick={handleUpgrade}
              disabled={isUpgrading}
            >
              {isUpgrading ? "Processing..." : "Upgrade to Standard Package"}
            </button>
          </div>
        </div>
      )}
      <div style={{ opacity: isFreeUser ? 0.4 : 1, pointerEvents: isFreeUser ? 'none' : 'auto' }}>
        <div className="section-card">
          <div className="section-title">Weekly Property Deals</div>

          <div className="alert-item">
            <div className="alert-title">Latest Alert</div>
            <div className="alert-desc">
              Hot deals discovered across Dubai areas this week!
            </div>

            <div className="alert-list">
              {[
                { label: "🏙️ Downtown Dubai:", count: 3 },
                { label: "⚓ Dubai Marina:", count: 4 },
                { label: "🏢 Business Bay:", count: 3 },
                { label: "🌴 Jumeirah Beach:", count: 3 },
              ].map((alert) => (
                <div key={alert.label} className="alert-row">
                  <span>{alert.label}</span>
                  <span className="alert-number">{alert.count} deals</span>
                </div>
              ))}
            </div>

            <div className="alert-stats">
              <span>Total active alerts:</span>
              <span className="alert-number">13</span>
            </div>
          </div>

          <button className="btn" onClick={() => router.push('/deals')}>View This Week&apos;s Alerts</button>
        </div>

        <div className="section-card">
          <div className="section-title">This Week&apos;s Highlights</div>
          <div className="highlights">
            <div>
              <span>🔥 Hottest market:</span>
              <span className="alert-performance">
                Dubai Marina (4 deals)
              </span>
            </div>
            <div>
              <span>💎 Best discount found:</span>
              <span className="alert-performance">22% below market</span>
            </div>
            <div>
              <span>🏆 Best performing area:</span>
              <span className="alert-performance">Downtown Dubai</span>
            </div>
          </div>
        </div>

        <div className="section-card">
          <div className="section-title">About Deal Alerts</div>
          <p className="info-text">
            Our AI-powered system analyzes thousands of properties daily to
            identify underpriced opportunities across Dubai.
          </p>
          <p className="info-text">
            Each deal is verified by expert analysts to ensure accuracy and
            potential value. Get notified weekly about properties priced
            significantly below market value in prime locations.
          </p>
        </div>

        <div className="section-card report-disclaimer">
          <div className="section-title">Disclaimer</div>
          <p>
            This report is generated for informational and educational purposes only. Rensights.com is a data analytics
            provider, not a licensed real estate brokerage, financial advisor, or legal consultant. The &quot;Estimated
            Price&quot; and &quot;Scores&quot; provided are based on automated algorithms and third-party data; they do not
            constitute a formal appraisal or a guarantee of profit. All investments carry risk. We strongly recommend
            consulting with a licensed professional before making any financial commitments.
          </p>
          <h4>Verification Note</h4>
          <p>
            We scan external websites for pricing anomalies. We do not verify the physical condition, legal title, or
            the authenticity of the listing. Users must perform their own due diligence (physical viewing and title deed
            verification) before transferring funds to any third party.
          </p>
          <h4>No Formal Appraisal</h4>
          <p>
            The property estimates and scores provided by this platform are generated via automated machine learning
            algorithms and do not constitute a formal, legal, or professional real estate appraisal. This platform does
            not account for the physical condition, interior upgrades, or latent defects of a property.
          </p>
          <h4>Data Sources</h4>
          <p>Dubai Land Department (DLD), Bayut, and various public records.</p>
        </div>
      </div>
    </section>
  );
}





