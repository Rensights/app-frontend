"use client";

import { useState, useEffect, useCallback } from "react";
import "../../dashboard/dashboard.css";
import "../city-analysis.css";

const documentSections = [
  {
    id: "market-outlook",
    title: "Dubai Real Estate Market Outlook",
    navTitle: "Real Estate Market Outlook",
    description:
      "A high-level strategic overview of Dubai's real estate market, analyzing profitability, rental yields, capital appreciation, and liquidity trends using historical transactions and live market data.",
    documentTitle: "Dubai Real Estate Market Outlook - January 2026",
    documentDescription: "Strategic market analysis with profitability and liquidity insights",
    pdfUrl: "/documents/market-outlook-jan-2026.pdf",
    lastUpdated: "January 2026",
    isLatest: true,
  },
  {
    id: "area-performance",
    title: "Dubai Area Performance Analysis",
    navTitle: "Area Performance Analysis",
    description:
      "A comparative investment analysis of Dubai's prime and emerging areas, identifying where investors can achieve the strongest returns based on yield, price growth, and demand dynamics.",
    documentTitle: "Dubai Area Performance Analysis - January 2026",
    documentDescription: "Comparative analysis of prime and emerging investment areas",
    pdfUrl: "/documents/area-performance-jan-2026.pdf",
    lastUpdated: "January 2026",
    isLatest: true,
  },
  {
    id: "property-type",
    title: "Property Type Investment Performance",
    navTitle: "Property Type Performance",
    description:
      "A detailed performance review of apartments, villas, townhouses, and other asset classes to determine which property types deliver optimal income, appreciation, and exit liquidity.",
    documentTitle: "Property Type Investment Performance - January 2026",
    documentDescription: "Asset class comparison for income and appreciation optimization",
    pdfUrl: "/documents/property-type-jan-2026.pdf",
    lastUpdated: "January 2026",
    isLatest: true,
  },
  {
    id: "property-size",
    title: "Property Size Investment Analysis",
    navTitle: "Property Size Analysis",
    description:
      "A focused breakdown of performance by unit size, showing how different layouts and square footage impact rental income, resale value, and investor demand.",
    documentTitle: "Property Size Investment Analysis - January 2026",
    documentDescription: "Unit size impact on rental income and resale performance",
    pdfUrl: "/documents/property-size-jan-2026.pdf",
    lastUpdated: "January 2026",
    isLatest: true,
  },
  {
    id: "project-selection",
    title: "Project & Building Selection Intelligence",
    navTitle: "Project Selection Intelligence",
    description:
      "A building-level intelligence report ranking specific projects and developments by profitability, rental stability, transaction velocity, and investor demand.",
    documentTitle: "Project & Building Selection Intelligence - January 2026",
    documentDescription: "Building-level rankings by profitability and demand metrics",
    pdfUrl: "/documents/project-selection-jan-2026.pdf",
    lastUpdated: "January 2026",
    isLatest: true,
  },
  {
    id: "price-negotiation",
    title: "Price Negotiation Intelligence",
    navTitle: "Price Negotiation Intelligence",
    description:
      "A data-backed negotiation framework that benchmarks asking prices against historical transactions to define realistic purchase targets and negotiation margins.",
    documentTitle: "Price Negotiation Intelligence - January 2026",
    documentDescription: "Transaction-based pricing benchmarks and negotiation strategies",
    pdfUrl: "/documents/price-negotiation-jan-2026.pdf",
    lastUpdated: "January 2026",
    isLatest: true,
  },
  {
    id: "allocation-strategy",
    title: "Allocation Strategy by Budget",
    navTitle: "Allocation by Budget",
    description:
      "A budget-driven investment strategy that matches capital ranges with the highest-performing areas, property types, and projects to optimize risk-adjusted returns.",
    documentTitle: "Allocation Strategy by Budget - January 2026",
    documentDescription: "Capital allocation optimization across areas and property types",
    pdfUrl: "/documents/allocation-strategy-jan-2026.pdf",
    lastUpdated: "January 2026",
    isLatest: true,
  },
];

