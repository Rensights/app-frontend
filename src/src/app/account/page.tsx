"use client";

import { useState, useEffect, Suspense, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiClient } from "@/lib/api";
import "../dashboard/dashboard.css";
import "./account.css";

const MENU_ITEMS = [
  { id: "analysis", label: "City Analysis", icon: "📊", path: "/city-analysis" },
  { id: "reports", label: "Property Reports", icon: "📋", path: "/dashboard" },
  { id: "alerts", label: "Weekly Deals", icon: "🚨", path: "/deals" },
  { id: "account", label: "Account", icon: "⚙️", path: "/account" },
];

function AccountPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ firstName: "", lastName: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Check if we have a session_id from Stripe checkout
        const sessionId = searchParams.get('session_id');
        if (sessionId) {
          try {
            console.log("Processing checkout success with session_id:", sessionId);
            // Process checkout success
            const updatedSubscription = await apiClient.checkoutSuccess(sessionId);
            console.log("Checkout success response:", updatedSubscription);
            setSubscription(updatedSubscription);
            // Reload user data to get updated tier
            const updatedUser = await apiClient.getCurrentUser();
            setUser(updatedUser);
            // Remove session_id from URL
            router.replace('/account', { scroll: false });
          } catch (err: any) {
            console.error("Checkout success error:", err);
            setError(err.message || "Failed to process payment");
          }
        }

        const [userData, subscriptionData, historyData] = await Promise.all([
          apiClient.getCurrentUser(),
          apiClient.getCurrentSubscription().catch(() => null),
          apiClient.getPaymentHistory().catch(() => []),
        ]);
        console.log("Loaded user data:", userData);
        console.log("User customerId:", userData?.customerId);
        console.log("User createdAt:", userData?.createdAt);
        console.log("Loaded subscription data:", subscriptionData);
        console.log("Loaded payment history:", historyData);
        setUser(userData);
        if (!sessionId) {
          setSubscription(subscriptionData);
        }
        setPaymentHistory(historyData);
        setEditForm({
          firstName: userData.firstName || "",
          lastName: userData.lastName || "",
        });
      } catch (error) {
        router.push("/");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [router, searchParams]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditForm({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
    });
    setError("");
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const updatedUser = await apiClient.updateUserProfile({
        firstName: editForm.firstName,
        lastName: editForm.lastName,
      });
      setUser(updatedUser);
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleUpgrade = async (planType: "PREMIUM" | "ENTERPRISE") => {
    try {
      const { url } = await apiClient.createCheckoutSession(planType);
      window.location.href = url;
    } catch (err: any) {
      setError(err.message || "Failed to create checkout session");
    }
  };

  const handleRenew = async () => {
    try {
      const { url } = await apiClient.createCheckoutSession(
        subscription?.planType === "PREMIUM" ? "PREMIUM" : "ENTERPRISE"
      );
      window.location.href = url;
    } catch (err: any) {
      setError(err.message || "Failed to renew subscription");
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm("Are you sure you want to cancel your subscription?")) {
      return;
    }
    try {
      await apiClient.cancelSubscription();
      // Reload subscription data
      const subscriptionData = await apiClient.getCurrentSubscription().catch(() => null);
      setSubscription(subscriptionData);
    } catch (err: any) {
      setError(err.message || "Failed to cancel subscription");
    }
  };

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr || dateStr.trim() === "" || dateStr === "N/A") return "N/A";
    try {
      // Handle ISO format dates (e.g., "2025-11-23T14:32:18")
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        return "N/A";
      }
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  const handleSectionChange = useCallback((item: typeof MENU_ITEMS[0]) => {
    router.push(item.path);
    setIsSidebarOpen(false);
  }, [router]);

  const handleLogout = useCallback(() => {
    apiClient.logout();
  }, []);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  const closeSidebar = useCallback(() => {
    setIsSidebarOpen(false);
  }, []);

  if (loading) {
    return (
      <div className="dashboard-page account-page">
        <aside className="sidebar">
          <div className="logo-section">
            <div className="logo">Rensights</div>
            <div className="logo-subtitle">Dubai Property Intelligence</div>
          </div>
        </aside>
        <main className="main-content">
          <div style={{ padding: "2rem", textAlign: "center" }}>Loading...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-page account-page">
      <aside className={`sidebar ${isSidebarOpen ? "open" : ""}`}>
        <div className="logo-section">
          <div className="logo">Rensights</div>
          <div className="logo-subtitle">Dubai Property Intelligence</div>
          <button
            className="sidebar-close"
            type="button"
            aria-label="Close navigation"
            onClick={closeSidebar}
          >
            ×
          </button>
        </div>

        <nav className="menu">
          {MENU_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-current={item.id === "account" ? "page" : undefined}
              className={`menu-item ${
                item.id === "account" ? "active" : ""
              }`}
              onClick={() => handleSectionChange(item)}
            >
              <span className="menu-icon" aria-hidden>
                {item.icon}
              </span>
              <span className="menu-text">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="logout-section">
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </aside>

      <div
        className={`sidebar-overlay ${isSidebarOpen ? "open" : ""}`}
        onClick={closeSidebar}
      />

      <main className="main-content">
        <button
          className="menu-toggle"
          type="button"
          aria-label="Toggle navigation"
          onClick={toggleSidebar}
        >
          <span />
          <span />
          <span />
        </button>

        <div className="account-container">
          <div className="account-header">
            <h1 className="account-title">Account Settings</h1>
          </div>

        {error && (
          <div className="error-message" style={{
            background: 'rgba(231, 76, 60, 0.1)',
            color: '#e74c3c',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '20px',
          }}>
            {error}
          </div>
        )}

        <div className="account-sections">
          {/* User Profile Section */}
          <div className="account-card">
            <div className="card-header">
              <h2 className="card-title">Profile Information</h2>
              {!isEditing && (
                <button className="edit-btn" onClick={handleEdit}>
                  Edit
                </button>
              )}
            </div>

            {isEditing ? (
              <div className="edit-form">
                <div className="form-group">
                  <label>First Name</label>
                  <input
                    type="text"
                    value={editForm.firstName}
                    onChange={(e) =>
                      setEditForm({ ...editForm, firstName: e.target.value })
                    }
                    placeholder="First Name"
                  />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input
                    type="text"
                    value={editForm.lastName}
                    onChange={(e) =>
                      setEditForm({ ...editForm, lastName: e.target.value })
                    }
                    placeholder="Last Name"
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
                    {saving ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="profile-info">
                <div className="info-row">
                  <span className="info-label">Name:</span>
                  <span className="info-value">
                    {user?.firstName || user?.lastName
                      ? `${user?.firstName || ""} ${user?.lastName || ""}`.trim()
                      : "Not set"}
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">Email:</span>
                  <span className="info-value">{user?.email}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Customer ID:</span>
                  <span className="info-value">
                    {user?.customerId && user.customerId.trim() !== "" ? user.customerId : "N/A"}
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">User Status:</span>
                  <span className="info-value">
                    <span
                      className={`status-badge ${
                        user?.userTier?.toLowerCase() || "free"
                      }`}
                    >
                      {user?.userTier || "FREE"}
                    </span>
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">Member Since:</span>
                  <span className="info-value">
                    {formatDate(user?.createdAt)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Subscription Section */}
          <div className="account-card">
            <div className="card-header">
              <h2 className="card-title">Subscription</h2>
            </div>

            <div className="subscription-info">
              <div className="subscription-plan">
                <div className="plan-badge-large">
                  {subscription?.planType === "FREE" && "🆓"}
                  {subscription?.planType === "PREMIUM" && "⭐"}
                  {subscription?.planType === "ENTERPRISE" && "💎"}
                  <span className="plan-name">
                    {subscription?.planType || "FREE"} Plan
                  </span>
                </div>
                <div className="plan-status">
                  Status:{" "}
                  <span
                    className={`status-badge ${
                      subscription?.status?.toLowerCase() || "active"
                    }`}
                  >
                    {subscription?.status || "ACTIVE"}
                  </span>
                </div>
                {subscription?.startDate && (
                  <div className="plan-dates">
                    <div>Start Date: {formatDate(subscription.startDate)}</div>
                    {subscription?.endDate && (
                      <div>End Date: {formatDate(subscription.endDate)}</div>
                    )}
                  </div>
                )}
              </div>

              <div className="subscription-actions">
                {subscription?.planType === "FREE" ? (
                  <div className="upgrade-options">
                    <button
                      className="btn btn-primary"
                      onClick={() => handleUpgrade("PREMIUM")}
                    >
                      Upgrade to Premium
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={() => handleUpgrade("ENTERPRISE")}
                    >
                      Upgrade to Enterprise
                    </button>
                  </div>
                ) : (
                  <div className="subscription-management">
                    {subscription?.status === "ACTIVE" && (
                      <button
                        className="btn btn-primary"
                        onClick={handleRenew}
                      >
                        Renew Subscription
                      </button>
                    )}
                    {subscription?.status === "ACTIVE" && (
                      <button
                        className="btn btn-danger"
                        onClick={handleCancelSubscription}
                      >
                        Cancel Subscription
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Payment History Section */}
          <div className="account-card">
            <div className="card-header">
              <h2 className="card-title">Payment History</h2>
            </div>

            {paymentHistory.length === 0 ? (
              <div className="empty-state">
                <p>No payment history available.</p>
              </div>
            ) : (
              <div className="payment-history">
                {paymentHistory.map((payment) => (
                  <div key={payment.id} className="payment-item">
                    <div className="payment-header">
                      <div className="payment-plan">
                        {payment.planType === "PREMIUM" && "⭐"}
                        {payment.planType === "ENTERPRISE" && "💎"}
                        {payment.planType || "FREE"}
                      </div>
                      <div
                        className={`payment-status ${payment.status?.toLowerCase()}`}
                      >
                        {payment.status}
                      </div>
                    </div>
                    <div className="payment-details">
                      <div>
                        <strong>Start:</strong> {formatDate(payment.startDate)}
                      </div>
                      {payment.endDate && (
                        <div>
                          <strong>End:</strong> {formatDate(payment.endDate)}
                        </div>
                      )}
                      <div>
                        <strong>Created:</strong> {formatDate(payment.createdAt)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense fallback={<div className="account-page"><div style={{ padding: "2rem", textAlign: "center" }}>Loading...</div></div>}>
      <AccountPageContent />
    </Suspense>
  );
}

