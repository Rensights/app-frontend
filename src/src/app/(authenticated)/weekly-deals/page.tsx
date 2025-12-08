"use client";

import { useRouter } from "next/navigation";
import "../dashboard/dashboard.css";

export default function WeeklyDealsPage() {
  const router = useRouter();

  return (
    <section className="content-section active">
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
    </section>
  );
}

