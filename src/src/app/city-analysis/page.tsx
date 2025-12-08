"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { apiClient } from "@/lib/api";
import "../dashboard/dashboard.css";

const MENU_ITEMS = [
  { id: "analysis", label: "City Analysis", icon: "📊", path: "/city-analysis" },
  { id: "reports", label: "Property Reports", icon: "📋", path: "/dashboard" },
  { id: "alerts", label: "Weekly Deals", icon: "🚨", path: "/weekly-deals" },
  { id: "account", label: "Account", icon: "⚙️", path: "/account" },
];

export default function CityAnalysisPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await apiClient.getCurrentUser();
        setUser(userData);
      } catch (error) {
        router.push("/");
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, [pathname, router]);

  const handleLogout = useCallback(() => {
    apiClient.logout();
  }, []);

  const handleSectionChange = useCallback((item: typeof MENU_ITEMS[0]) => {
    if (item.id === "account") {
      router.push("/account");
      return;
    }
    router.push(item.path);
    setIsSidebarOpen(false);
  }, [router]);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  const closeSidebar = useCallback(() => {
    setIsSidebarOpen(false);
  }, []);

  if (loading) {
    return (
      <div className="dashboard-page">
        <div style={{ padding: "2rem", textAlign: "center" }}>Loading...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-page city-analysis-page">
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
          {/* City Analysis Section */}
          <div className="section-card">
            <div className="section-title">City Analysis</div>
            
            <div className="analysis-metric">
              <div className="metric-label">Average Price per Sq Ft</div>
              <div className="metric-value">AED 1,450</div>
              <div className="metric-trend">↑ +8.2% from last quarter</div>
            </div>

            <div className="analysis-metric">
              <div className="metric-label">Most Active Area</div>
              <div className="metric-value">Dubai Marina</div>
              <div className="metric-trend">247 transactions this month</div>
            </div>

            <div className="analysis-metric">
              <div className="metric-label">Average Rental Yield</div>
              <div className="metric-value">5.8%</div>
              <div className="metric-trend">Above regional average</div>
            </div>

            <button 
              className="btn"
              onClick={() => router.push('/city-analysis/detailed')}
            >
              View Full City Analysis
            </button>
          </div>

          {/* Top Performing Areas Section */}
          <div className="section-card">
            <div className="section-title">Top Performing Areas</div>
            <div style={{ fontSize: '0.95rem', color: '#666', lineHeight: '1.6' }}>
              <div style={{ marginBottom: '12px', padding: '12px', background: '#f8f9fa', borderRadius: '8px' }}>
                <strong>🏆 Downtown Dubai</strong><br />
                <span style={{ fontSize: '0.85rem' }}>9.1% growth • High appreciation potential</span>
              </div>
              <div style={{ marginBottom: '12px', padding: '12px', background: '#f8f9fa', borderRadius: '8px' }}>
                <strong>⚓ Dubai Marina</strong><br />
                <span style={{ fontSize: '0.85rem' }}>High liquidity • Most transactions</span>
              </div>
              <div style={{ marginBottom: '12px', padding: '12px', background: '#f8f9fa', borderRadius: '8px' }}>
                <strong>🏢 Business Bay</strong><br />
                <span style={{ fontSize: '0.85rem' }}>Best rental yields • 6.5% average</span>
              </div>
              <div style={{ padding: '12px', background: '#f8f9fa', borderRadius: '8px' }}>
                <strong>🌴 Palm Jumeirah</strong><br />
                <span style={{ fontSize: '0.85rem' }}>Premium segment leader • Luxury market</span>
              </div>
            </div>
          </div>

          {/* Dubai Market Insights Section */}
          <div className="section-card">
            <div className="section-title">Dubai Market Insights</div>
            <div style={{ fontSize: '0.95rem', color: '#666', lineHeight: '1.6' }}>
              <div style={{ marginBottom: '10px' }}>🚀 Dubai real estate up 12% YoY</div>
              <div style={{ marginBottom: '10px' }}>🗝️ New projects: Business Bay & Bluewaters</div>
              <div style={{ marginBottom: '10px' }}>💎 Luxury market: Strong investor demand</div>
              <div>🏙️ Dubai avg: AED 1,450/sq ft</div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

