"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { apiClient, Deal, PaginatedDealResponse } from "@/lib/api";
import "../dashboard/dashboard.css";
import "./deals.css";

const MENU_ITEMS = [
  { id: "analysis", label: "City Analysis", icon: "📊", path: "/city-analysis" },
  { id: "reports", label: "Property Reports", icon: "📋", path: "/dashboard" },
  { id: "alerts", label: "Weekly Deals", icon: "🚨", path: "/deals" },
  { id: "account", label: "Account", icon: "⚙️", path: "/account" },
];

export default function DealsPage() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [city, setCity] = useState<"dubai" | "abudhabi">("dubai");
  const [filters, setFilters] = useState({
    status: "all",
    area: "all",
    bedroom: "all",
    price: "all",
  });
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const loadDeals = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const buildingStatus = filters.status !== "all" ? filters.status : undefined;
      const area = filters.area !== "all" ? filters.area : undefined;
      const bedroomCount = filters.bedroom !== "all" ? filters.bedroom : undefined;
      
      const response = await apiClient.getDeals(
        currentPage,
        20,
        city,
        area,
        bedroomCount,
        buildingStatus
      );
      
      setDeals(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (error: any) {
      console.error("Error loading deals:", error);
      setError(error.message || "Failed to load deals");
    } finally {
      setLoading(false);
    }
  }, [city, filters, currentPage]);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await apiClient.getCurrentUser();
        setUser(userData);
      } catch (error) {
        router.push("/");
      }
    };
    loadUser();
  }, [router]);

  useEffect(() => {
    loadDeals();
  }, [loadDeals]);

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
    return deals.filter((deal) => {
      // Price filter is handled client-side since API doesn't support it yet
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
  }, [deals, filters]);

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
        (sum, deal) => sum + parseFloat((deal.discount || "0").replace("%", "")),
        0
      ) / filteredDeals.length;
    const yieldAvg =
      filteredDeals.reduce(
        (sum, deal) => sum + parseFloat((deal.rentalYield || "0").replace("%", "")),
        0
      ) / filteredDeals.length;
    const sizes = filteredDeals.map((deal) =>
      parseInt(deal.size.replace(/[^0-9]/g, ""), 10)
    );
    const minSize = Math.min(...sizes);
    const maxSize = Math.max(...sizes);
    return {
      total: filteredDeals.length,
      avgDiscount: `${discountAvg.toFixed(1)}%`,
      sizeRange: `${minSize}-${maxSize} sq ft`,
      avgYield: `${yieldAvg.toFixed(1)}%`,
    };
  }, [filteredDeals]);

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleCityChange = (nextCity: "dubai" | "abudhabi") => {
    setCity(nextCity);
    setFilters({ status: "all", area: "all", bedroom: "all", price: "all" });
  };

  const handleViewDetails = (id: string) => {
    router.push(`/property-details?id=${id}`);
  };

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
              value={stats.avgDiscount || '0%'}
              label="Avg. Price vs. Market"
            />
            <StatCard
              value={stats.sizeRange || 'N/A'}
              label="Most Liquid Size Range"
            />
            <StatCard
              value={stats.avgYield || '0%'}
              label="Avg. Gross Rental Yield"
            />
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
            <button 
              disabled={currentPage === 0}
              onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
            >
              Previous
            </button>
            <span>
              Page {currentPage + 1} of {totalPages} ({totalElements} total)
            </span>
            <button 
              disabled={currentPage >= totalPages - 1}
              onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
            >
              Next
            </button>
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

