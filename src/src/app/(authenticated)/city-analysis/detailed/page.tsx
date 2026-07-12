"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { apiClient, ReportDocument, ReportSection } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";
import { useUser } from "@/context/UserContext";
import { useTranslations } from "@/hooks/useTranslations";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { PdfScrollViewer } from "@/components/PdfScrollViewer";
import "../city-analysis.css";
import "../pdf-preview-modal.css";

const TIER_RANK: Record<string, number> = { FREE: 0, PREMIUM: 1, ENTERPRISE: 2 };

export default function DetailedCityAnalysisPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const { user } = useUser();
  // Upgrade-shadow copy — editable in the admin panel → Translations (namespace
  // "cityAnalysis"); the values below are the built-in English fallbacks.
  const { t } = useTranslations("cityAnalysis", {
    "cityAnalysis.shadow.premiumTitle": "Premium report",
    "cityAnalysis.shadow.premiumBody":
      "Upgrade to unlock this section and download the full report.",
    "cityAnalysis.shadow.premiumButton": "Upgrade to unlock",
    "cityAnalysis.shadow.processing": "Processing…",
    "cityAnalysis.shadow.enterpriseTitle": "Enterprise report",
    "cityAnalysis.shadow.enterpriseBody":
      "Available on request — no payment required. Send us a request and our team will set you up.",
    "cityAnalysis.shadow.enterpriseButton": "Request access",
    "cityAnalysis.shadow.teaserTitle": "Premium analysis report",
    "cityAnalysis.shadow.teaserBody":
      "Full charts and downloadable PDF available with an upgrade.",
  });
  // A section is locked (shown behind the upgrade shadow) when its access tier is
  // above the caller's tier. Matches the backend, which returns higher-tier sections
  // as document-less stubs.
  const userTierRank = TIER_RANK[user?.userTier ?? "FREE"] ?? 0;
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [sections, setSections] = useState<ReportSection[]>([]);
  const [activeSection, setActiveSection] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewPdf, setPreviewPdf] = useState({ url: "", title: "" });
  const [previewObjectUrl, setPreviewObjectUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useMobilePdfViewer, setUseMobilePdfViewer] = useState(false);

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
            setActiveSection(`section-${section.id}`);
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

  const handleUpgrade = useCallback(async () => {
    setIsUpgrading(true);
    setError(null);
    try {
      const { url } = await apiClient.createCheckoutSession("PREMIUM", "upsell");
      if (url) {
        window.location.href = url;
      }
    } catch (err: any) {
      setError(err.message || "Failed to start upgrade. Please try again.");
    } finally {
      setIsUpgrading(false);
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

  const formatUpdatedAt = useCallback((value?: string) => {
    if (!value) return "N/A";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  }, []);

  const handlePreview = useCallback(
    async (doc: ReportDocument) => {
      setError(null);
      const url = resolveFileUrl(doc);
      if (!url) {
        setError("Preview unavailable.");
        return;
      }
      try {
        const response = await fetch(url, { credentials: "include" });
        if (!response.ok) {
          const message = await response.text().catch(() => "Preview failed");
          throw new Error(message || "Preview failed");
        }
        const blob = await response.blob();
        const objectUrl = window.URL.createObjectURL(blob);
        if (previewObjectUrl) {
          window.URL.revokeObjectURL(previewObjectUrl);
        }
        setPreviewObjectUrl(objectUrl);
        setPreviewPdf({ url: objectUrl, title: doc.title });
        setPreviewOpen(true);
      } catch (err: any) {
        setError(err.message || "Failed to preview PDF");
      }
    },
    [previewObjectUrl, resolveFileUrl]
  );

  const closePreview = useCallback(() => {
    setPreviewOpen(false);
    if (previewObjectUrl) {
      window.URL.revokeObjectURL(previewObjectUrl);
      setPreviewObjectUrl(null);
    }
  }, [previewObjectUrl]);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const update = () => setUseMobilePdfViewer(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!previewOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.classList.add("pdf-preview-open");
    document.body.style.overflow = "hidden";
    return () => {
      document.body.classList.remove("pdf-preview-open");
      document.body.style.overflow = previousOverflow;
    };
  }, [previewOpen]);

  useEffect(() => {
    return () => {
      document.body.classList.remove("pdf-preview-open");
      document.body.style.overflow = "";
    };
  }, []);

  const previewModal =
    previewOpen && previewPdf.url ? (
      <div
        className="pdf-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pdf-preview-title"
        onClick={closePreview}
      >
        <div
          className="pdf-modal-content"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="pdf-modal-header">
            <h3 id="pdf-preview-title">{previewPdf.title}</h3>
            <div className="pdf-modal-actions">
              <a
                className="pdf-open-external"
                href={previewPdf.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open in browser
              </a>
              <button
                type="button"
                className="pdf-close"
                onClick={closePreview}
                aria-label="Close preview"
              >
                ×
              </button>
            </div>
          </div>
          <div className="pdf-modal-body">
            {useMobilePdfViewer ? (
              <PdfScrollViewer url={previewPdf.url} title={previewPdf.title} />
            ) : (
              <iframe
                className="pdf-viewer-frame pdf-viewer-iframe"
                src={`${previewPdf.url}#toolbar=1&navpanes=0`}
                title={previewPdf.title}
              />
            )}
          </div>
        </div>
      </div>
    ) : null;

  // Enterprise sections stay fully hidden until the user is Enterprise (no shadow,
  // no nav entry). Premium sections remain visible but locked (shadow) for lower tiers.
  const canSeeEnterprise = userTierRank >= TIER_RANK.ENTERPRISE;
  const visibleSections = sections.filter(
    (section) => section.accessTier !== "ENTERPRISE" || canSeeEnterprise
  );

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
          {visibleSections.map((section) => {
            const locked = userTierRank < (TIER_RANK[section.accessTier] ?? 0);
            return (
              <button
                key={section.id}
                onClick={() => handleNavigate(`section-${section.id}`)}
                className={`documents-tab ${
                  activeSection === `section-${section.id}` ? "active" : ""
                }`}
              >
                {section.navTitle}
                {locked && <span className="nav-lock" aria-hidden="true"> 🔒</span>}
              </button>
            );
          })}
        </div>
      </nav>

      <div className="documents-container">
        {loading && (
          <div className="document-card">
            <LoadingSpinner message="Loading reports..." />
          </div>
        )}
        {!loading && error && (
          <div className="document-card">
            <p className="document-description">{error}</p>
          </div>
        )}
        {!loading && !error && visibleSections.length === 0 && (
          <div className="document-card">
            <p className="document-description">No reports are available yet.</p>
          </div>
        )}
        {visibleSections.map((section) => {
          const locked = userTierRank < (TIER_RANK[section.accessTier] ?? 0);
          // Enterprise is request-only (no payment) — send users to the request form.
          // (Enterprise sections are hidden for non-Enterprise users via visibleSections,
          // so this branch only guards the edge case of one slipping through.)
          const requiresEnterprise = section.accessTier === "ENTERPRISE";
          return (
          <section key={section.id} id={`section-${section.id}`} className="document-section">
            <div className="document-card">
              <h2>{section.title}</h2>
              {section.description && (
                <p className="document-description">{section.description}</p>
              )}
              <div className="document-files-wrap">
                {locked && (
                  <div className="section-upgrade-shadow">
                    <div className="upgrade-shadow-card">
                      <div className="upgrade-shadow-icon">🔒</div>
                      {requiresEnterprise ? (
                        <>
                          <h4>{t("cityAnalysis.shadow.enterpriseTitle")}</h4>
                          <p>{t("cityAnalysis.shadow.enterpriseBody")}</p>
                          <button
                            type="button"
                            className="upgrade-shadow-btn"
                            onClick={() => router.push("/portal/early-access")}
                          >
                            {t("cityAnalysis.shadow.enterpriseButton")}
                          </button>
                        </>
                      ) : (
                        <>
                          <h4>{t("cityAnalysis.shadow.premiumTitle")}</h4>
                          <p>{t("cityAnalysis.shadow.premiumBody")}</p>
                          <button
                            type="button"
                            className="upgrade-shadow-btn"
                            onClick={handleUpgrade}
                            disabled={isUpgrading}
                          >
                            {isUpgrading
                              ? t("cityAnalysis.shadow.processing")
                              : t("cityAnalysis.shadow.premiumButton")}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              <div
                className={`document-files${locked ? " document-files-locked" : ""}`}
                aria-hidden={locked || undefined}
              >
                {locked ? (
                  [0, 1].map((i) => (
                    <div key={`teaser-${i}`} className="document-file">
                      <div className="document-file-icon">📄</div>
                      <div className="document-file-body">
                        <div className="document-file-title">
                          <span>{t("cityAnalysis.shadow.teaserTitle")}</span>
                        </div>
                        <p className="document-file-subtitle">
                          {t("cityAnalysis.shadow.teaserBody")}
                        </p>
                        <div className="document-meta">
                          <span>PDF</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <>
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
                      <div className="document-meta">
                        <span>PDF</span>
                        <span className="dot">•</span>
                        <span>Last updated: {formatUpdatedAt(doc.updatedAt)}</span>
                      </div>
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
                  </>
                )}
              </div>
              </div>
            </div>
          </section>
          );
        })}
      </div>

      {typeof document !== "undefined" &&
        previewModal &&
        createPortal(previewModal, document.body)}
    </div>
  );
}
