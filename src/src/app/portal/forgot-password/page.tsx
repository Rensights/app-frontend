"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import "../../login.css";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Email is required");
      return;
    }

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);
    setError("");
    try {
      await apiClient.forgotPassword(email);
      setSuccess(true);
      toast.showSuccess("Password reset code sent to your email");
    } catch (err: any) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Forgot password error:", err);
      }
      // Handle 404 (email not found) specifically
      if (err?.status === 404 || err?.response?.status === 404) {
        const errorMessage = err?.message || err?.error || "No account found with this email address. Please check your email and try again.";
        toast.showError(errorMessage);
        setError(errorMessage);
      } else {
        const errorMessage = err?.message || err?.error || "Failed to send reset code. Please try again.";
        toast.showError(errorMessage);
        setError(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="login-page">
        <div className="login-container">
          <div className="login-box">
            <div className="login-header">
              <h1>Check Your Email</h1>
              <p>We've sent a password reset code to {email}</p>
            </div>
            <div className="success-message">
              <p>Please check your email and click the link to reset your password.</p>
              <button
                type="button"
                onClick={() => router.push("/portal/reset-password")}
                className="btn"
                style={{ marginTop: "20px" }}
              >
                Continue to Reset Password
              </button>
              <button
                type="button"
                onClick={() => router.push("/portal/login")}
                className="btn btn-secondary"
                style={{ marginTop: "10px" }}
              >
                Back to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-box">
          <div className="login-header">
            <h1>Forgot Password</h1>
            <p>Enter your email address and we'll send you a reset code</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                className={`form-input ${error ? "error" : ""}`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                disabled={isSubmitting}
                required
              />
              {error && (
                <div className="error-message show">
                  {error}
                </div>
              )}
            </div>

            <button
              type="submit"
              className="btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Sending..." : "Send Reset Code"}
            </button>
          </form>

          <div className="forgot-password">
            <div className="forgot-links">
              <a
                href="/portal/login"
                style={{ color: "#f39c12", textDecoration: "none" }}
              >
                Back to Login
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