export default function DetailedCityAnalysisPage() {
  const [activeSection, setActiveSection] = useState(documentSections[0].id);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewPdf, setPreviewPdf] = useState({ url: "", title: "" });

  useEffect(() => {
    const handleScroll = () => {
      const sectionElements = documentSections.map((section) => ({
        id: section.id,
        element: document.getElementById(section.id),
      }));

      for (const section of sectionElements) {
        if (section.element) {
          const rect = section.element.getBoundingClientRect();
          if (rect.top <= 140 && rect.bottom > 140) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavigate = useCallback((sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 120;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
      setActiveSection(sectionId);
    }
  }, []);

  const handlePreview = useCallback((pdfUrl: string, title: string) => {
    setPreviewPdf({ url: pdfUrl, title });
    setPreviewOpen(true);
  }, []);

  return (
    <div className="city-analysis-page detailed-page">
      <div className="documents-hero">
        <div className="documents-hero-inner">
          <div className="documents-title">
            <span className="doc-icon">📄</span>
            <h1>Investment Intelligence Reports</h1>
          </div>
          <p>Data-driven insights to power your Dubai real estate investment decisions</p>
        </div>
      </div>

      <nav className="documents-nav">
        <div className="documents-nav-track">
          {documentSections.map((section) => (
            <button
              key={section.id}
              onClick={() => handleNavigate(section.id)}
              className={`documents-tab ${activeSection === section.id ? "active" : ""}`}
            >
              {section.navTitle}
            </button>
          ))}
        </div>
      </nav>

      <div className="documents-container">
        {documentSections.map((section) => (
          <section key={section.id} id={section.id} className="document-section">
            <div className="document-card">
              <h2>{section.title}</h2>
              <p className="document-description">{section.description}</p>
              <div className="document-file">
                <div className="document-file-icon">📄</div>
                <div className="document-file-body">
                  <div className="document-file-title">
                    <span>{section.documentTitle}</span>
                    {section.isLatest && <span className="document-tag">Latest Version</span>}
                  </div>
                  <p className="document-file-subtitle">{section.documentDescription}</p>
                  <div className="document-meta">
                    <span>PDF</span>
                    <span className="dot">•</span>
                    <span>Last updated: {section.lastUpdated}</span>
                  </div>
                </div>
              </div>
              <div className="document-actions">
                <button
                  type="button"
                  className="doc-btn doc-btn-primary"
                  onClick={() => handlePreview(section.pdfUrl, section.documentTitle)}
                >
                  Preview PDF
                </button>
                <a
                  className="doc-btn doc-btn-outline"
                  href={section.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                >
                  Download PDF
                </a>
              </div>
            </div>
          </section>
        ))}
      </div>

      {previewOpen && (
        <div className="pdf-modal" onClick={() => setPreviewOpen(false)}>
          <div className="pdf-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="pdf-modal-header">
              <h3>{previewPdf.title}</h3>
              <button className="pdf-close" onClick={() => setPreviewOpen(false)}>×</button>
            </div>
            <iframe
              src={`${previewPdf.url}#toolbar=1&navpanes=0`}
              title={previewPdf.title}
            />
          </div>
        </div>
      )}
        <section id="sizes" className="section-card">
          <div className="section-card-header">
            <h3>
              <svg width="24" height="24" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-.5a1.5 1.5 0 000 3h.5a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-.5a1.5 1.5 0 00-3 0v.5a1 1 0 01-1 1H6a1 1 0 01-1-1v-3a1 1 0 00-1-1h-.5a1.5 1.5 0 010-3H4a1 1 0 001-1V6a1 1 0 011-1h3a1 1 0 001-1v-.5z"/>
              </svg>
              Dubai Properties Analysis by Size
            </h3>
            <div className="section-filters">
              <div className="filter-pill active" onClick={handleFilterClick}>All Sizes</div>
              <div className="filter-pill" onClick={handleFilterClick}>Studio</div>
              <div className="filter-pill" onClick={handleFilterClick}>1-Bed</div>
              <div className="filter-pill" onClick={handleFilterClick}>2-Bed</div>
            </div>
          </div>
          <div className="section-content">
            <div className="charts-area">
              <div className="chart-card">
                <div className="chart-header">
                  <h5>Price & Yield by Property Size</h5>
                  <p className="subtitle">Average pricing and rental yield by bedroom count</p>
                </div>
                <div className="chart-body">
                  Chart: Size comparison metrics
                </div>
              </div>
              <div className="chart-card">
                <div className="chart-header">
                  <h5>Occupancy Rates & Market Trends</h5>
                  <p className="subtitle">Demand patterns and occupancy by size</p>
                </div>
                <div className="chart-body">
                  Chart: Occupancy and trends
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Which Property to Buy - Standard+ only */}
        {!isFreeUser && (
        <section id="which-to-buy" className="section-card">
          <div className="section-card-header">
            <h3>
              <svg width="24" height="24" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
              Which Property or Project to Buy?
            </h3>
            <div className="section-filters">
              <div className="filter-pill active" onClick={handleFilterClick}>All Recommendations</div>
              <div className="filter-pill" onClick={handleFilterClick}>High ROI</div>
              <div className="filter-pill" onClick={handleFilterClick}>Near Metro</div>
            </div>
          </div>
          <div className="section-content">
            <div className="charts-area">
              <div className="chart-card">
                <div className="chart-header">
                  <h5>Top Investment Opportunities</h5>
                  <p className="subtitle">Ranked by investment score and potential</p>
                </div>
                <div className="chart-body">
                  Chart: Top-scored properties ranking
                </div>
              </div>
              <div className="chart-card">
                <div className="chart-header">
                  <h5>Occupancy vs Metro Proximity</h5>
                  <p className="subtitle">Correlation between location and performance</p>
                </div>
                <div className="chart-body">
                  Chart: Metro proximity impact
                </div>
              </div>
            </div>
          </div>
        </section>
        )}

        {/* Section 5: Price Negotiation Intelligence - Standard+ only */}
        {!isFreeUser && (
        <section id="negotiation" className="section-card">
          <div className="section-card-header">
            <h3>
              <svg width="24" height="24" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"/>
              </svg>
              Price Negotiation Intelligence
            </h3>
            <div className="section-filters">
              <div className="filter-pill active" onClick={handleFilterClick}>All Markets</div>
              <div className="filter-pill" onClick={handleFilterClick}>Off-Plan</div>
              <div className="filter-pill" onClick={handleFilterClick}>Resale</div>
            </div>
          </div>
          <div className="section-content">
            <div className="charts-area">
              <div className="chart-card">
                <div className="chart-header">
                  <h5>Market Value vs Listed Price</h5>
                  <p className="subtitle">Average negotiation room by property type</p>
                </div>
                <div className="chart-body">
                  Chart: Price gap analysis
                </div>
              </div>
              <div className="chart-card">
                <div className="chart-header">
                  <h5>Negotiation Success Rates</h5>
                  <p className="subtitle">Optimal offer strategies and timing</p>
                </div>
                <div className="chart-body">
                  Chart: Success rates by strategy
                </div>
              </div>
            </div>
          </div>
        </section>
        )}

        {/* Section 6: Analysis by Budget - Trusted Advisor only */}
        {isTrustedAdvisor && (
        <section id="budget" className="section-card">
          <div className="section-card-header">
            <h3>
              <svg width="24" height="24" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z"/>
                <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd"/>
              </svg>
              Overall Analysis by Investor Budget
            </h3>
            <div className="section-filters">
              <div className="filter-pill active" onClick={handleFilterClick}>All Budgets</div>
              <div className="filter-pill" onClick={handleFilterClick}>&lt;800K</div>
              <div className="filter-pill" onClick={handleFilterClick}>800K-1.5M</div>
              <div className="filter-pill" onClick={handleFilterClick}>&gt;3M</div>
            </div>
          </div>
          <div className="section-content">
            <div className="charts-area">
              <div className="chart-card">
                <div className="chart-header">
                  <h5>Opportunities by Budget Range</h5>
                  <p className="subtitle">Best value properties and ROI by price bracket</p>
                </div>
                <div className="chart-body">
                  Chart: Budget segmentation analysis
                </div>
              </div>
              <div className="chart-card">
                <div className="chart-header">
                  <h5>Budget Allocation Strategies</h5>
                  <p className="subtitle">Recommended investment mix by budget</p>
                </div>
                <div className="chart-body">
                  Chart: Allocation recommendations
                </div>
              </div>
            </div>
          </div>
        </section>
        )}

        {/* Upgrade prompts for restricted sections */}
        {isFreeUser && (
          <section className="section-card" style={{ background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.05) 100%)', border: '2px solid rgba(245, 158, 11, 0.3)' }}>
            <h3 style={{ marginBottom: '1rem', color: '#d97706' }}>🔒 Upgrade to Access More Analysis</h3>
            <p style={{ marginBottom: '1.5rem', color: '#666' }}>
              Sections 4-6 (Which Property to Buy, Price Negotiation Intelligence, and Analysis by Budget) are available for Standard Package and above.
            </p>
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                router.push('/pricing');
              }}
              style={{
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #f39c12, #e67e22)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}>
              Upgrade to Standard Package
            </button>
          </section>
        )}

        {isStandardUser && (
          <section className="section-card" style={{ background: 'linear-gradient(135deg, rgba(155, 89, 182, 0.1) 0%, rgba(155, 89, 182, 0.05) 100%)', border: '2px solid rgba(155, 89, 182, 0.3)' }}>
            <h3 style={{ marginBottom: '1rem', color: '#9b59b6' }}>💎 Upgrade to Trusted Advisor</h3>
            <p style={{ marginBottom: '1.5rem', color: '#666' }}>
              Section 6 (Overall Analysis by Investor Budget) is available for Trusted Advisor subscribers.
            </p>
            <Link 
              href="/portal/early-access"
              onClick={(e) => {
                e.stopPropagation();
              }}
              style={{
                display: 'inline-block',
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #9b59b6, #8e44ad)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                textDecoration: 'none',
                textAlign: 'center'
              }}>
              Request Early Access
            </Link>
          </section>
        )}

        {/* Contact Bar */}
        <div className="contact-bar">
          <div>
            <h3>Need tailored investment picks?</h3>
            <p>Talk to Rensight's expert team for personalized recommendations</p>
          </div>
          <button className="contact-cta" onClick={handleContactUs}>Contact Us</button>
        </div>
      </div>
    </div>
  );
}
