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

  // Get most recent report
  const recentReport = useMemo(() => {
    if (!analysisRequests || analysisRequests.length === 0) return null;
    // Sort by createdAt (most recent first) and get the first one
    const sorted = [...analysisRequests].sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    });
    return sorted[0];
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
  const isReportLimitReached = reportCount && reportCount.remaining <= 0;

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
        ) : recentReport ? (
          <>
            <div className="report-item">
              <div className="report-header">
                <div className="report-title">Recent Report</div>
                <div className="report-status">
                  {recentReport.status === 'COMPLETED' ? 'Ready' : 
                   recentReport.status === 'PENDING' ? 'Processing' : 
                   recentReport.status || 'Processing'}
                </div>
              </div>
              <div className="report-desc">
                {formatPropertyDescription(recentReport)} - {formatDate(recentReport.createdAt)}
              </div>
              {recentReport.status === 'COMPLETED' && (
                <div className="report-stats">
                  {recentReport.locationScore && (
                    <div>📍 Location Score: {recentReport.locationScore}/10</div>
                  )}
                  {recentReport.fairValue && (
                    <div>💰 Fair Value: AED {parseFloat(recentReport.fairValue).toLocaleString()}</div>
                  )}
                  {recentReport.rentalYield && (
                    <div>📊 Rental Yield Potential: {recentReport.rentalYield}%</div>
                  )}
                </div>
              )}
            </div>

            {recentReport.status === 'COMPLETED' && (
              <button 
                className="btn"
                onClick={() => router.push(`/analysis-request?id=${recentReport.id}`)}
              >
                View Report
              </button>
            )}

            <div className="report-actions">
              <button 
                className="btn btn-outline"
                onClick={handleRequestNewReport}
                disabled={isReportLimitReached}
                style={isReportLimitReached ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
              >
                Request New Report
              </button>
              {analysisRequests.length > 1 && (
                <div className="report-note">
                  {analysisRequests.length} {analysisRequests.length === 1 ? 'report' : 'reports'} total
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
                className="btn btn-primary"
                onClick={handleRequestNewReport}
                disabled={isReportLimitReached}
                style={isReportLimitReached ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
              >
                Request Your First Report
              </button>
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
    </section>
  );
}
