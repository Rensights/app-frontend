"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiClient } from "@/lib/api";
import { useUser } from "@/context/UserContext";
import { useToast } from "@/components/ui/Toast";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
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
  const [handledCancel, setHandledCancel] = useState(false);
  const [openingPortal, setOpeningPortal] = useState(false);
  // Account deletion: the modal spells out the consequences, and the typed email is the guard
  // against a mis-click on something irreversible.
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmEmail, setDeleteConfirmEmail] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

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

        const canceled = searchParams?.get('canceled') === 'true';
        if (canceled && !handledCancel) {
          router.replace('/account', { scroll: false });
          setHandledCancel(true);
          await refreshSubscription();
          await refreshUser();
          toast.showError("Payment was canceled. Your plan remains unchanged.");
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
  }, [router, searchParams, contextUser, contextLoading, refreshUser, refreshSubscription, processedSessionId, handledCancel, toast]);

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

  const closeDeleteModal = () => {
    if (deleting) return;
    setShowDeleteModal(false);
    setDeleteConfirmEmail("");
    setDeleteError("");
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    setDeleteError("");
    try {
      await apiClient.deleteAccount(deleteConfirmEmail.trim());
      // The account is gone, so there is no session left to keep. Clear it and send them out
      // to the public site rather than back into an authenticated shell that will 401.
      await apiClient.logout().catch(() => undefined);
      window.location.href = "/";
    } catch (err: any) {
      setDeleteError(err?.message || "Could not delete your account. Please try again.");
      setDeleting(false);
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
              <button className="btn btn-primary btn-edit-profile" onClick={handleEdit}>
                Edit Profile
              </button>
              {canManageStripe && (
                <button
                  className="btn btn-outline btn-manage-subscription"
                  onClick={handleManageSubscription}
                  disabled={openingPortal}
                >
                  {openingPortal ? "Opening Portal..." : "Manage Subscription"}
                </button>
              )}
            </div>
            </div>
          )}
        </div>

      {/* Danger zone — separated from the rest of the page so it is never mistaken for a
          routine setting. */}
      <div className="account-card danger-zone">
        <h2 className="card-title">Delete Account</h2>
        <p className="danger-text">
          Permanently delete your Rensights account and personal data. This cannot be undone.
        </p>
        <button className="btn btn-danger" onClick={() => setShowDeleteModal(true)}>
          Delete Account
        </button>
      </div>

      {showDeleteModal && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="delete-title">
          <div className="modal-card">
            <h3 id="delete-title" className="modal-title">Delete your account?</h3>

            <p className="modal-text">Before you continue, please read what happens:</p>
            <ul className="modal-list">
              {canManageStripe && (
                <li>
                  <strong>Your subscription is cancelled immediately, and the remaining days of
                  your current paid period are not refunded.</strong>
                </li>
              )}
              <li>Your profile, saved reports, uploaded documents and activity are permanently deleted.</li>
              <li>You will be signed out and will not be able to sign back in.</li>
              <li>
                Past invoices are kept, without your personal details, because accounting records
                must be retained by law.
              </li>
            </ul>

            <label className="modal-label" htmlFor="deleteConfirmEmail">
              Type <strong>{user?.email}</strong> to confirm:
            </label>
            <input
              id="deleteConfirmEmail"
              type="email"
              className="modal-input"
              value={deleteConfirmEmail}
              onChange={(e) => setDeleteConfirmEmail(e.target.value)}
              placeholder={user?.email || "your email"}
              autoComplete="off"
              disabled={deleting}
            />

            {deleteError && <div className="modal-error">{deleteError}</div>}

            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={closeDeleteModal} disabled={deleting}>
                Keep my account
              </button>
              <button
                className="btn btn-danger"
                onClick={handleDeleteAccount}
                disabled={
                  deleting ||
                  deleteConfirmEmail.trim().toLowerCase() !== (user?.email || "").toLowerCase()
                }
              >
                {deleting ? "Deleting..." : "Delete permanently"}
              </button>
            </div>
          </div>
        </div>
      )}
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
