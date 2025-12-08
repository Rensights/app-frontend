"use client";

import { useState, useEffect, useMemo, useCallback, memo } from "react";
import { useRouter, usePathname } from "next/navigation";
import { apiClient } from "@/lib/api";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import "./dashboard.css";

const MENU_ITEMS = [
  { id: "analysis", label: "City Analysis", icon: "📊", path: "/city-analysis" },
  { id: "reports", label: "Property Reports", icon: "📋", path: "/dashboard" },
  { id: "alerts", label: "Weekly Deals", icon: "🚨", path: "/weekly-deals" },
  { id: "account", label: "Account", icon: "⚙️", path: "/account" },
];

export default function DashboardPage() {
  const router = useRouter();
  const pathname = usePathname();
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
  }, [pathname, router]);
  
  // Optimized: Memoize handlers
  const handleSectionChange = useCallback((item: typeof MENU_ITEMS[0]) => {
    if (item.id === "account") {
      router.push("/account");
      return;
    }
    router.push(item.path);
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
        <LoadingSpinner fullPage={true} message="Loading Dashboard..." />
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
              aria-current={pathname === item.path ? "page" : undefined}
              className={`menu-item ${
                pathname === item.path ? "active" : ""
              }`}
              onClick={() => handleSectionChange(item)}
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

      </main>
    </div>
  );
}

