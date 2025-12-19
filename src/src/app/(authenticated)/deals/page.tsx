"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { apiClient, Deal, PaginatedDealResponse } from "@/lib/api";
import { useUser } from "@/context/UserContext";
import { useToast } from "@/components/ui/Toast";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useDebounce } from "@/hooks/useDebounce";
import "../dashboard/dashboard.css";
import "./deals.css";

export default function DealsPage() {
  const router = useRouter();
  const toast = useToast();
  const { user } = useUser();
  const isFreeUser = !user || user.userTier === 'FREE';
  const [loading, setLoading] = useState(true);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [city, setCity] = useState<"dubai">("dubai");
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

  // Debounce filters to avoid excessive API calls (500ms delay)
  const debouncedFilters = useDebounce(filters, 500);
  const debouncedCity = useDebounce(city, 300);

  const loadDeals = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const buildingStatus = debouncedFilters.status !== "all" ? debouncedFilters.status : undefined;
      const area = debouncedFilters.area !== "all" ? debouncedFilters.area : undefined;
      const bedroomCount = debouncedFilters.bedroom !== "all" ? debouncedFilters.bedroom : undefined;
      
      const response = await apiClient.getDeals(
        currentPage,
        20,
        debouncedCity,
        area,
        bedroomCount,
        buildingStatus
      );
      
      setDeals(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (error: any) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error loading deals:", error);
      }
      setError(error.message || "Failed to load deals");
    } finally {
      setLoading(false);
    }
  }, [debouncedCity, debouncedFilters, currentPage]);

  useEffect(() => {
    loadDeals();
  }, [loadDeals]);

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

  const handleCityChange = (nextCity: "dubai") => {
    setCity(nextCity);
    setFilters({ status: "all", area: "all", bedroom: "all", price: "all" });
  };

  const handleViewDetails = (id: string) => {
    router.push(`/property-details?id=${id}`);
  };

  const handleUpgrade = async () => {
    try {
      setIsUpgrading(true);
      const { url } = await apiClient.createCheckoutSession('PREMIUM');
      if (url) {
        window.location.href = url;
      } else {
        toast.showError("Failed to create checkout session. Please try again.");
        setIsUpgrading(false);
      }
    } catch (err: any) {
      toast.showError(err?.message || "Failed to start upgrade process. Please try again.");
      setIsUpgrading(false);
    }
  };

  if (loading && deals.length === 0) {
    return (
      <LoadingSpinner fullPage={false} message="Loading Deals..." />
    );
  }

  return (
    <div className="deals-page" style={{ position: 'relative' }}>
      {isFreeUser && (
        <div className="upgrade-overlay">
          <div className="upgrade-content">
            <div className="upgrade-icon">🔒</div>
            <h2>Upgrade to Standard Package</h2>
            <div className="upgrade-pricing">
              <div className="pricing-amount">$20<span className="pricing-period">/month</span></div>
            </div>
            <p>Access exclusive deals and premium features with Standard Package.</p>
            <ul className="upgrade-features">
              <li>✓ 5 tailored pricing analysis of properties selected by you</li>
              <li>✓ Advanced city analysis</li>
              <li>✓ Potentially underpriced deals</li>
              <li>✓ Full access to property analytics</li>
            </ul>
            <button 
              className="upgrade-button" 
              onClick={handleUpgrade}
              disabled={isUpgrading}
            >
              {isUpgrading ? "Processing..." : "Upgrade to Standard Package"}
            </button>
          </div>
        </div>
      )}
      <div style={{ opacity: isFreeUser ? 0.4 : 1, pointerEvents: isFreeUser ? 'none' : 'auto' }}>
      <header className="header">
        <div className="header-left">
          <div className="page-title">Underpriced Property Deals</div>
        </div>
        <div className="city-filter">
          <button
            className="city-tab active"
            disabled
          >
            Dubai
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
            {loading ? (
              <tr>
                <td colSpan={8} style={{ textAlign: "center", padding: "2rem" }}>
                  Loading deals...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={8} style={{ textAlign: "center", padding: "2rem", color: "#c33" }}>
                  {error}
                </td>
              </tr>
            ) : filteredDeals.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: "center", padding: "2rem" }}>
                  No deals found matching your filters.
                </td>
              </tr>
            ) : (
              filteredDeals.map((deal) => (
              <tr key={deal.id} onClick={() => handleViewDetails(deal.id)}>
                <td data-label="Property">
                  <div className="property-name">{deal.name}</div>
                  <div className="property-location">{deal.location}</div>
                </td>
                <td data-label="Bedrooms">
                  <span className="bedroom-badge">{deal.bedrooms}</span>
                </td>
                <td data-label="Size">
                  <span className="size-info">{deal.size}</span>
                </td>
                <td data-label="Listed Price">
                  <div className="price-current">{deal.listedPrice}</div>
                </td>
                <td data-label="Estimate">
                    <div className="price-estimate">{deal.estimateRange || "N/A"}</div>
                </td>
                <td data-label="Discount">
                    <span className="delta-positive">-{deal.discount || "N/A"}</span>
                </td>
                <td data-label="Yield">
                    <span className="yield-info">{deal.rentalYield || "N/A"}</span>
                </td>
                <td data-label="">
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
              ))
            )}
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
