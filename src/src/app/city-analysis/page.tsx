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
          <div className="section-card">
            <div className="section-title">🏙️ Dubai City Analysis</div>
            <p className="info-text" style={{ marginBottom: '20px' }}>
              Data-Driven Investment Intelligence for Smart Investors
            </p>

            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ marginBottom: '15px', color: '#333' }}>City Market Summary</h3>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>Median property price in Dubai is 1,850,000 AED (504,000 USD)</li>
                <li style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>Year-over-year price appreciation stands at 12.4%</li>
                <li style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>Gross rental yield averages 6.8% across all property types</li>
                <li style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>Net rental yield after maintenance costs is 5.2%</li>
                <li style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>Sales-to-listing ratio is 0.78 indicating balanced market conditions</li>
                <li style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>Market volatility index is at moderate level (6.2/10)</li>
                <li style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>Average age of properties is 8.5 years</li>
                <li style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>Off-plan properties offer 7.2% yield vs 6.4% for ready homes</li>
                <li style={{ padding: '8px 0' }}>Investment recovery period averages 15.6 years</li>
              </ul>
          </div>

            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ marginBottom: '15px', color: '#333' }}>Detailed Analysis Modules</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
                <div style={{ padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
                  <h4 style={{ marginBottom: '8px', color: '#555' }}>📍 Analysis by Dubai Areas</h4>
                  <p style={{ fontSize: '0.9rem', color: '#666', margin: 0 }}>6 comprehensive area reports with comparative charts</p>
                </div>
                <div style={{ padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
                  <h4 style={{ marginBottom: '8px', color: '#555' }}>🏗️ Property Type Comparison</h4>
                  <p style={{ fontSize: '0.9rem', color: '#666', margin: 0 }}>6 detailed charts comparing off-plan vs ready properties</p>
                </div>
                <div style={{ padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
                  <h4 style={{ marginBottom: '8px', color: '#555' }}>🏠 Analysis of Properties by Size</h4>
                  <p style={{ fontSize: '0.9rem', color: '#666', margin: 0 }}>5 charts analyzing properties by bedroom count</p>
                </div>
                <div style={{ padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
                  <h4 style={{ marginBottom: '8px', color: '#555' }}>💰 Profitability Assessment</h4>
                  <p style={{ fontSize: '0.9rem', color: '#666', margin: 0 }}>ROI calculator and profit projection models</p>
                </div>
                <div style={{ padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
                  <h4 style={{ marginBottom: '8px', color: '#555' }}>🎯 Which Property to Buy</h4>
                  <p style={{ fontSize: '0.9rem', color: '#666', margin: 0 }}>Detailed analysis and comparison of properties</p>
                </div>
                <div style={{ padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
                  <h4 style={{ marginBottom: '8px', color: '#555' }}>🤝 Price Negotiation Intelligence</h4>
                  <p style={{ fontSize: '0.9rem', color: '#666', margin: 0 }}>Real market value analysis for negotiation</p>
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '30px' }}>
              <button 
                className="btn"
                onClick={() => router.push('/city-analysis/detailed')}
              >
                See Full City Analysis
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

