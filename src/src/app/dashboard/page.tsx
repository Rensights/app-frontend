"use client";

import { useState, useEffect, useMemo, useCallback, memo } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api";
import "./dashboard.css";

const MENU_ITEMS = [
  { id: "analysis", label: "City Analysis", icon: "📊" },
  { id: "reports", label: "Property Reports", icon: "📋" },
  { id: "alerts", label: "Weekly Deals", icon: "🚨" },
  { id: "account", label: "Account", icon: "⚙️" },
];

export default function DashboardPage() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<string>("analysis");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Optimized: Memoize load function and use Promise.all for parallel requests
  useEffect(() => {
    const loadUser = async () => {
      try {
        const [userData, subscriptionData] = await Promise.all([
          apiClient.getCurrentUser(),
          apiClient.getCurrentSubscription().catch(() => null),
        ]);
        setUser(userData);
        setSubscription(subscriptionData);
      } catch (error) {
        // If not authenticated, redirect to login
        router.push("/");
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, [router]);
  
  // Optimized: Memoize handlers
  const handleSectionChange = useCallback((sectionId: string) => {
    if (sectionId === "account") {
      router.push("/account");
      return;
    }
    setActiveSection(sectionId);
    setIsSidebarOpen(false);
  }, [router]);
  
  const handleLogout = useCallback(() => {
    apiClient.logout();
  }, []);
  
  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);
  
  const closeSidebar = useCallback(() => {
    setIsSidebarOpen(false);
  }, []);
  
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


  if (loading) {
    return (
      <div className="dashboard-page">
        <div style={{ padding: "2rem", textAlign: "center" }}>Loading...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <aside className={`sidebar ${isSidebarOpen ? "open" : ""}`}>
        <div className="logo-section">
          <div className="logo">Rensights</div>
          <div className="logo-subtitle">Dubai Property Intelligence</div>
          <button
            className="sidebar-close"
            type="button"
            aria-label="Close navigation"
            onClick={closeSidebar}
          >
            ×
          </button>
        </div>

        <nav className="menu">
          {MENU_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-current={activeSection === item.id ? "page" : undefined}
              className={`menu-item ${
                activeSection === item.id ? "active" : ""
              }`}
              onClick={() => handleSectionChange(item.id)}
            >
              <span className="menu-icon" aria-hidden>
                {item.icon}
              </span>
              <span className="menu-text">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="logout-section">
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </aside>

      <div
        className={`sidebar-overlay ${isSidebarOpen ? "open" : ""}`}
        onClick={closeSidebar}
      />

      <main className="main-content">
        <button
          className="menu-toggle"
          type="button"
          aria-label="Toggle navigation"
          onClick={toggleSidebar}
        >
          <span />
          <span />
          <span />
        </button>

        <section
          className={`content-section ${
            activeSection === "analysis" ? "active" : ""
          }`}
        >
          <div className="city-analysis-container">
            <div className="city-analysis-header">
              <h2>🏙️ Dubai City Analysis</h2>
              <p>Data-Driven Investment Intelligence for Smart Investors</p>
            </div>

            <div className="city-analysis-summary">
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

            <div className="city-analysis-cta">
              <button 
                className="city-cta-button"
                onClick={() => router.push('/city-analysis')}
              >
                See Full City Analysis
              </button>
            </div>
          </div>
        </section>

        <section
          className={`content-section ${
            activeSection === "reports" ? "active" : ""
          }`}
        >
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

        <section
          className={`content-section ${
            activeSection === "alerts" ? "active" : ""
          }`}
        >
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

            <button className="btn">View This Week&apos;s Alerts</button>
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
      </main>
    </div>
  );
}

