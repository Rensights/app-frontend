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
              <button className="pdf-close" onClick={() => setPreviewOpen(false)}>
                ×
              </button>
            </div>
            <iframe src={`${previewPdf.url}#toolbar=1&navpanes=0`} title={previewPdf.title} />
          </div>
        </div>
      )}
    </div>
  );
}
