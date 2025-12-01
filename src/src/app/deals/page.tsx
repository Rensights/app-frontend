"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api";
import "../dashboard/dashboard.css";
import "./deals.css";

const MENU_ITEMS = [
  { id: "analysis", label: "City Analysis", icon: "📊", path: "/city-analysis" },
  { id: "reports", label: "Property Reports", icon: "📋", path: "/dashboard" },
  { id: "alerts", label: "Weekly Deals", icon: "🚨", path: "/deals" },
  { id: "account", label: "Account", icon: "⚙️", path: "/account" },
];

type Deal = {
  id: number;
  name: string;
  location: string;
  bedrooms: string;
  size: string;
  listedPrice: string;
  estimateRange: string;
  discount: string;
  rentalYield: string;
  area: string;
  bedroomCount: string;
  priceValue: number;
  buildingStatus: "ready" | "off-plan";
};

const dealsData: Record<"dubai" | "abudhabi", Deal[]> = {
  dubai: [
    {
      id: 1,
      name: "Marina Pinnacle Tower",
      location: "Dubai Marina",
      bedrooms: "1BR",
      size: "750 sq ft",
      listedPrice: "AED 1,450,000",
      estimateRange: "AED 1,750,000 - 1,820,000",
      discount: "18.2%",
      rentalYield: "6.8%",
      area: "marina",
      bedroomCount: "1",
      priceValue: 1450000,
      buildingStatus: "ready",
    },
    {
      id: 2,
      name: "Downtown Burj Vista",
      location: "Downtown Dubai",
      bedrooms: "2BR",
      size: "1,100 sq ft",
      listedPrice: "AED 2,850,000",
      estimateRange: "AED 3,450,000 - 3,580,000",
      discount: "19.1%",
      rentalYield: "5.9%",
      area: "downtown",
      bedroomCount: "2",
      priceValue: 2850000,
      buildingStatus: "ready",
    },
    {
      id: 3,
      name: "Business Bay Executive",
      location: "Business Bay",
      bedrooms: "Studio",
      size: "580 sq ft",
      listedPrice: "AED 895,000",
      estimateRange: "AED 1,080,000 - 1,125,000",
      discount: "17.8%",
      rentalYield: "7.2%",
      area: "business-bay",
      bedroomCount: "studio",
      priceValue: 895000,
      buildingStatus: "off-plan",
    },
    {
      id: 4,
      name: "Jumeirah Beach Residence",
      location: "JBR",
      bedrooms: "2BR",
      size: "1,250 sq ft",
      listedPrice: "AED 3,250,000",
      estimateRange: "AED 3,950,000 - 4,100,000",
      discount: "18.9%",
      rentalYield: "6.1%",
      area: "jumeirah",
      bedroomCount: "2",
      priceValue: 3250000,
      buildingStatus: "ready",
    },
    {
      id: 5,
      name: "DIFC Financial Plaza",
      location: "DIFC",
      bedrooms: "1BR",
      size: "850 sq ft",
      listedPrice: "AED 1,750,000",
      estimateRange: "AED 2,120,000 - 2,200,000",
      discount: "18.4%",
      rentalYield: "6.5%",
      area: "downtown",
      bedroomCount: "1",
      priceValue: 1750000,
      buildingStatus: "ready",
    },
    {
      id: 6,
      name: "Palm Jumeirah Shoreline",
      location: "Palm Jumeirah",
      bedrooms: "3BR",
      size: "1,680 sq ft",
      listedPrice: "AED 4,850,000",
      estimateRange: "AED 5,850,000 - 6,050,000",
      discount: "17.5%",
      rentalYield: "5.4%",
      area: "jumeirah",
      bedroomCount: "3",
      priceValue: 4850000,
      buildingStatus: "ready",
    },
    {
      id: 7,
      name: "Marina Walk Promenade",
      location: "Dubai Marina",
      bedrooms: "Studio",
      size: "520 sq ft",
      listedPrice: "AED 785,000",
      estimateRange: "AED 950,000 - 985,000",
      discount: "18.6%",
      rentalYield: "7.5%",
      area: "marina",
      bedroomCount: "studio",
      priceValue: 785000,
      buildingStatus: "off-plan",
    },
    {
      id: 8,
      name: "Emaar Boulevard Heights",
      location: "Downtown Dubai",
      bedrooms: "2BR",
      size: "1,150 sq ft",
      listedPrice: "AED 3,150,000",
      estimateRange: "AED 3,800,000 - 3,950,000",
      discount: "17.9%",
      rentalYield: "5.7%",
      area: "downtown",
      bedroomCount: "2",
      priceValue: 3150000,
      buildingStatus: "ready",
    },
    {
      id: 9,
      name: "Business Bay Canal View",
      location: "Business Bay",
      bedrooms: "1BR",
      size: "680 sq ft",
      listedPrice: "AED 1,185,000",
      estimateRange: "AED 1,425,000 - 1,480,000",
      discount: "17.6%",
      rentalYield: "6.9%",
      area: "business-bay",
      bedroomCount: "1",
      priceValue: 1185000,
      buildingStatus: "off-plan",
    },
    {
      id: 10,
      name: "The Beach Residence",
      location: "JBR",
      bedrooms: "1BR",
      size: "720 sq ft",
      listedPrice: "AED 1,650,000",
      estimateRange: "AED 1,990,000 - 2,065,000",
      discount: "18.1%",
      rentalYield: "6.3%",
      area: "jumeirah",
      bedroomCount: "1",
      priceValue: 1650000,
      buildingStatus: "ready",
    },
    {
      id: 11,
      name: "Marina Gate Towers",
      location: "Dubai Marina",
      bedrooms: "3BR",
      size: "1,450 sq ft",
      listedPrice: "AED 3,850,000",
      estimateRange: "AED 4,650,000 - 4,820,000",
      discount: "17.8%",
      rentalYield: "5.6%",
      area: "marina",
      bedroomCount: "3",
      priceValue: 3850000,
      buildingStatus: "ready",
    },
    {
      id: 12,
      name: "Opus Tower by Zaha Hadid",
      location: "Business Bay",
      bedrooms: "2BR",
      size: "1,350 sq ft",
      listedPrice: "AED 4,250,000",
      estimateRange: "AED 5,150,000 - 5,350,000",
      discount: "18.3%",
      rentalYield: "5.8%",
      area: "business-bay",
      bedroomCount: "2",
      priceValue: 4250000,
      buildingStatus: "off-plan",
    },
  ],
  abudhabi: [
    {
      id: 21,
      name: "Corniche Towers",
      location: "Corniche",
      bedrooms: "2BR",
      size: "1,200 sq ft",
      listedPrice: "AED 1,850,000",
      estimateRange: "AED 2,250,000 - 2,350,000",
      discount: "19.2%",
      rentalYield: "6.4%",
      area: "downtown",
      bedroomCount: "2",
      priceValue: 1850000,
      buildingStatus: "ready",
    },
    {
      id: 22,
      name: "Al Reem Island Marina",
      location: "Al Reem Island",
      bedrooms: "1BR",
      size: "850 sq ft",
      listedPrice: "AED 1,250,000",
      estimateRange: "AED 1,520,000 - 1,580,000",
      discount: "18.7%",
      rentalYield: "6.7%",
      area: "marina",
      bedroomCount: "1",
      priceValue: 1250000,
      buildingStatus: "ready",
    },
    {
      id: 23,
      name: "Saadiyat Beach Villas",
      location: "Saadiyat Island",
      bedrooms: "3BR",
      size: "1,650 sq ft",
      listedPrice: "AED 3,850,000",
      estimateRange: "AED 4,650,000 - 4,850,000",
      discount: "17.9%",
      rentalYield: "5.2%",
      area: "jumeirah",
      bedroomCount: "3",
      priceValue: 3850000,
      buildingStatus: "ready",
    },
    {
      id: 24,
      name: "Yas Island Gateway",
      location: "Yas Island",
      bedrooms: "Studio",
      size: "620 sq ft",
      listedPrice: "AED 785,000",
      estimateRange: "AED 950,000 - 985,000",
      discount: "18.1%",
      rentalYield: "7.1%",
      area: "marina",
      bedroomCount: "studio",
      priceValue: 785000,
      buildingStatus: "off-plan",
    },
    {
      id: 25,
      name: "Capital Gate District",
      location: "Capital Centre",
      bedrooms: "1BR",
      size: "720 sq ft",
      listedPrice: "AED 1,150,000",
      estimateRange: "AED 1,385,000 - 1,445,000",
      discount: "17.6%",
      rentalYield: "6.8%",
      area: "business-bay",
      bedroomCount: "1",
      priceValue: 1150000,
      buildingStatus: "off-plan",
    },
    {
      id: 26,
      name: "Marina Square Towers",
      location: "Al Reem Island",
      bedrooms: "2BR",
      size: "1,100 sq ft",
      listedPrice: "AED 2,150,000",
      estimateRange: "AED 2,600,000 - 2,700,000",
      discount: "18.4%",
      rentalYield: "6.3%",
      area: "marina",
      bedroomCount: "2",
      priceValue: 2150000,
      buildingStatus: "ready",
    },
    {
      id: 27,
      name: "Sheikh Zayed Grand View",
      location: "Al Maryah Island",
      bedrooms: "3BR",
      size: "1,580 sq ft",
      listedPrice: "AED 4,250,000",
      estimateRange: "AED 5,150,000 - 5,350,000",
      discount: "18.6%",
      rentalYield: "5.5%",
      area: "downtown",
      bedroomCount: "3",
      priceValue: 4250000,
      buildingStatus: "ready",
    },
    {
      id: 28,
      name: "Etihad Towers Residence",
      location: "Corniche",
      bedrooms: "2BR",
      size: "1,350 sq ft",
      listedPrice: "AED 3,650,000",
      estimateRange: "AED 4,400,000 - 4,580,000",
      discount: "17.8%",
      rentalYield: "5.9%",
      area: "downtown",
      bedroomCount: "2",
      priceValue: 3650000,
      buildingStatus: "ready",
    },
  ],
};

