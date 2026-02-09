"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { apiClient } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import "./dashboard.css";

export default function DashboardPage() {
  const router = useRouter();
  const { subscription, user } = useUser();
  const toast = useToast();
  const [analysisRequests, setAnalysisRequests] = useState<any[]>([]);
  const [loadingReports, setLoadingReports] = useState(true);
  const [reportCount, setReportCount] = useState<{ used: number; remaining: number; max: number } | null>(null);

  // Fetch user's analysis requests and report count
  useEffect(() => {
    const fetchReports = async () => {
      if (!user) return;
      
      try {
        setLoadingReports(true);
        const [requests, countInfo] = await Promise.all([
          apiClient.getMyAnalysisRequests(),
          apiClient.getReportCount()
        ]);
        setAnalysisRequests(Array.isArray(requests) ? requests : []);
        setReportCount(countInfo);
      } catch (error: any) {
        console.error("Error fetching analysis requests:", error);
        setAnalysisRequests([]);
        setReportCount(null);
      } finally {
        setLoadingReports(false);
      }
    };

    fetchReports();
  }, [user]);

  // Get sorted reports (most recent first)
  const sortedReports = useMemo(() => {
    if (!analysisRequests || analysisRequests.length === 0) return [];
    // Sort by createdAt (most recent first)
    return [...analysisRequests].sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    });
  }, [analysisRequests]);

  // Optimized: Memoize subscription badge style
  const subscriptionBadgeStyle = useMemo(() => {
    if (!subscription) return null;
    return {
      marginTop: '10px',
      display: 'inline-block',
      padding: '6px 12px',
      borderRadius: '8px',
      fontSize: '0.85rem',
      fontWeight: '500',
      background: subscription.planType === 'FREE' 
        ? 'rgba(108, 117, 125, 0.1)' 
        : subscription.planType === 'PREMIUM'
        ? 'rgba(243, 156, 18, 0.1)'
        : 'rgba(155, 89, 182, 0.1)',
      color: subscription.planType === 'FREE'
        ? '#6c757d'
        : subscription.planType === 'PREMIUM'
        ? '#f39c12'
        : '#9b59b6',
    };
  }, [subscription]);

  const formatDate = (dateStr: string | undefined | null): string => {
    if (!dateStr) return "N/A";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const formatPropertyDescription = (request: any): string => {
    const parts = [];
    if (request.bedrooms) parts.push(`${request.bedrooms}-bed`);
    if (request.propertyType) parts.push(request.propertyType.toLowerCase());
    if (request.area || request.buildingName) {
      parts.push(`in ${request.area || request.buildingName || 'Dubai'}`);
    }
    return parts.length > 0 ? parts.join(' ') : 'Property analysis request';
  };

  const handleRequestNewReport = () => {
    // Check if user has remaining reports
    if (reportCount && reportCount.remaining <= 0) {
      const maxReports = reportCount.max === Number.MAX_SAFE_INTEGER || reportCount.max === 2147483647 
        ? 'unlimited' 
        : reportCount.max;
      toast.showError(
        `You have reached your monthly report limit (${maxReports} report${reportCount.max !== 1 ? 's' : ''}). Please upgrade your account to get more reports.`
      );
      return;
    }
    // If user has remaining reports, navigate to analysis request page
    router.push("/analysis-request");
  };

  // Check if button should be disabled
  const isReportLimitReached = reportCount ? reportCount.remaining <= 0 : false;

  return (
    <section className="content-section active">
      <div className="section-card">
        <div className="section-title">
          Property Reports
          {reportCount && (
            <span className="report-count-badge">
              {reportCount.max === Number.MAX_SAFE_INTEGER || reportCount.max === 2147483647 
                ? 'Unlimited' 
                : `${reportCount.remaining} of ${reportCount.max} remaining`}
            </span>
          )}
        </div>

        {loadingReports ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
            Loading reports...
          </div>
        ) : sortedReports.length > 0 ? (
          <>
            <div style={{ marginBottom: '20px' }}>
              {sortedReports.map((report, index) => (
                <div key={report.id || index} className="report-item" style={{ marginBottom: index < sortedReports.length - 1 ? '20px' : '0' }}>
                  <div className="report-header">
                    <div className="report-title">
                      {index === 0 ? 'Recent Report' : `Report #${sortedReports.length - index}`}
                    </div>
                    <div className="report-status">
                      {report.status === 'COMPLETED' ? 'Ready' : 
                       report.status === 'PENDING' ? 'Processing' : 
                       report.status || 'Processing'}
                    </div>
                  </div>
                  <div className="report-desc">
                    {formatPropertyDescription(report)} - {formatDate(report.createdAt)}
                  </div>
                  {report.status === 'COMPLETED' && (
                    <div className="report-stats">
                      {report.locationScore && (
                        <div>📍 Location Score: {report.locationScore}/10</div>
                      )}
                      {report.fairValue && (
                        <div>💰 Fair Value: AED {parseFloat(report.fairValue).toLocaleString()}</div>
                      )}
                      {report.rentalYield && (
                        <div>📊 Rental Yield Potential: {report.rentalYield}%</div>
                      )}
                    </div>
                  )}
                  {report.status === 'COMPLETED' && (
                    <button 
                      className="btn"
                      style={{ marginTop: '12px' }}
                      onClick={() => router.push(`/analysis-request?id=${report.id}`)}
                    >
                      View Report
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="report-actions">
              <button 
                className="btn btn-outline"
                onClick={handleRequestNewReport}
                disabled={isReportLimitReached}
                style={isReportLimitReached ? { 
                  cursor: 'not-allowed',
                  color: '#f39c12',
                  borderColor: '#f39c12',
                  borderWidth: '2px',
                  borderStyle: 'solid'
                } : {
                  color: '#f39c12',
                  borderColor: '#f39c12',
                  borderWidth: '2px',
                  borderStyle: 'solid'
                }}
              >
                Request New Report
              </button>
              {isReportLimitReached && (
                <div style={{
                  marginTop: '12px',
                  padding: '12px 16px',
                  background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.05) 100%)',
                  border: '2px solid rgba(245, 158, 11, 0.3)',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <p style={{ 
                    margin: 0, 
                    color: '#d97706', 
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    marginBottom: '8px'
                  }}>
                    Upgrade to Standard Package to request more analysis
                  </p>
                  <button
                    onClick={() => router.push('/pricing')}
                    style={{
                      padding: '8px 16px',
                      background: 'linear-gradient(135deg, #f39c12, #e67e22)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '0.85rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(243, 156, 18, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    View Pricing
                  </button>
                </div>
              )}
              {sortedReports.length > 1 && !isReportLimitReached && (
                <div className="report-note">
                  {sortedReports.length} {sortedReports.length === 1 ? 'report' : 'reports'} total
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <p style={{ color: '#666', marginBottom: '20px' }}>
                You haven't submitted any property analysis requests yet.
              </p>
            </div>
            <div className="report-actions">
              <button 
                className="btn btn-outline"
                onClick={handleRequestNewReport}
                disabled={isReportLimitReached}
                style={isReportLimitReached ? { 
                  cursor: 'not-allowed',
                  color: '#f39c12',
                  borderColor: '#f39c12',
                  borderWidth: '2px',
                  borderStyle: 'solid'
                } : {
                  color: '#f39c12',
                  borderColor: '#f39c12',
                  borderWidth: '2px',
                  borderStyle: 'solid'
                }}
              >
                Request Your First Report
              </button>
              {isReportLimitReached && (
                <div style={{
                  marginTop: '12px',
                  padding: '12px 16px',
                  background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.05) 100%)',
                  border: '2px solid rgba(245, 158, 11, 0.3)',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <p style={{ 
                    margin: 0, 
                    color: '#d97706', 
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    marginBottom: '8px'
                  }}>
                    Upgrade to Standard Package to request more analysis
                  </p>
                  <button
                    onClick={() => router.push('/pricing')}
                    style={{
                      padding: '8px 16px',
                      background: 'linear-gradient(135deg, #f39c12, #e67e22)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '0.85rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(243, 156, 18, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    View Pricing
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <div className="section-card">
        <div className="section-title">What's Included</div>
        <p className="info-text">
          Our detailed property reports provide comprehensive analysis
          including:
        </p>
        <div className="report-includes">
          <div>✓ Location score and neighborhood analysis</div>
          <div>✓ Fair market value estimation in AED</div>
          <div>✓ Rental yield potential calculation</div>
          <div>✓ Comparable properties analysis</div>
          <div>✓ Price trend history</div>
          <div>✓ Investment recommendations</div>
        </div>
      </div>

      <div className="section-card">
        <div className="section-title">Dubai Market Insights</div>
        <div className="market-insights">
          <div>🚀 Dubai real estate up 12% YoY</div>
          <div>🗝️ New projects: Business Bay & Bluewaters</div>
          <div>💎 Luxury market: Strong investor demand</div>
          <div>🏙️ Dubai avg: AED 1,450/sq ft</div>
        </div>
      </div>

      <div className="section-card report-disclaimer">
        <div className="section-title">Disclaimer</div>
        <p>
          This report is generated for informational and educational purposes only. Rensights.com is a data analytics
          provider, not a licensed real estate brokerage, financial advisor, or legal consultant. The &quot;Estimated
          Price&quot; and &quot;Scores&quot; provided are based on automated algorithms and third-party data; they do not
          constitute a formal appraisal or a guarantee of profit. All investments carry risk. We strongly recommend
          consulting with a licensed professional before making any financial commitments.
        </p>
        <h4>Verification Note</h4>
        <p>
          We scan external websites for pricing anomalies. We do not verify the physical condition, legal title, or
          the authenticity of the listing. Users must perform their own due diligence (physical viewing and title deed
          verification) before transferring funds to any third party.
        </p>
        <h4>No Formal Appraisal</h4>
        <p>
          The property estimates and scores provided by this platform are generated via automated machine learning
          algorithms and do not constitute a formal, legal, or professional real estate appraisal. This platform does
          not account for the physical condition, interior upgrades, or latent defects of a property.
        </p>
        <h4>Data Sources</h4>
        <p>Dubai Land Department (DLD), Bayut, and various public records.</p>
      </div>
    </section>
  );
}
