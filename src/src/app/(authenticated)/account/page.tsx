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

        const historyData = await apiClient.getPaymentHistory().catch(() => []);
        setPaymentHistory(Array.isArray(historyData) ? historyData : []);
        
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
      {/* Hero Header Section */}
      <div className="account-hero">
        <div className="hero-content">
          <div className="hero-avatar">
            <div className="avatar-circle">
              {(user?.firstName?.[0] || user?.email?.[0] || "U").toUpperCase()}
            </div>
            <div className="avatar-badge">
              {getPlanIcon(subscription?.planType)}
            </div>
          </div>
          <div className="hero-info">
            <h1 className="hero-title">
              {user?.firstName || user?.lastName
                ? `${user?.firstName || ""} ${user?.lastName || ""}`.trim()
                : "Welcome Back!"}
            </h1>
            <p className="hero-subtitle">{user?.email || ""}</p>
            <div className="hero-badges">
              <span className={`plan-badge-inline ${getPlanColor(subscription?.planType)}`}>
                {getPlanIcon(subscription?.planType)} {subscription?.planType || "FREE"} Plan
              </span>
              <span className={`status-badge-inline ${(subscription?.status || "ACTIVE").toLowerCase()}`}>
                {subscription?.status || "ACTIVE"}
              </span>
            </div>
          </div>
        </div>
      </div>

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

      {/* Main Content Grid */}
      <div className="account-grid">
        {/* Profile Card */}
        <div className="account-card profile-card">
          <div className="card-icon-header">
            <div className="card-icon">👤</div>
            <div className="card-header-content">
              <h2 className="card-title">Profile Information</h2>
              <p className="card-subtitle">Manage your personal details</p>
            </div>
            {!isEditing && (
              <button className="btn-icon" onClick={handleEdit} aria-label="Edit Profile">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </button>
            )}
          </div>

          {isEditing ? (
            <div className="edit-form">
              <div className="form-group">
                <label htmlFor="firstName">
                  <span className="label-icon">📝</span>
                  First Name
                </label>
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
                <label htmlFor="lastName">
                  <span className="label-icon">📝</span>
                  Last Name
                </label>
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
                  {saving ? (
                    <>
                      <span className="spinner-small"></span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <span>✓</span>
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="profile-details">
              <div className="detail-item">
                <div className="detail-icon">👤</div>
                <div className="detail-content">
                  <span className="detail-label">Full Name</span>
                  <span className="detail-value">
                    {user?.firstName || user?.lastName
                      ? `${user?.firstName || ""} ${user?.lastName || ""}`.trim()
                      : "Not set"}
                  </span>
                </div>
              </div>
              
              <div className="detail-item">
                <div className="detail-icon">✉️</div>
                <div className="detail-content">
                  <span className="detail-label">Email Address</span>
                  <span className="detail-value">{user?.email || "N/A"}</span>
                </div>
              </div>
              
              <div className="detail-item">
                <div className="detail-icon">🆔</div>
                <div className="detail-content">
                  <span className="detail-label">Customer ID</span>
                  <span className="detail-value code">{user?.customerId && user.customerId.trim() !== "" ? user.customerId : "N/A"}</span>
                </div>
              </div>
              
              <div className="detail-item">
                <div className="detail-icon">🎯</div>
                <div className="detail-content">
                  <span className="detail-label">Account Status</span>
                  <span className={`status-badge ${getPlanColor(user?.userTier)}`}>
                    {user?.userTier || "FREE"}
                  </span>
                </div>
              </div>
              
              <div className="detail-item">
                <div className="detail-icon">📅</div>
                <div className="detail-content">
                  <span className="detail-label">Member Since</span>
                  <span className="detail-value">{formatDate(user?.createdAt)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Subscription Card */}
        <div className="account-card subscription-card">
          <div className="card-icon-header">
            <div className="card-icon">💳</div>
            <div className="card-header-content">
              <h2 className="card-title">Subscription Plan</h2>
              <p className="card-subtitle">Manage your subscription</p>
            </div>
          </div>

          <div className="subscription-content">
            <div className={`plan-card ${getPlanColor(subscription?.planType)}`}>
              <div className="plan-header">
                <div className="plan-icon-large">{getPlanIcon(subscription?.planType)}</div>
                <div className="plan-info">
                  <div className="plan-name">{subscription?.planType || "FREE"} Plan</div>
                  <div className="plan-status-text">
                    Status: <span className={`status-badge ${(subscription?.status || "ACTIVE").toLowerCase()}`}>
                      {subscription?.status || "ACTIVE"}
                    </span>
                  </div>
                </div>
              </div>

              {subscription?.startDate && (
                <div className="plan-dates">
                  <div className="date-item">
                    <span className="date-icon">📆</span>
                    <div className="date-info">
                      <span className="date-label">Start Date</span>
                      <span className="date-value">{formatDate(subscription.startDate)}</span>
                    </div>
                  </div>
                  {subscription?.endDate && (
                    <div className="date-item">
                      <span className="date-icon">⏰</span>
                      <div className="date-info">
                        <span className="date-label">End Date</span>
                        <span className="date-value">{formatDate(subscription.endDate)}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="subscription-actions">
              {!subscription || subscription?.planType === "FREE" ? (
                <div className="upgrade-section">
                  <p className="upgrade-text">✨ Unlock Premium Features</p>
                  <div className="upgrade-buttons">
                    <button
                      className="btn btn-upgrade btn-premium"
                      onClick={() => handleUpgrade("PREMIUM")}
                    >
                      <span className="btn-icon">⭐</span>
                      <div>
                        <div className="btn-title">Premium Plan</div>
                        <div className="btn-subtitle">Advanced features</div>
                      </div>
                      <span className="btn-arrow">→</span>
                    </button>
                    <button
                      className="btn btn-upgrade btn-enterprise"
                      onClick={() => handleUpgrade("ENTERPRISE")}
                    >
                      <span className="btn-icon">💎</span>
                      <div>
                        <div className="btn-title">Enterprise Plan</div>
                        <div className="btn-subtitle">Full access</div>
                      </div>
                      <span className="btn-arrow">→</span>
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
                        <span>🔄</span>
                        Renew Subscription
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={handleCancelSubscription}
                      >
                        <span>🚫</span>
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
          <div className="card-icon-header">
            <div className="card-icon">📜</div>
            <div className="card-header-content">
              <h2 className="card-title">Payment History</h2>
              <p className="card-subtitle">View your transaction history</p>
            </div>
            {paymentHistory.length > 0 && (
              <div className="card-badge">{paymentHistory.length}</div>
            )}
          </div>

          {!paymentHistory || paymentHistory.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <p className="empty-text">No Payment History</p>
              <p className="empty-subtext">Your payment history will appear here once you make a purchase</p>
            </div>
          ) : (
            <div className="payment-list">
              {paymentHistory.map((payment: any, index: number) => (
                <div key={payment.id || index} className="payment-item">
                  <div className="payment-header">
                    <div className="payment-info">
                      <div className="payment-icon-large">{getPlanIcon(payment.planType)}</div>
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
                        <span className="detail-label-small">📅 Start:</span>
                        <span>{formatDate(payment.startDate)}</span>
                      </div>
                      {payment.endDate && (
                        <div className="payment-detail-item">
                          <span className="detail-label-small">⏰ End:</span>
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
