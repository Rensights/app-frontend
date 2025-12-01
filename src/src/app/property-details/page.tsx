"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiClient } from "@/lib/api";
import "../dashboard/dashboard.css";
import "./property-details.css";

const MENU_ITEMS = [
  { id: "analysis", label: "City Analysis", icon: "📊", path: "/city-analysis" },
  { id: "reports", label: "Property Reports", icon: "📋", path: "/dashboard" },
  { id: "alerts", label: "Weekly Deals", icon: "🚨", path: "/deals" },
  { id: "account", label: "Account", icon: "⚙️", path: "/account" },
];

type TabId = "listed" | "transactions";

const comparableListed = [
  {
    title: "Marina Gate Tower",
    details: "1BR • 720 sq ft • Marina Views",
    price: "AED 1,650,000",
    psf: "AED 2,292/sq ft",
    status: "Listed 8 days ago",
  },
  {
    title: "Torch Tower Residence",
    details: "1BR • 780 sq ft • City Views",
    price: "AED 1,580,000",
    psf: "AED 2,026/sq ft",
    status: "Listed 12 days ago",
  },
  {
    title: "Marina Walk Apartment",
    details: "1BR • 695 sq ft • Waterfront",
    price: "AED 1,750,000",
    psf: "AED 2,518/sq ft",
    status: "Listed 5 days ago",
  },
  {
    title: "Al Sahab Tower",
    details: "1BR • 755 sq ft • Partial Sea View",
    price: "AED 1,690,000",
    psf: "AED 2,238/sq ft",
    status: "Listed 15 days ago",
  },
  {
    title: "Marina Diamond",
    details: "1BR • 765 sq ft • Full Marina View",
    price: "AED 1,895,000",
    psf: "AED 2,477/sq ft",
    status: "Listed 3 days ago",
  },
  {
    title: "Silverene Tower",
    details: "1BR • 740 sq ft • Marina & Sea View",
    price: "AED 1,785,000",
    psf: "AED 2,412/sq ft",
    status: "Listed 7 days ago",
  },
];

const comparableTransactions = [
  {
    title: "Marina Heights",
    details: "1BR • 730 sq ft • Marina Views",
    price: "AED 1,620,000",
    psf: "AED 2,219/sq ft",
    status: "Sold 2 months ago",
  },
  {
    title: "Al Majara Residence",
    details: "1BR • 760 sq ft • Full Sea View",
    price: "AED 1,850,000",
    psf: "AED 2,434/sq ft",
    status: "Sold 1 month ago",
  },
  {
    title: "Marina Pearl",
    details: "1BR • 715 sq ft • Waterfront Location",
    price: "AED 1,580,000",
    psf: "AED 2,210/sq ft",
    status: "Sold 3 weeks ago",
  },
  {
    title: "Marina Crown",
    details: "1BR • 785 sq ft • Premium Finishes",
    price: "AED 1,920,000",
    psf: "AED 2,446/sq ft",
    status: "Sold 6 weeks ago",
  },
  {
    title: "Ocean Heights",
    details: "1BR • 745 sq ft • Iconic Tower",
    price: "AED 1,680,000",
    psf: "AED 2,255/sq ft",
    status: "Sold 8 weeks ago",
  },
  {
    title: "Marina Arcade",
    details: "1BR • 710 sq ft • Marina Walk",
    price: "AED 1,595,000",
    psf: "AED 2,246/sq ft",
    status: "Sold 10 weeks ago",
  },
  {
    title: "Emirates Crown",
    details: "1BR • 770 sq ft • Premium Location",
    price: "AED 1,750,000",
    psf: "AED 2,273/sq ft",
    status: "Sold 12 weeks ago",
  },
  {
    title: "Marina Quays",
    details: "1BR • 725 sq ft • Water Views",
    price: "AED 1,640,000",
    psf: "AED 2,262/sq ft",
    status: "Sold 14 weeks ago",
  },
];

function PropertyDetailsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabId>("listed");
  const propertyId = searchParams.get("id");

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
  }, [router]);

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

  const handleGoBack = () => router.push("/deals");
  const handleViewProperty = () => alert("Opening property listing page...");
  const handleViewAll = () => alert("Loading all comparable properties...");

  if (loading) {
    return (
      <div className="dashboard-page property-page">
        <aside className="sidebar">
          <div className="logo-section">
            <div className="logo">Rensights</div>
            <div className="logo-subtitle">Dubai Property Intelligence</div>
          </div>
        </aside>
        <main className="main-content">
          <div style={{ padding: "2rem", textAlign: "center" }}>Loading...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-page property-page">
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
              className="menu-item"
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

        <div className="container">
          <header className="header">
            <div className="header-left">
              <button className="back-btn" onClick={handleGoBack}>
                ← Back to Deals
              </button>
              <div className="logo">Rensights</div>
            </div>
            <div className="verified-badge">Verified Listing</div>
          </header>

        <div className="main-content">
          <div className="property-overview">
            <div className="property-header">
              <h1 className="property-title">Marina Pinnacle Tower</h1>
              <p className="property-location">Dubai Marina, Dubai</p>
              <div className="discount-highlight">
                18.2% Below Market Value
              </div>
            </div>

            <section className="key-metrics">
              {[
                { value: "1BR", label: "Bedrooms" },
                { value: "750", label: "sq ft" },
                { value: "Ready", label: "Handover" },
                { value: "7.8%", label: "Rental Yield" },
              ].map((metric) => (
                <div key={metric.label} className="metric-card">
                  <div className="metric-value">{metric.value}</div>
                  <div className="metric-label">{metric.label}</div>
                </div>
              ))}
            </section>

            <section className="price-analysis">
              <h3>Price Analysis</h3>
              <div className="price-grid">
                <div className="price-section">
                  <div className="price-label">Listed Price</div>
                  <div className="price-value">AED 1,450,000</div>
                </div>
                <div className="price-section">
                  <div className="price-label">Our Estimate Range</div>
                  <div className="price-value price-estimate">
                    AED 1,750,000 - 1,820,000
                  </div>
                </div>
                <div className="price-section">
                  <div className="price-label">Potential Savings</div>
                  <div className="price-value">
                    <span className="savings-amount">
                      AED 300,000 - 370,000
                    </span>
                  </div>
                </div>
                <div className="price-section">
                  <div className="price-label">Price per sq ft</div>
                  <div className="price-value">AED 1,933 /sq ft</div>
                  <small>18.2% below market avg</small>
                </div>
              </div>
            </section>

            <section className="property-description">
              <h3>Property Description</h3>
              <div className="description-card">
                <p>
                  This modern 1-bedroom apartment offers luxurious living in the
                  heart of Dubai Marina. The unit features floor-to-ceiling
                  windows with stunning marina views, premium finishes, and an
                  efficient layout that maximizes the 750 sq ft space. The
                  property boasts breathtaking water and city views with
                  abundant natural light throughout the day.
                </p>
                <div className="description-grid">
                  <DescriptionStat
                    label="Price per sq ft:"
                    value="AED 1,933/sq ft"
                  />
                  <DescriptionStat
                    label="Building Features:"
                    value="Concierge, Gym, Pool, Spa"
                  />
                  <DescriptionStat
                    label="Service Charge:"
                    value="AED 18/sq ft annually"
                  />
                  <DescriptionStat label="Developer:" value="Emaar Properties" />
                </div>
                <div className="description-footer">
                  <button
                    className="inline-link"
                    onClick={handleViewProperty}
                  >
                    View the Property
                  </button>
                </div>
              </div>
            </section>

            <section className="comparison-table">
              <h3>Market Comparison</h3>
              {[
                {
                  label: "Average 1BR Price (Dubai Marina)",
                  value: "AED 2,360/sq ft",
                },
                { label: "This Property", value: "AED 1,933/sq ft" },
                { label: "Market Position", value: "18.2% Below Average" },
                { label: "Rental Yield Estimate", value: "7.2% - 8.1%" },
              ].map((row) => (
                <div key={row.label} className="comparison-row">
                  <span className="comparison-label">{row.label}</span>
                  <span className="comparison-value">{row.value}</span>
                </div>
              ))}
            </section>

            <section className="investment-insights">
              <h3>Investment Insights</h3>
              {[
                "Property is priced 18.2% below similar 1BR units in Dubai Marina, indicating strong value opportunity.",
                "Dubai Marina consistently shows strong rental demand from expatriate professionals and tourists.",
                "Marina views command premium rental rates of AED 85,000-95,000 annually.",
                "Building amenities and proximity to Metro, beaches, and shopping centers score 9.3/10 for rental appeal.",
              ].map((text, index) => (
                <div key={index} className="insight-item">
                  <div className="insight-icon">✓</div>
                  <p className="insight-text">{text}</p>
                </div>
              ))}
            </section>
          </div>

          <aside className="sidebar">
            <div className="sidebar-card">
              <div className="card-title">
                <div className="card-icon">🏠</div>
                Comparable Properties
              </div>

              <div className="subsection-tabs">
                <button
                  className={`tab-button ${tab === "listed" ? "active" : ""}`}
                  onClick={() => setTab("listed")}
                >
                  Listed Deals (6)
                </button>
                <button
                  className={`tab-button ${
                    tab === "transactions" ? "active" : ""
                  }`}
                  onClick={() => setTab("transactions")}
                >
                  Recent Sales (8)
                </button>
              </div>

              <div
                className={`tab-content comparable-section ${
                  tab === "listed" ? "active" : ""
                }`}
              >
                {comparableListed.map((item) => (
                  <ComparableCard key={item.title} {...item} />
                ))}
              </div>

              <div
                className={`tab-content comparable-section ${
                  tab === "transactions" ? "active" : ""
                }`}
              >
                {comparableTransactions.map((item) => (
                  <ComparableCard key={item.title} {...item} sold />
                ))}
              </div>

            <button
              className="action-btn secondary"
              onClick={handleViewAll}
              type="button"
            >
                View All Comparable Properties
              </button>
            </div>

            <div className="sidebar-card">
              <div className="card-title">
                <div className="card-icon">⭐</div>
                Rensights Score & Investment Appeal
              </div>

              <div className="score-section">
                <div className="score-value">
                  8.7<span>/10</span>
                </div>
                <div className="score-subtitle">
                  Excellent Investment Opportunity
                </div>
                <p>
                  Based on price analysis, market trends, location score, rental
                  potential, and liquidity in Dubai Marina market.
                </p>
                <div className="score-breakdown">
                  <p>
                    <strong>Market Position:</strong> Top 8% of 1BR units in
                    Dubai Marina
                  </p>
                  <p>
                    <strong>Dubai Comparison:</strong> Only 156 1BR units
                    scoring 8.5+ available citywide
                  </p>
                  <p>
                    <strong>Price Range:</strong> 1 of 12 high-scoring
                    properties under AED 1.5M
                  </p>
                </div>

                <ul className="score-components">
                  <li>
                    <span>Location & Transport</span>
                    <strong>9.3/10</strong>
                  </li>
                  <li>
                    <span>Price vs Market</span>
                    <strong>9.1/10</strong>
                  </li>
                  <li>
                    <span>Rental Potential</span>
                    <strong>8.4/10</strong>
                  </li>
                  <li>
                    <span>Liquidity Score</span>
                    <strong>8.2/10</strong>
                  </li>
                </ul>
              </div>

              <div className="investment-metrics">
                <div className="metric-box">
                  <div>7.8%</div>
                  <span>Rental Yield</span>
                </div>
                <div className="metric-box">
                  <div>AED 90K</div>
                  <span>Annual Rent</span>
                </div>
                <div className="metric-box wide">
                  <div>Dubai Mall</div>
                  <span>Nearest Landmark</span>
                </div>
              </div>

              <p className="benefits-text">
                <strong>Key Benefits:</strong> Premium Dubai Marina location
                with direct beach access and Metro connectivity. High rental
                demand from professionals working in DIFC and Downtown Dubai.
                Modern building with luxury amenities including infinity pool,
                world-class gym, and 24/7 concierge services.
              </p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

export default function PropertyDetailsPage() {
  return (
    <Suspense fallback={
      <div className="dashboard-page">
        <div style={{ padding: "2rem", textAlign: "center" }}>Loading...</div>
      </div>
    }>
      <PropertyDetailsPageContent />
    </Suspense>
  );
}

const DescriptionStat = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => (
  <div>
    <strong>{label}</strong>
    <br />
    <span>{value}</span>
  </div>
);

const ComparableCard = ({
  title,
  details,
  price,
  psf,
  status,
  sold,
}: {
  title: string;
  details: string;
  price: string;
  psf: string;
  status: string;
  sold?: boolean;
}) => (
  <div className="similar-property">
    <div className="similar-title">{title}</div>
    <div className="similar-details">{details}</div>
    <div className="similar-price-row">
      <div className="similar-price">{price}</div>
      <div className="similar-psf">{psf}</div>
    </div>
    <div
      className={`similar-status ${
        sold ? "status-sold" : "status-listed"
      }`.trim()}
    >
      {status}
    </div>
  </div>
);

