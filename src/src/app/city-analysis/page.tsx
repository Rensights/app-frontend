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
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' }}>
              {/* Average Price per Sq Ft */}
              <div>
                <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '8px' }}>Average Price per Sq Ft</div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#333', marginBottom: '8px' }}>AED 1,450</div>
                <div style={{ fontSize: '0.85rem', color: '#22c55e', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>↑</span>
                  <span>+8.2% from last quarter</span>
                </div>
              </div>

              {/* Most Active Area */}
              <div>
                <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '8px' }}>Most Active Area</div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#333', marginBottom: '8px' }}>Dubai Marina</div>
                <div style={{ fontSize: '0.85rem', color: '#666' }}>247 transactions this month</div>
              </div>

              {/* Average Rental Yield */}
              <div>
                <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '8px' }}>Average Rental Yield</div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#333', marginBottom: '8px' }}>5.8%</div>
                <div style={{ fontSize: '0.85rem', color: '#666' }}>Above regional average</div>
              </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <button 
                className="btn"
                onClick={() => router.push('/city-analysis/detailed')}
              >
                View Full City Analysis
              </button>
            </div>
          </div>

          {/* Top Performing Areas Section */}
          <div className="section-card">
            <div className="section-title">Top Performing Areas</div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Downtown Dubai */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px', borderRadius: '8px', background: '#f8f9fa' }}>
                <div style={{ fontSize: '2rem' }}>🏆</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', fontSize: '1.1rem', marginBottom: '4px' }}>Downtown Dubai</div>
                  <div style={{ fontSize: '0.9rem', color: '#666' }}>9.1% growth • High appreciation potential</div>
                </div>
              </div>

              {/* Dubai Marina */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px', borderRadius: '8px', background: '#f8f9fa' }}>
                <div style={{ fontSize: '2rem' }}>⚓</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', fontSize: '1.1rem', marginBottom: '4px' }}>Dubai Marina</div>
                  <div style={{ fontSize: '0.9rem', color: '#666' }}>High liquidity • Most transactions</div>
                </div>
              </div>

              {/* Business Bay */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px', borderRadius: '8px', background: '#f8f9fa' }}>
                <div style={{ fontSize: '2rem' }}>🏢</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', fontSize: '1.1rem', marginBottom: '4px' }}>Business Bay</div>
                  <div style={{ fontSize: '0.9rem', color: '#666' }}>Best rental yields • 6.5% average</div>
                </div>
              </div>

              {/* Palm Jumeirah */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px', borderRadius: '8px', background: '#f8f9fa' }}>
                <div style={{ fontSize: '2rem' }}>🌴</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', fontSize: '1.1rem', marginBottom: '4px' }}>Palm Jumeirah</div>
                  <div style={{ fontSize: '0.9rem', color: '#666' }}>Premium segment leader • Luxury market</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

