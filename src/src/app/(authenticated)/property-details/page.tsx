"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiClient, Deal } from "@/lib/api";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import "../dashboard/dashboard.css";
import "./property-details.css";

type TabId = "listed" | "transactions";

function PropertyDetailsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [deal, setDeal] = useState<Deal | null>(null);
  const [comparableDeals, setComparableDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingComparables, setLoadingComparables] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<TabId>("listed");
  const propertyId = searchParams.get("id");

  const loadDeal = useCallback(async () => {
    if (!propertyId) {
      setError("Property ID is required");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const dealData = await apiClient.getDealById(propertyId);
      setDeal(dealData);
      
      // Load comparable deals (similar area and bedrooms, excluding current deal)
      if (dealData) {
        setLoadingComparables(true);
        try {
          const comparablesResponse = await apiClient.getDeals(
            0,
            10,
            dealData.city,
            dealData.area,
            dealData.bedroomCount,
            undefined
          );
          // Filter out the current deal and limit to 8
          const filtered = comparablesResponse.content
            .filter(d => d.id !== dealData.id)
            .slice(0, 8);
          setComparableDeals(filtered);
        } catch (err) {
          if (process.env.NODE_ENV === 'development') {
            console.error("Error loading comparable deals:", err);
          }
          // Don't fail the whole page if comparables fail
        } finally {
          setLoadingComparables(false);
        }
      }
    } catch (error: any) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error loading deal:", error);
      }
      setError(error.message || "Failed to load property details");
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  useEffect(() => {
    if (propertyId) {
      loadDeal();
    }
  }, [propertyId, loadDeal]);

  const handleGoBack = () => router.push("/deals");
  const handleViewProperty = () => alert("Opening property listing page...");
  const handleViewAll = () => alert("Loading all comparable properties...");

  if (loading) {
    return <LoadingSpinner message="Loading Property Details..." />;
  }

  if (error || !deal) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <p style={{ color: "#c33", marginBottom: "1rem" }}>
          {error || "Property not found"}
        </p>
        <button onClick={() => router.push("/deals")} style={{ padding: "10px 20px", background: "#f39c12", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}>
          Back to Deals
        </button>
      </div>
    );
  }

  // Calculate derived values from deal data
  const pricePerSqft = deal.priceValue / parseFloat(deal.size.replace(/[^0-9]/g, ""));
  const savingsMin = deal.estimateMin ? deal.estimateMin - deal.priceValue : 0;
  const savingsMax = deal.estimateMax ? deal.estimateMax - deal.priceValue : 0;
  const discountPercent = deal.discount ? parseFloat(deal.discount.replace("%", "")) : 0;

  return (
    <div className="property-page">
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

        {error && (
          <div style={{ padding: "1rem", background: "#fee", color: "#c33", borderRadius: "8px", marginBottom: "1rem" }}>
            {error}
          </div>
        )}

        <div className="property-content-grid">
          <div className="property-overview">
            <div className="property-header">
              <h1 className="property-title">{deal.name || "Property"}</h1>
              <p className="property-location">{deal.location}, {deal.city}</p>
              {deal.discount && (
                <div className="discount-highlight">
                  {deal.discount} Below Market Value
                </div>
              )}
            </div>

            <section className="key-metrics">
              {[
                { value: deal.bedrooms || "N/A", label: "Bedrooms" },
                { value: deal.size || "N/A", label: "Size" },
                { value: deal.buildingStatus === "READY" ? "Ready" : "Off-Plan", label: "Handover" },
                { value: deal.rentalYield || "N/A", label: "Rental Yield" },
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
                  <div className="price-value">{deal.listedPrice || "N/A"}</div>
                </div>
                <div className="price-section">
                  <div className="price-label">Our Estimate Range</div>
                  <div className="price-value price-estimate">
                    {deal.estimateRange || "N/A"}
                  </div>
                </div>
                {savingsMin > 0 && savingsMax > 0 && (
                  <div className="price-section">
                    <div className="price-label">Potential Savings</div>
                    <div className="price-value">
                      <span className="savings-amount">
                        AED {savingsMin.toLocaleString()} - {savingsMax.toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}
                <div className="price-section">
                  <div className="price-label">Price per sq ft</div>
                  <div className="price-value">AED {pricePerSqft.toLocaleString(undefined, { maximumFractionDigits: 0 })} /sq ft</div>
                  {deal.discount && <small>{deal.discount} below market avg</small>}
                </div>
              </div>
            </section>

            <section className="property-description">
              <h3>Property Description</h3>
              <div className="description-card">
                <p>
                  This {deal.bedrooms?.toLowerCase() || "property"} offers luxurious living in the
                  heart of {deal.location}. The unit features premium finishes and an
                  efficient layout that maximizes the {deal.size} space. The
                  property is located in {deal.area} area of {deal.city}.
                </p>
                <div className="description-grid">
                  <DescriptionStat
                    label="Price per sq ft:"
                    value={`AED ${pricePerSqft.toLocaleString(undefined, { maximumFractionDigits: 0 })}/sq ft`}
                  />
                  <DescriptionStat
                    label="Building Status:"
                    value={deal.buildingStatus === "READY" ? "Ready" : "Off-Plan"}
                  />
                  <DescriptionStat
                    label="Listed Price:"
                    value={deal.listedPrice || "N/A"}
                  />
                  <DescriptionStat label="Rental Yield:" value={deal.rentalYield || "N/A"} />
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
                  label: `This Property (${deal.bedrooms})`,
                  value: `AED ${pricePerSqft.toLocaleString(undefined, { maximumFractionDigits: 0 })}/sq ft`,
                },
                { label: "Listed Price", value: deal.listedPrice || "N/A" },
                { label: "Market Position", value: deal.discount ? `${deal.discount} Below Average` : "N/A" },
                { label: "Rental Yield", value: deal.rentalYield || "N/A" },
                { label: "Estimate Range", value: deal.estimateRange || "N/A" },
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

          <div className="property-sidebar">
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
                  Similar Deals ({comparableDeals.length})
                </button>
              </div>

              <div
                className={`tab-content comparable-section ${
                  tab === "listed" ? "active" : ""
                }`}
              >
                {loadingComparables ? (
                  <div style={{ padding: "1rem", textAlign: "center", color: "#666" }}>
                    Loading similar properties...
                  </div>
                ) : comparableDeals.length === 0 ? (
                  <div style={{ padding: "1rem", textAlign: "center", color: "#666" }}>
                    No similar properties found.
                  </div>
                ) : (
                  comparableDeals.map((item) => {
                    const psf = item.priceValue / parseFloat(item.size.replace(/[^0-9]/g, ""));
                    return (
                      <ComparableCard
                        key={item.id}
                        title={item.name}
                        details={`${item.bedrooms} • ${item.size} • ${item.location}`}
                        price={item.listedPrice}
                        psf={`AED ${psf.toLocaleString(undefined, { maximumFractionDigits: 0 })}/sq ft`}
                        status="Available"
                      />
                    );
                  })
                )}
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
                Investment Analysis
              </div>

              <div className="score-section">
                {deal.discount && (
                  <>
                    <div className="score-value">
                      {discountPercent.toFixed(1)}%<span> Below Market</span>
                    </div>
                    <div className="score-subtitle">
                      {discountPercent >= 15 ? "Excellent" : discountPercent >= 10 ? "Good" : "Fair"} Investment Opportunity
                    </div>
                    <p>
                      Based on price analysis, market trends, location score, rental
                      potential, and liquidity in {deal.location} market.
                    </p>
                    <div className="score-breakdown">
                      <p>
                        <strong>Listed Price:</strong> {deal.listedPrice}
                      </p>
                      {deal.estimateRange && (
                        <p>
                          <strong>Market Estimate:</strong> {deal.estimateRange}
                        </p>
                      )}
                      {savingsMin > 0 && savingsMax > 0 && (
                        <p>
                          <strong>Potential Savings:</strong> AED {savingsMin.toLocaleString()} - {savingsMax.toLocaleString()}
                        </p>
                      )}
                      {deal.rentalYield && (
                        <p>
                          <strong>Rental Yield:</strong> {deal.rentalYield}
                        </p>
                      )}
                    </div>

                    <ul className="score-components">
                      <li>
                        <span>Price vs Market</span>
                        <strong>{discountPercent.toFixed(1)}%</strong>
                      </li>
                      {deal.rentalYield && (
                        <li>
                          <span>Rental Yield</span>
                          <strong>{deal.rentalYield}</strong>
                        </li>
                      )}
                      <li>
                        <span>Building Status</span>
                        <strong>{deal.buildingStatus === "READY" ? "Ready" : "Off-Plan"}</strong>
                      </li>
                    </ul>
                  </>
                )}
              </div>

              {deal.rentalYield && (
                <div className="investment-metrics">
                  <div className="metric-box">
                    <div>{deal.rentalYield}</div>
                    <span>Rental Yield</span>
                  </div>
                  <div className="metric-box">
                    <div>{deal.listedPrice}</div>
                    <span>Listed Price</span>
                  </div>
                  <div className="metric-box wide">
                    <div>{deal.location}</div>
                    <span>Location</span>
                  </div>
                </div>
              )}

              <p className="benefits-text">
                <strong>Key Benefits:</strong> Property located in {deal.location}, {deal.city}. 
                {deal.buildingStatus === "READY" ? " Ready property allows immediate occupancy and rental income." : " Off-plan property offers potential for capital appreciation."}
                {deal.rentalYield && ` Rental yield of ${deal.rentalYield} provides attractive returns for investors.`}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PropertyDetailsPage() {
  return (
    <Suspense fallback={
      <LoadingSpinner fullPage={true} message="Loading..." />
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


