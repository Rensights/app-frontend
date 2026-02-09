"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiClient } from "@/lib/api";
import { useUser } from "@/context/UserContext";
import { useToast } from "@/components/ui/Toast";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import "../dashboard/dashboard.css";
import "./account.css";

function AccountPageContent() {
  const router = useRouter();
  const toast = useToast();
  const searchParams = useSearchParams();
  const { user: contextUser, subscription: contextSubscription, refreshUser, refreshSubscription, loading: contextLoading } = useUser();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ firstName: "", lastName: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [processedSessionId, setProcessedSessionId] = useState<string | null>(null);
  const [openingPortal, setOpeningPortal] = useState(false);

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
            
            await apiClient.checkoutSuccess(sessionId);
            await refreshSubscription();
            await refreshUser();
            toast.showSuccess("Payment processed successfully! Your subscription has been updated.");
          } catch (err: any) {
            toast.showError(err?.message || "Failed to process payment");
            setProcessedSessionId(null); // Reset on error so user can retry
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

  const handleManageSubscription = async () => {
    try {
      setOpeningPortal(true);
      const { url } = await apiClient.createPortalSession();
      if (url) {
        window.location.href = url;
      } else {
        toast.showError("Failed to open Stripe portal");
      }
    } catch (err: any) {
      toast.showError(err?.message || "Failed to open Stripe portal");
    } finally {
      setOpeningPortal(false);
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
  const canManageStripe = Boolean(contextSubscription?.planType && contextSubscription.planType !== "FREE");

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
            <div className="form-actions">
              <button className="btn btn-edit" onClick={handleEdit}>
                Edit Profile
              </button>
              {canManageStripe && (
                <button
                  className="btn btn-secondary"
                  onClick={handleManageSubscription}
                  disabled={openingPortal}
                >
                  {openingPortal ? "Opening Stripe..." : "Manage in Stripe"}
                </button>
              )}
            </div>
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
