"use client";

import { useState, useEffect, useCallback } from "react";
import { apiClient, ReportDocument, ReportSection } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";
import "../../dashboard/dashboard.css";
import "../city-analysis.css";

export default function DetailedCityAnalysisPage() {
  const { language } = useLanguage();
  const [sections, setSections] = useState<ReportSection[]>([]);
  const [activeSection, setActiveSection] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewPdf, setPreviewPdf] = useState({ url: "", title: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const loadSections = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiClient.getReportSections(language);
        if (!isMounted) return;
        setSections(data || []);
        if (data && data.length > 0) {
          setActiveSection(`section-${data[0].id}`);
        }
      } catch (err: any) {
        if (!isMounted) return;
        setError(err.message || "Failed to load reports");
        setSections([]);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    loadSections();
    return () => {
      isMounted = false;
    };
  }, [language]);

  useEffect(() => {
    if (!sections.length) return;
    const handleScroll = () => {
      const sectionElements = sections.map((section) => ({
        id: `section-${section.id}`,
        element: document.getElementById(`section-${section.id}`),
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
  }, [sections]);

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

  const apiBaseUrl = apiClient.getBaseUrl();

  const resolveFileUrl = useCallback(
    (doc: ReportDocument) => {
      if (!doc.fileUrl) return "";
      if (doc.fileUrl.startsWith("http")) return doc.fileUrl;
      return `${apiBaseUrl}${doc.fileUrl}`;
    },
    [apiBaseUrl]
  );

  const handlePreview = useCallback((doc: ReportDocument) => {
    const url = resolveFileUrl(doc);
    setPreviewPdf({ url, title: doc.title });
    setPreviewOpen(true);
  }, [resolveFileUrl]);

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
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => handleNavigate(`section-${section.id}`)}
              className={`documents-tab ${
                activeSection === `section-${section.id}` ? "active" : ""
              }`}
            >
              {section.navTitle}
            </button>
          ))}
        </div>
      </nav>

      <div className="documents-container">
        {loading && (
          <div className="document-card">
            <p className="document-description">Loading reports...</p>
          </div>
        )}
        {!loading && error && (
          <div className="document-card">
            <p className="document-description">{error}</p>
          </div>
        )}
        {!loading && !error && sections.length === 0 && (
          <div className="document-card">
            <p className="document-description">No reports are available yet.</p>
          </div>
        )}
        {sections.map((section) => (
          <section key={section.id} id={`section-${section.id}`} className="document-section">
            <div className="document-card">
              <h2>{section.title}</h2>
              {section.description && (
                <p className="document-description">{section.description}</p>
              )}
              <div className="document-files">
                {(section.documents || []).length === 0 && (
                  <p className="document-description">No documents uploaded yet.</p>
                )}
                {(section.documents || []).map((doc) => (
                  <div key={doc.id} className="document-file">
                    <div className="document-file-icon">📄</div>
                    <div className="document-file-body">
                      <div className="document-file-title">
                        <span>{doc.title}</span>
                      </div>
                      {doc.description && (
                        <p className="document-file-subtitle">{doc.description}</p>
                      )}
                    </div>
                    <div className="document-actions">
                      <button
                        type="button"
                        className="doc-btn doc-btn-primary"
                        onClick={() => handlePreview(doc)}
                      >
                        Preview PDF
                      </button>
                      <a
                        className="doc-btn doc-btn-outline"
                        href={resolveFileUrl(doc)}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                      >
                        Download PDF
                      </a>
                    </div>
                  </div>
                ))}
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
