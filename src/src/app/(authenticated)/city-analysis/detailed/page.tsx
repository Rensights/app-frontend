"use client";

import { useRouter } from "next/navigation";
import "../../dashboard/dashboard.css";
import "../city-analysis.css";

export default function DetailedCityAnalysisPage() {
  const router = useRouter();

  const handleSectionClick = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleContactUs = () => {
    alert('Contact Form\n\nOur team will get back to you within 24 hours.\n\nEmail: support@rensight.com\nPhone: +971 4 XXX XXXX');
  };

  const handleFilterClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const clickedPill = e.currentTarget;
    const parent = clickedPill.parentElement;
    if (parent) {
      parent.querySelectorAll('.filter-pill').forEach((pill) => {
        pill.classList.remove('active');
      });
      clickedPill.classList.add('active');
    }
  };

  return (
    <div className="city-analysis-page detailed-page">
      <div className="top-bar">
        <div className="top-bar-left">
          <select className="filter-select">
            <option>Dubai</option>
            <option>Abu Dhabi</option>
            <option>Riyadh</option>
          </select>
          <select className="filter-select">
            <option>Last 30 days</option>
            <option>Last 90 days</option>
            <option>Last 12 months</option>
          </select>
        </div>
        <button className="export-btn">Export Report</button>
      </div>

      <div className="container">
        <div className="hero">
          <div className="hero-content">
            <h2>Dubai City Analytics</h2>
            <p>Live investment, pricing and yield intelligence powered by Rensight</p>
          </div>
          <div className="hero-metrics">
            <div className="metric-chip">
              <span className="label">Avg Yield</span>
              <span className="value">7.2%</span>
            </div>
            <div className="metric-chip">
              <span className="label">Top Area</span>
              <span className="value">Marina</span>
            </div>
            <div className="metric-chip">
              <span className="label">Best Budget</span>
              <span className="value">800K-1.5M</span>
            </div>
          </div>
        </div>

        <div className="executive-summary">
          <div className="section-header">
            <h3>Executive Summary</h3>
            <p>Click any card to jump to detailed analysis</p>
          </div>
          <div className="metrics-grid">
            <a href="#areas" className="summary-card" onClick={(e) => { e.preventDefault(); handleSectionClick('areas'); }}>
              <div className="icon">📍</div>
              <h4>Properties by Areas</h4>
              <div className="kpi">Marina 7.2%</div>
              <p className="insight">Comprehensive analysis of Dubai's key investment areas with performance metrics and growth trends</p>
            </a>

            <a href="#types" className="summary-card" onClick={(e) => { e.preventDefault(); handleSectionClick('types'); }}>
              <div className="icon">🏗️</div>
              <h4>Properties by Type</h4>
              <div className="kpi">Off-plan +0.8%</div>
              <p className="insight">Detailed comparison of off-plan versus ready properties examining ROI potential and appreciation rates</p>
            </a>

            <a href="#sizes" className="summary-card" onClick={(e) => { e.preventDefault(); handleSectionClick('sizes'); }}>
              <div className="icon">🏠</div>
              <h4>Properties by Size</h4>
              <div className="kpi">Studio 8.1%</div>
              <p className="insight">In-depth analysis of properties by bedroom count with demand patterns and yield comparisons</p>
            </a>

            <a href="#which-to-buy" className="summary-card" onClick={(e) => { e.preventDefault(); handleSectionClick('which-to-buy'); }}>
              <div className="icon">🎯</div>
              <h4>Which Property to Buy</h4>
              <div className="kpi">ROI +15%</div>
              <p className="insight">Strategic recommendations based on occupancy rates, proximity to metro, amenities, and key investment variables</p>
            </a>

            <a href="#profitability" className="summary-card" onClick={(e) => { e.preventDefault(); handleSectionClick('profitability'); }}>
              <div className="icon">💰</div>
              <h4>Profitability Assessment</h4>
              <div className="kpi">Yield 6.8%</div>
              <p className="insight">ROI calculator and profit projection models for different investment horizons and market scenarios</p>
            </a>

            <a href="#negotiation" className="summary-card" onClick={(e) => { e.preventDefault(); handleSectionClick('negotiation'); }}>
              <div className="icon">🤝</div>
              <h4>Price Negotiation</h4>
              <div className="kpi">-5% avg</div>
              <p className="insight">Real market value analysis and negotiation strategies to optimize purchase prices</p>
            </a>
          </div>
        </div>

        {/* Section 1: Properties by Areas */}
        <section id="areas" className="section-card">
          <div className="section-card-header">
            <h3>
              <svg width="24" height="24" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
              </svg>
              Dubai Properties Analysis by Areas
            </h3>
            <div className="section-filters">
              <div className="filter-pill active" onClick={handleFilterClick}>All Dubai</div>
              <div className="filter-pill" onClick={handleFilterClick}>Marina</div>
              <div className="filter-pill" onClick={handleFilterClick}>Downtown</div>
              <div className="filter-pill" onClick={handleFilterClick}>Business Bay</div>
            </div>
          </div>
          <div className="section-content">
            <div className="charts-area">
              <div className="chart-card">
                <div className="chart-header">
                  <h5>Area Performance Comparison</h5>
                  <p className="subtitle">Rental yield and price appreciation by district</p>
                </div>
                <div className="chart-body">
                  <iframe
                    title="Dubai properties analysis by areas"
                    width="100%"
                    height="600"
                    src="https://app.powerbi.com/view?r=eyJrIjoiYzgyNTIwZDYtZmY5Zi00NDExLWI3ZjQtZGMxM2I1ZGEyNjNjIiwidCI6ImRhODIxMGM4LWY5ZTQtNDBmYy1iZDI3LTZkM2U0ZjA0NmNjNyIsImMiOjl9"
                    frameBorder="0"
                    allowFullScreen={true}
                    style={{ border: 'none', borderRadius: '8px' }}
                  />
                </div>
              </div>
              <div className="chart-card">
                <div className="chart-header">
                  <h5>Growth Forecasts & Supply Analysis</h5>
                  <p className="subtitle">Projected growth and market supply by area</p>
                </div>
                <div className="chart-body">
                  Chart: Growth and supply trends
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Properties by Property Types */}
        <section id="types" className="section-card">
          <div className="section-card-header">
            <h3>
              <svg width="24" height="24" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
              </svg>
              Dubai Properties Analysis by Property Types
            </h3>
            <div className="section-filters">
              <div className="filter-pill active" onClick={handleFilterClick}>All Types</div>
              <div className="filter-pill" onClick={handleFilterClick}>Off-Plan</div>
              <div className="filter-pill" onClick={handleFilterClick}>Ready</div>
            </div>
          </div>
          <div className="section-content">
            <div className="charts-area">
              <div className="chart-card">
                <div className="chart-header">
                  <h5>Off-Plan vs Ready Properties ROI</h5>
                  <p className="subtitle">Return on investment comparison</p>
                </div>
                <div className="chart-body">
                  Chart: ROI comparison over 5 years
                </div>
              </div>
              <div className="chart-card">
                <div className="chart-header">
                  <h5>Rental Yield & Market Share</h5>
                  <p className="subtitle">Yield performance and market distribution</p>
                </div>
                <div className="chart-body">
                  Chart: Yield and market share
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Properties by Size */}
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

        {/* Section 4: Which Property to Buy */}
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

        {/* Section 5: Price Negotiation Intelligence */}
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

        {/* Section 6: Analysis by Budget */}
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
