"use client";

import { useState, useEffect, Suspense, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiClient } from "@/lib/api";
import { useUser } from "@/context/UserContext";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import "../dashboard/dashboard.css";
import "./account.css";

function AccountPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user: contextUser, subscription: contextSubscription, refreshUser, refreshSubscription, loading: contextLoading } = useUser();
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ firstName: "", lastName: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");
        
        const sessionId = searchParams?.get('session_id');
        if (sessionId) {
          try {
            const updatedSubscription = await apiClient.checkoutSuccess(sessionId);
            await refreshSubscription();
            await refreshUser();
            setSuccess("Payment processed successfully! Your subscription has been updated.");
            router.replace('/account', { scroll: false });
            setTimeout(() => setSuccess(""), 5000);
          } catch (err: any) {
            setError(err?.message || "Failed to process payment");
          }
        }

        // Get payment history
        try {
          const historyData = await apiClient.getPaymentHistory();
          setPaymentHistory(Array.isArray(historyData) ? historyData : []);
        } catch (err: any) {
          // If endpoint doesn't exist, use empty array
          setPaymentHistory([]);
        }
        
        if (contextUser) {
          setEditForm({
            firstName: contextUser.firstName || "",
            lastName: contextUser.lastName || "",
          });
        }
      } catch (error: any) {
        setError(error?.message || "Failed to load account data");
      } finally {
        setLoading(false);
      }
    };
    
    if (!contextLoading && contextUser) {
      loadData();
    }
  }, [router, searchParams, contextUser, contextLoading, refreshUser, refreshSubscription]);

  const handleEdit = () => {
    setIsEditing(true);
    setError("");
    setSuccess("");
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (contextUser) {
      setEditForm({
        firstName: contextUser.firstName || "",
        lastName: contextUser.lastName || "",
      });
    }
    setError("");
    setSuccess("");
  };

  const handleSave = async () => {
    if (!editForm.firstName.trim() && !editForm.lastName.trim()) {
      setError("Please enter at least a first name or last name");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");
    
    try {
      await apiClient.updateUserProfile({
        firstName: editForm.firstName.trim(),
        lastName: editForm.lastName.trim(),
      });
      await refreshUser();
      setIsEditing(false);
      setSuccess("Profile updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleUpgrade = async (planType: "PREMIUM" | "ENTERPRISE") => {
    try {
      setError("");
      const { url } = await apiClient.createCheckoutSession(planType);
      if (url) {
        window.location.href = url;
      } else {
        setError("Failed to create checkout session");
      }
    } catch (err: any) {
      setError(err?.message || "Failed to create checkout session");
    }
  };

  const handleRenew = async () => {
    if (!contextSubscription?.planType) {
      setError("Unable to determine current plan");
      return;
    }
    
    try {
      setError("");
      const planType = contextSubscription.planType === "PREMIUM" ? "PREMIUM" : "ENTERPRISE";
      const { url } = await apiClient.createCheckoutSession(planType);
      if (url) {
        window.location.href = url;
      } else {
        setError("Failed to create checkout session");
      }
    } catch (err: any) {
      setError(err?.message || "Failed to renew subscription");
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm("Are you sure you want to cancel your subscription? You'll lose access to premium features at the end of your billing period.")) {
      return;
    }
    
    try {
      setError("");
      await apiClient.cancelSubscription();
      await refreshSubscription();
      setSuccess("Subscription cancelled successfully");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err?.message || "Failed to cancel subscription");
    }
  };

  const handleDownloadInvoice = async (payment: any) => {
    try {
      // Generate invoice PDF on client side or fetch from backend
      const invoiceData = {
        invoiceNumber: payment.id || `INV-${Date.now()}`,
        date: payment.createdAt || new Date().toISOString(),
        planType: payment.planType || "FREE",
        status: payment.status || "ACTIVE",
        startDate: payment.startDate,
        endDate: payment.endDate,
        customer: {
          name: `${contextUser?.firstName || ""} ${contextUser?.lastName || ""}`.trim() || contextUser?.email,
          email: contextUser?.email,
          customerId: contextUser?.customerId,
        }
      };

      // Create a simple HTML invoice and convert to PDF
      const invoiceHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Invoice ${invoiceData.invoiceNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
            .header { border-bottom: 2px solid #f39c12; padding-bottom: 20px; margin-bottom: 30px; }
            .invoice-title { font-size: 2em; color: #333; margin: 0; }
            .invoice-number { color: #666; margin-top: 5px; }
            .section { margin: 30px 0; }
            .section-title { font-size: 1.2em; font-weight: bold; color: #333; margin-bottom: 10px; }
            .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
            .info-label { color: #666; }
            .info-value { color: #333; font-weight: 500; }
            .plan-badge { display: inline-block; padding: 5px 15px; border-radius: 5px; background: #f39c12; color: white; }
            .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 0.9em; text-align: center; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="invoice-title">Rensights</h1>
            <div class="invoice-number">Invoice #${invoiceData.invoiceNumber}</div>
          </div>
          
          <div class="section">
            <div class="section-title">Customer Information</div>
            <div class="info-row">
              <span class="info-label">Name:</span>
              <span class="info-value">${invoiceData.customer.name}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Email:</span>
              <span class="info-value">${invoiceData.customer.email}</span>
            </div>
            ${invoiceData.customer.customerId ? `
            <div class="info-row">
              <span class="info-label">Customer ID:</span>
              <span class="info-value">${invoiceData.customer.customerId}</span>
            </div>
            ` : ''}
          </div>

          <div class="section">
            <div class="section-title">Subscription Details</div>
            <div class="info-row">
              <span class="info-label">Plan:</span>
              <span class="info-value"><span class="plan-badge">${invoiceData.planType}</span></span>
            </div>
            <div class="info-row">
              <span class="info-label">Status:</span>
              <span class="info-value">${invoiceData.status}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Invoice Date:</span>
              <span class="info-value">${formatDate(invoiceData.date)}</span>
            </div>
            ${invoiceData.startDate ? `
            <div class="info-row">
              <span class="info-label">Start Date:</span>
              <span class="info-value">${formatDate(invoiceData.startDate)}</span>
            </div>
            ` : ''}
            ${invoiceData.endDate ? `
            <div class="info-row">
              <span class="info-label">End Date:</span>
              <span class="info-value">${formatDate(invoiceData.endDate)}</span>
            </div>
            ` : ''}
          </div>

          <div class="footer">
            <p>Thank you for choosing Rensights!</p>
            <p>This is a computer-generated invoice.</p>
          </div>
        </body>
        </html>
      `;

      // Open in new window for printing/downloading
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(invoiceHTML);
        printWindow.document.close();
        // Wait for content to load then trigger print
        setTimeout(() => {
          printWindow.print();
        }, 250);
      }
    } catch (err: any) {
      setError("Failed to generate invoice: " + (err?.message || "Unknown error"));
    }
  };

  const formatDate = (dateStr: string | undefined | null): string => {
    if (!dateStr || typeof dateStr !== 'string' || dateStr.trim() === "" || dateStr === "N/A") {
      return "N/A";
    }
    
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        return dateStr;
      }
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const getPlanColor = (planType?: string | null) => {
    if (!planType) return "free";
    switch (planType.toUpperCase()) {
      case "PREMIUM":
        return "premium";
      case "ENTERPRISE":
        return "enterprise";
      default:
        return "free";
    }
  };

  if (contextLoading || loading) {
    return <LoadingSpinner fullPage={false} message="Loading Account..." />;
  }

  if (!contextUser) {
    return (
      <div className="account-error">
        <div className="error-card">
          <div className="error-icon">⚠️</div>
          <h2>Unable to Load Account</h2>
          <p>Please try refreshing the page or contact support if the problem persists.</p>
        </div>
      </div>
    );
  }

  const user = contextUser;
  const subscription = contextSubscription;

  return (
    <div className="account-page">
      {/* Alert Messages */}
      {error && (
        <div className="alert alert-error" role="alert">
          <span className="alert-icon">⚠️</span>
          <span className="alert-message">{error}</span>
          <button className="alert-close" onClick={() => setError("")} aria-label="Close">×</button>
        </div>
      )}

      {success && (
        <div className="alert alert-success" role="alert">
          <span className="alert-icon">✓</span>
          <span className="alert-message">{success}</span>
          <button className="alert-close" onClick={() => setSuccess("")} aria-label="Close">×</button>
        </div>
      )}

      {/* Account Information */}
      <div className="account-card">
        <h2 className="card-title">Account Information</h2>
        {isEditing ? (
          <div className="edit-form">
            <div className="form-group">
              <label htmlFor="firstName">First Name</label>
              <input
                id="firstName"
                type="text"
                value={editForm.firstName}
                onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                placeholder="Enter your first name"
                disabled={saving}
              />
            </div>
            <div className="form-group">
              <label htmlFor="lastName">Last Name</label>
              <input
                id="lastName"
                type="text"
                value={editForm.lastName}
                onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                placeholder="Enter your last name"
                disabled={saving}
              />
            </div>
            <div className="form-actions">
              <button className="btn btn-secondary" onClick={handleCancel} disabled={saving}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        ) : (
          <div className="account-info">
            <div className="info-item">
              <span className="info-label">Full Name:</span>
              <span className="info-value">
                {user?.firstName || user?.lastName
                  ? `${user?.firstName || ""} ${user?.lastName || ""}`.trim()
                  : "Not set"}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Email:</span>
              <span className="info-value">{user?.email || "N/A"}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Customer ID:</span>
              <span className="info-value">{user?.customerId && user.customerId.trim() !== "" ? user.customerId : "N/A"}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Account Status:</span>
              <span className={`status-badge ${getPlanColor(user?.userTier)}`}>
                {user?.userTier || "FREE"}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Member Since:</span>
              <span className="info-value">{formatDate(user?.createdAt)}</span>
            </div>
            <button className="btn btn-edit" onClick={handleEdit}>
              Edit Profile
            </button>
          </div>
        )}
      </div>

      {/* Subscription Management */}
      <div className="account-card">
        <h2 className="card-title">Subscription Management</h2>
        <div className="subscription-info">
          <div className="info-item">
            <span className="info-label">Current Plan:</span>
            <span className={`status-badge ${getPlanColor(subscription?.planType)}`}>
              {subscription?.planType || "FREE"}
            </span>
          </div>
          {subscription?.status && (
            <div className="info-item">
              <span className="info-label">Status:</span>
              <span className={`status-badge ${(subscription.status || "ACTIVE").toLowerCase()}`}>
                {subscription.status || "ACTIVE"}
              </span>
            </div>
          )}
          {subscription?.startDate && (
            <div className="info-item">
              <span className="info-label">Start Date:</span>
              <span className="info-value">{formatDate(subscription.startDate)}</span>
            </div>
          )}
          {subscription?.endDate && (
            <div className="info-item">
              <span className="info-label">End Date:</span>
              <span className="info-value">{formatDate(subscription.endDate)}</span>
            </div>
          )}
        </div>

        <div className="subscription-actions">
          {!subscription || subscription?.planType === "FREE" ? (
            <div className="upgrade-options">
              <button className="btn btn-primary" onClick={() => handleUpgrade("PREMIUM")}>
                Upgrade to Premium
              </button>
              <button className="btn btn-primary" onClick={() => handleUpgrade("ENTERPRISE")}>
                Upgrade to Enterprise
              </button>
            </div>
          ) : (
            <div className="subscription-management">
              {subscription?.status === "ACTIVE" && (
                <>
                  <button className="btn btn-primary" onClick={handleRenew}>
                    Renew Subscription
                  </button>
                  <button className="btn btn-danger" onClick={handleCancelSubscription}>
                    Cancel Subscription
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Invoice History */}
      <div className="account-card">
        <h2 className="card-title">Invoice History</h2>
        {!paymentHistory || paymentHistory.length === 0 ? (
          <div className="empty-state">
            <p>No invoices found</p>
            <p className="empty-subtext">Your invoice history will appear here once you make a purchase</p>
          </div>
        ) : (
          <div className="invoice-list">
            {paymentHistory.map((payment: any, index: number) => (
              <div key={payment.id || index} className="invoice-item">
                <div className="invoice-header">
                  <div className="invoice-info">
                    <div className="invoice-plan">{payment.planType || "FREE"}</div>
                    <div className="invoice-date">{formatDate(payment.createdAt)}</div>
                    {payment.startDate && payment.endDate && (
                      <div className="invoice-period">
                        {formatDate(payment.startDate)} - {formatDate(payment.endDate)}
                      </div>
                    )}
                  </div>
                  <div className="invoice-actions">
                    <span className={`invoice-status ${(payment.status || "ACTIVE").toLowerCase()}`}>
                      {payment.status || "ACTIVE"}
                    </span>
                    <button 
                      className="btn btn-download"
                      onClick={() => handleDownloadInvoice(payment)}
                      title="Download Invoice"
                    >
                      📥 Download
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense fallback={<LoadingSpinner fullPage={true} message="Loading Account..." />}>
      <AccountPageContent />
    </Suspense>
  );
}
