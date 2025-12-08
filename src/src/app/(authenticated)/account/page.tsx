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
        
        // Check if we have a session_id from Stripe checkout
        const sessionId = searchParams?.get('session_id');
        if (sessionId) {
          try {
            console.log("Processing checkout success with session_id:", sessionId);
            const updatedSubscription = await apiClient.checkoutSuccess(sessionId);
            console.log("Checkout success response:", updatedSubscription);
            await refreshSubscription();
            await refreshUser();
            setSuccess("Payment processed successfully! Your subscription has been updated.");
            router.replace('/account', { scroll: false });
          } catch (err: any) {
            console.error("Checkout success error:", err);
            setError(err?.message || "Failed to process payment");
          }
        }

        const historyData = await apiClient.getPaymentHistory().catch(() => []);
        setPaymentHistory(Array.isArray(historyData) ? historyData : []);
        
        if (contextUser) {
          setEditForm({
            firstName: contextUser.firstName || "",
            lastName: contextUser.lastName || "",
          });
        }
      } catch (error: any) {
        console.error("Error loading account data:", error);
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

  const getPlanIcon = (planType?: string | null) => {
    if (!planType) return "🆓";
    switch (planType.toUpperCase()) {
      case "PREMIUM":
        return "⭐";
      case "ENTERPRISE":
        return "💎";
      default:
        return "🆓";
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
      <div className="account-header">
        <h1 className="account-title">Account Settings</h1>
        <p className="account-subtitle">Manage your profile and subscription</p>
      </div>

      {error && (
        <div className="alert alert-error">
          <span className="alert-icon">⚠️</span>
          <span>{error}</span>
          <button className="alert-close" onClick={() => setError("")}>×</button>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <span className="alert-icon">✓</span>
          <span>{success}</span>
          <button className="alert-close" onClick={() => setSuccess("")}>×</button>
        </div>
      )}

      <div className="account-grid">
        {/* Profile Card */}
        <div className="account-card profile-card">
          <div className="card-header">
            <div>
              <h2 className="card-title">👤 Profile Information</h2>
              <p className="card-subtitle">Update your personal details</p>
            </div>
            {!isEditing && (
              <button className="btn btn-edit" onClick={handleEdit}>
                Edit Profile
              </button>
            )}
          </div>

          {isEditing ? (
            <div className="edit-form">
              <div className="form-group">
                <label htmlFor="firstName">First Name</label>
                <input
                  id="firstName"
                  type="text"
                  value={editForm.firstName}
                  onChange={(e) =>
                    setEditForm({ ...editForm, firstName: e.target.value })
                  }
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
                  onChange={(e) =>
                    setEditForm({ ...editForm, lastName: e.target.value })
                  }
                  placeholder="Enter your last name"
                  disabled={saving}
                />
              </div>
              <div className="form-actions">
                <button
                  className="btn btn-secondary"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          ) : (
            <div className="profile-details">
              <div className="detail-item">
                <span className="detail-label">Full Name</span>
                <span className="detail-value">
                  {user?.firstName || user?.lastName
                    ? `${user?.firstName || ""} ${user?.lastName || ""}`.trim()
                    : "Not set"}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Email Address</span>
                <span className="detail-value">{user?.email || "N/A"}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Customer ID</span>
                <span className="detail-value code">
                  {user?.customerId && user.customerId.trim() !== "" ? user.customerId : "N/A"}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Account Status</span>
                <span className={`status-badge ${getPlanColor(user?.userTier)}`}>
                  {user?.userTier || "FREE"}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Member Since</span>
                <span className="detail-value">{formatDate(user?.createdAt)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Subscription Card */}
        <div className="account-card subscription-card">
          <div className="card-header">
            <div>
              <h2 className="card-title">💳 Subscription Plan</h2>
              <p className="card-subtitle">Manage your subscription</p>
            </div>
          </div>

          <div className="subscription-content">
            <div className="plan-display">
              <div className={`plan-badge ${getPlanColor(subscription?.planType)}`}>
                <span className="plan-icon">{getPlanIcon(subscription?.planType)}</span>
                <div>
                  <div className="plan-name">{subscription?.planType || "FREE"} Plan</div>
                  <div className="plan-status">
                    Status: <span className={`status-badge ${(subscription?.status || "ACTIVE").toLowerCase()}`}>
                      {subscription?.status || "ACTIVE"}
                    </span>
                  </div>
                </div>
              </div>

              {subscription?.startDate && (
                <div className="plan-dates">
                  <div className="date-item">
                    <span className="date-label">Start Date</span>
                    <span className="date-value">{formatDate(subscription.startDate)}</span>
                  </div>
                  {subscription?.endDate && (
                    <div className="date-item">
                      <span className="date-label">End Date</span>
                      <span className="date-value">{formatDate(subscription.endDate)}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="subscription-actions">
              {!subscription || subscription?.planType === "FREE" ? (
                <div className="upgrade-section">
                  <p className="upgrade-text">Upgrade to unlock premium features</p>
                  <div className="upgrade-buttons">
                    <button
                      className="btn btn-primary btn-upgrade"
                      onClick={() => handleUpgrade("PREMIUM")}
                    >
                      ⭐ Upgrade to Premium
                    </button>
                    <button
                      className="btn btn-primary btn-upgrade"
                      onClick={() => handleUpgrade("ENTERPRISE")}
                    >
                      💎 Upgrade to Enterprise
                    </button>
                  </div>
                </div>
              ) : (
                <div className="subscription-management">
                  {subscription?.status === "ACTIVE" && (
                    <>
                      <button
                        className="btn btn-primary"
                        onClick={handleRenew}
                      >
                        🔄 Renew Subscription
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={handleCancelSubscription}
                      >
                        Cancel Subscription
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Payment History Card */}
        <div className="account-card payment-card">
          <div className="card-header">
            <div>
              <h2 className="card-title">📜 Payment History</h2>
              <p className="card-subtitle">View your transaction history</p>
            </div>
          </div>

          {!paymentHistory || paymentHistory.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <p className="empty-text">No payment history available</p>
              <p className="empty-subtext">Your payment history will appear here once you make a purchase</p>
            </div>
          ) : (
            <div className="payment-list">
              {paymentHistory.map((payment: any, index: number) => (
                <div key={payment.id || index} className="payment-item">
                  <div className="payment-header">
                    <div className="payment-info">
                      <span className="payment-icon">{getPlanIcon(payment.planType)}</span>
                      <div>
                        <div className="payment-plan">{payment.planType || "FREE"}</div>
                        <div className="payment-date">Created: {formatDate(payment.createdAt)}</div>
                      </div>
                    </div>
                    <span className={`payment-status ${(payment.status || "ACTIVE").toLowerCase()}`}>
                      {payment.status || "ACTIVE"}
                    </span>
                  </div>
                  {payment.startDate && (
                    <div className="payment-details">
                      <div className="payment-detail-item">
                        <span>Start:</span>
                        <span>{formatDate(payment.startDate)}</span>
                      </div>
                      {payment.endDate && (
                        <div className="payment-detail-item">
                          <span>End:</span>
                          <span>{formatDate(payment.endDate)}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
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
