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

export default function WeeklyDealsPage() {
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
      </main>
    </div>
  );
}

