"use client";

import { useState, useEffect, Suspense, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiClient } from "@/lib/api";
import { useUser } from "@/context/UserContext";
import { useToast } from "@/components/ui/Toast";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import "../dashboard/dashboard.css";
import "./account.css";

function AccountPageContent() {
  const router = useRouter();
  const toast = useToast();
  const searchParams = useSearchParams();
  const { user: contextUser, subscription: contextSubscription, refreshUser, refreshSubscription, loading: contextLoading } = useUser();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ firstName: "", lastName: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [invoicesPerPage] = useState(2);
  const [processedSessionId, setProcessedSessionId] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");
        
        const sessionId = searchParams?.get('session_id');
        // Only process if we have a session_id and haven't processed it yet
        if (sessionId && sessionId !== processedSessionId) {
          try {
            // Remove session_id from URL immediately to prevent duplicate processing
            router.replace('/account', { scroll: false });
            setProcessedSessionId(sessionId);
            
            const updatedSubscription = await apiClient.checkoutSuccess(sessionId);
            await refreshSubscription();
            await refreshUser();
            toast.showSuccess("Payment processed successfully! Your subscription has been updated.");
          } catch (err: any) {
            toast.showError(err?.message || "Failed to process payment");
            setProcessedSessionId(null); // Reset on error so user can retry
          }
        }

        // Get invoices
        try {
          const invoicesData = await apiClient.getInvoices();
          setInvoices(Array.isArray(invoicesData) ? invoicesData : []);
        } catch (err: any) {
          // If endpoint doesn't exist, try to sync invoices first
          try {
            await apiClient.syncInvoices();
            const invoicesData = await apiClient.getInvoices();
            setInvoices(Array.isArray(invoicesData) ? invoicesData : []);
          } catch (syncErr: any) {
            // If sync fails, use empty array
            setInvoices([]);
          }
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
  }, [router, searchParams, contextUser, contextLoading, refreshUser, refreshSubscription, processedSessionId]);

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
      const { url } = await apiClient.createCheckoutSession(planType);
      if (url) {
        window.location.href = url;
      } else {
        toast.showError("Failed to create checkout session");
      }
    } catch (err: any) {
      toast.showError(err?.message || "Failed to create checkout session");
    }
  };

  const handleRenew = async () => {
    if (!contextSubscription?.planType) {
      toast.showError("Unable to determine current plan");
      return;
    }
    
    try {
      const planType = contextSubscription.planType === "PREMIUM" ? "PREMIUM" : "ENTERPRISE";
      const { url } = await apiClient.createCheckoutSession(planType);
      if (url) {
        window.location.href = url;
      } else {
        toast.showError("Failed to create checkout session");
      }
    } catch (err: any) {
      toast.showError(err?.message || "Failed to renew subscription");
    }
  };

  const handleCancelSubscription = () => {
    setShowCancelConfirm(true);
  };

  const confirmCancelSubscription = async () => {
    setShowCancelConfirm(false);
    try {
      await apiClient.cancelSubscription();
      await refreshSubscription();
      await refreshUser();
      toast.showSuccess("Subscription cancelled successfully. Your access will continue until the end of your billing period.");
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to cancel subscription. Please try again or contact support.";
      toast.showError(errorMessage);
    }
  };

  const handleDownloadInvoice = async (invoice: any) => {
    try {
      // Use Stripe invoice PDF URL if available, otherwise open Stripe hosted invoice
      if (invoice.invoicePdf) {
        // Open Stripe PDF in new window
        window.open(invoice.invoicePdf, '_blank');
        return;
      }
      
      if (invoice.invoiceUrl) {
        // Open Stripe hosted invoice in new window
        window.open(invoice.invoiceUrl, '_blank');
        return;
      }
      
      // Fallback: Generate invoice HTML if Stripe URLs are not available
      const invoiceData = {
        invoiceNumber: invoice.invoiceNumber || invoice.id || `INV-${Date.now()}`,
        date: invoice.invoiceDate || invoice.createdAt || new Date().toISOString(),
        amount: invoice.amount || 0,
        currency: invoice.currency || "USD",
        status: invoice.status || "paid",
        description: invoice.description,
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
            <div class="section-title">Invoice Details</div>
            <div class="info-row">
              <span class="info-label">Amount:</span>
              <span class="info-value">${invoiceData.currency} ${invoiceData.amount.toFixed(2)}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Status:</span>
              <span class="info-value">${invoiceData.status.toUpperCase()}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Invoice Date:</span>
              <span class="info-value">${formatDate(invoiceData.date)}</span>
            </div>
            ${invoiceData.description ? `
            <div class="info-row">
              <span class="info-label">Description:</span>
              <span class="info-value">${invoiceData.description}</span>
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

      {/* Subscription Management and Invoice History - Side by Side */}
      <div className="account-row">
        {/* Subscription Management - Left */}
        <div className="account-card account-card-half">
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

          {subscription?.cancelAtPeriodEnd && subscription.status === "ACTIVE" && (
            <div className="warning-banner" style={{
              background: "#fff3cd",
              border: "1px solid #ffc107",
              borderRadius: "8px",
              padding: "1rem",
              marginBottom: "1rem",
              color: "#856404"
            }}>
              <strong>⚠️ Subscription Cancelled</strong>
              <p style={{ margin: "0.5rem 0 0 0", fontSize: "0.9rem" }}>
                Your subscription will remain active until {subscription.endDate ? formatDate(subscription.endDate) : "the end of your billing period"}. You will continue to have access to all features until then.
              </p>
            </div>
          )}

          <div className="subscription-actions">
            {!subscription || subscription?.planType === "FREE" ? (
              <div className="upgrade-options">
                <button className="btn btn-primary" onClick={() => handleUpgrade("PREMIUM")}>
                  Upgrade to Premium
                </button>
              </div>
            ) : (
              <div className="subscription-management">
                {subscription?.status === "ACTIVE" && !subscription?.cancelAtPeriodEnd && (
                  <button className="btn btn-danger" onClick={handleCancelSubscription}>
                    Cancel Subscription
                  </button>
                )}
                {subscription?.cancelAtPeriodEnd && (
                  <p style={{ color: "#666", fontSize: "0.9rem" }}>
                    Cancellation scheduled for end of billing period
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Invoice History - Right */}
        <div className="account-card account-card-half">
          <h2 className="card-title">Invoice History</h2>
          {!invoices || invoices.length === 0 ? (
            <div className="empty-state">
              <p>No invoices found</p>
              <p className="empty-subtext">Your invoice history will appear here once you make a purchase.</p>
            </div>
          ) : (
            <>
              {/* Invoice Summary */}
              <div className="invoice-summary">
                <span className="invoice-count">
                  {invoices.length} {invoices.length === 1 ? 'invoice' : 'invoices'} total
                </span>
              </div>

              {/* Invoice List */}
              <div className="invoice-list">
                {(() => {
                  // Sort invoices by date (most recent first)
                  const sortedInvoices = [...invoices].sort((a, b) => {
                    const dateA = new Date(a.invoiceDate || a.createdAt || 0).getTime();
                    const dateB = new Date(b.invoiceDate || b.createdAt || 0).getTime();
                    return dateB - dateA;
                  });

                  // Calculate pagination
                  const indexOfLastInvoice = currentPage * invoicesPerPage;
                  const indexOfFirstInvoice = indexOfLastInvoice - invoicesPerPage;
                  const currentInvoices = sortedInvoices.slice(indexOfFirstInvoice, indexOfLastInvoice);
                  const totalPages = Math.ceil(sortedInvoices.length / invoicesPerPage);

                  return (
                    <>
                      {currentInvoices.map((invoice: any, index: number) => (
                        <div key={invoice.id || index} className="invoice-item">
                          <div className="invoice-header">
                            <div className="invoice-info">
                              <div className="invoice-plan">
                                Invoice #{invoice.invoiceNumber || invoice.id}
                              </div>
                              <div className="invoice-date">
                                {formatDate(invoice.invoiceDate || invoice.createdAt)}
                                {invoice.amount && (
                                  <span className="invoice-amount">
                                    {invoice.currency || 'USD'} ${parseFloat(invoice.amount.toString()).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  </span>
                                )}
                              </div>
                              {invoice.description && (
                                <div className="invoice-period">
                                  {invoice.description}
                                </div>
                              )}
                            </div>
                            <div className="invoice-actions">
                              <span className={`invoice-status ${(invoice.status || "paid").toLowerCase()}`}>
                                {invoice.status || "paid"}
                              </span>
                              {invoice.invoicePdf ? (
                                <a 
                                  href={invoice.invoicePdf}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn btn-download"
                                  title="Download Receipt (Stripe Invoice PDF)"
                                  download
                                >
                                  📥 Download
                                </a>
                              ) : invoice.invoiceUrl ? (
                                <a 
                                  href={invoice.invoiceUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn btn-download"
                                  title="View Receipt"
                                >
                                  👁️ View
                                </a>
                              ) : (
                                <button 
                                  className="btn btn-download"
                                  onClick={() => handleDownloadInvoice(invoice)}
                                  title="Generate Receipt"
                                >
                                  📄 Generate
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Pagination */}
                      {totalPages > 1 && (
                        <div className="invoice-pagination">
                          <button
                            className="pagination-btn"
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            aria-label="Previous page"
                          >
                            ← Previous
                          </button>
                          <div className="pagination-info">
                            Page {currentPage} of {totalPages}
                          </div>
                          <button
                            className="pagination-btn"
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                            aria-label="Next page"
                          >
                            Next →
                          </button>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            </>
          )}
        </div>
      </div>
      <ConfirmDialog
        isOpen={showCancelConfirm}
        title="Cancel Subscription"
        message="Are you sure you want to cancel your subscription? You'll lose access to premium features at the end of your billing period."
        onConfirm={confirmCancelSubscription}
        onCancel={() => setShowCancelConfirm(false)}
        confirmText="Yes, Cancel"
        cancelText="Keep Subscription"
        confirmVariant="danger"
      />
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