export default function DealsPage() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [city, setCity] = useState<"dubai" | "abudhabi">("dubai");
  const [filters, setFilters] = useState({
    status: "all",
    area: "all",
    bedroom: "all",
    price: "all",
  });

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

  const filteredDeals = useMemo(() => {
    return dealsData[city].filter((deal) => {
      if (filters.status !== "all" && deal.buildingStatus !== filters.status)
        return false;
      if (filters.area !== "all" && deal.area !== filters.area) return false;
      if (filters.bedroom !== "all" && deal.bedroomCount !== filters.bedroom)
        return false;
      if (filters.price !== "all") {
        const p = deal.priceValue;
        if (filters.price === "under-1m" && p >= 1000000) return false;
        if (filters.price === "1m-2m" && (p < 1000000 || p > 2000000))
          return false;
        if (filters.price === "2m-5m" && (p <= 2000000 || p > 5000000))
          return false;
        if (filters.price === "over-5m" && p <= 5000000) return false;
      }
      return true;
    });
  }, [city, filters]);

  const stats = useMemo(() => {
    if (!filteredDeals.length) {
      return {
        total: 0,
        discount: "0%",
        sizeRange: "N/A",
        yield: "0%",
      };
    }
    const discountAvg =
      filteredDeals.reduce(
        (sum, deal) => sum + parseFloat(deal.discount),
        0
      ) / filteredDeals.length;
    const yieldAvg =
      filteredDeals.reduce(
        (sum, deal) => sum + parseFloat(deal.rentalYield),
        0
      ) / filteredDeals.length;
    const sizes = filteredDeals.map((deal) =>
      parseInt(deal.size.replace(/[^0-9]/g, ""), 10)
    );
    const minSize = Math.min(...sizes);
    const maxSize = Math.max(...sizes);
    return {
      total: filteredDeals.length,
      discount: `${discountAvg.toFixed(1)}%`,
      sizeRange: `${minSize}-${maxSize} sq ft`,
      yield: `${yieldAvg.toFixed(1)}%`,
    };
  }, [filteredDeals]);

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleCityChange = (nextCity: "dubai" | "abudhabi") => {
    setCity(nextCity);
    setFilters({ status: "all", area: "all", bedroom: "all", price: "all" });
  };

  const handleViewDetails = (id: number) =>
    alert(`Opening property ${id}...`);

  if (loading) {
    return (
      <div className="dashboard-page">
        <div style={{ padding: "2rem", textAlign: "center" }}>Loading...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-page deals-page">
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
              aria-current={item.id === "alerts" ? "page" : undefined}
              className={`menu-item ${
                item.id === "alerts" ? "active" : ""
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

        <div className="container">
          <header className="header">
            <div className="header-left">
              <button className="back-btn" onClick={() => router.push('/dashboard')}>
                ← Back to Dashboard
              </button>
            <div className="logo">Rensights</div>
            <div className="page-title">Underpriced Property Deals</div>
          </div>
          <div className="city-filter">
            <button
              className={`city-tab ${city === "dubai" ? "active" : ""}`}
              onClick={() => handleCityChange("dubai")}
            >
              Dubai
            </button>
            <button
              className={`city-tab ${city === "abudhabi" ? "active" : ""}`}
              onClick={() => handleCityChange("abudhabi")}
            >
              Abu Dhabi
            </button>
          </div>
        </header>

        <section className="summary-stats">
          <div className="stats-grid">
            <StatCard
              value={stats.total.toString()}
              label="Available Deals in Selected Area"
            />
            <StatCard
              value={stats.discount}
              label="Avg. Price vs. Market"
            />
            <StatCard
              value={stats.sizeRange}
              label="Most Liquid Size Range"
            />
            <StatCard value={stats.yield} label="Avg. Gross Rental Yield" />
          </div>
        </section>

        <section className="deals-container">
          <h3>Property Opportunities</h3>
          <div className="filters-section">
            <div className="filters-grid">
              <FilterSelect
                label="Building Status"
                value={filters.status}
                options={[
                  { value: "all", label: "All Properties" },
                  { value: "ready", label: "Ready" },
                  { value: "off-plan", label: "Off-Plan" },
                ]}
                onChange={(value) => handleFilterChange("status", value)}
              />
              <FilterSelect
                label="Filter by Area"
                value={filters.area}
                options={[
                  { value: "all", label: "All Areas" },
                  { value: "downtown", label: "Downtown" },
                  { value: "marina", label: "Marina" },
                  { value: "business-bay", label: "Business Bay" },
                  { value: "jumeirah", label: "Jumeirah" },
                ]}
                onChange={(value) => handleFilterChange("area", value)}
              />
              <FilterSelect
                label="Bedrooms"
                value={filters.bedroom}
                options={[
                  { value: "all", label: "All Types" },
                  { value: "studio", label: "Studio" },
                  { value: "1", label: "1 Bedroom" },
                  { value: "2", label: "2 Bedrooms" },
                  { value: "3", label: "3+ Bedrooms" },
                ]}
                onChange={(value) => handleFilterChange("bedroom", value)}
              />
              <FilterSelect
                label="Price Range"
                value={filters.price}
                options={[
                  { value: "all", label: "All Prices" },
                  { value: "under-1m", label: "Under AED 1M" },
                  { value: "1m-2m", label: "AED 1M - 2M" },
                  { value: "2m-5m", label: "AED 2M - 5M" },
                  { value: "over-5m", label: "Over AED 5M" },
                ]}
                onChange={(value) => handleFilterChange("price", value)}
              />
            </div>
          </div>

          <table className="deals-table">
            <thead>
              <tr>
                <th>Property</th>
                <th>Type</th>
                <th>Size</th>
                <th>Listed Price</th>
                <th>Our Estimate</th>
                <th>Price vs. Market</th>
                <th>Rental Yield</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredDeals.map((deal) => (
                <tr key={deal.id} onClick={() => handleViewDetails(deal.id)}>
                  <td>
                    <div className="property-name">{deal.name}</div>
                    <div className="property-location">{deal.location}</div>
                  </td>
                  <td>
                    <span className="bedroom-badge">{deal.bedrooms}</span>
                  </td>
                  <td>
                    <span className="size-info">{deal.size}</span>
                  </td>
                  <td>
                    <div className="price-current">{deal.listedPrice}</div>
                  </td>
                  <td>
                    <div className="price-estimate">{deal.estimateRange}</div>
                  </td>
                  <td>
                    <span className="delta-positive">-{deal.discount}</span>
                  </td>
                  <td>
                    <span className="yield-info">{deal.rentalYield}</span>
                  </td>
                  <td>
                    <button
                      className="details-btn"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleViewDetails(deal.id);
                      }}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="pagination">
            <button onClick={() => alert("Previous page...")}>Previous</button>
            <button className="active">1</button>
            <button>2</button>
            <button onClick={() => alert("Next page...")}>Next</button>
          </div>
        </section>
        </div>
      </main>
    </div>
  );
}

const StatCard = ({ value, label }: { value: string; label: string }) => (
  <div className="stat-item">
    <div className="stat-value">{value}</div>
    <div className="stat-label">{label}</div>
  </div>
);

const FilterSelect = ({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) => (
  <div className="filter-group">
    <label className="filter-label">{label}</label>
    <select
      className="filter-select"
      value={value}
      onChange={(event) => onChange(event.target.value)}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

