"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import { useTranslations } from "@/hooks/useTranslations";
import "../../login.css";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const toast = useToast();
  const { t } = useTranslations("authForgot", {
    "authForgot.title": "Forgot Password",
    "authForgot.subtitle": "Enter your email address and we'll send you a reset code",
    "authForgot.emailLabel": "Email Address",
    "authForgot.emailPlaceholder": "Enter your email",
    "authForgot.submit": "Send Reset Code",
    "authForgot.sending": "Sending...",
    "authForgot.backToLogin": "Back to Login",
    "authForgot.successTitle": "Check Your Email",
    "authForgot.successSubtitle": "We've sent a password reset code to",
    "authForgot.successBody": "Please check your email and click the link to reset your password.",
    "authForgot.continueReset": "Continue to Reset Password",
    "authForgot.errorRequired": "Email is required",
    "authForgot.errorInvalid": "Please enter a valid email address",
    "authForgot.toastSent": "Password reset code sent to your email",
    "authForgot.errorNotFound": "No account found with this email address. Please check your email and try again.",
    "authForgot.errorFailed": "Failed to send reset code. Please try again.",
  });
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
      setError(t("authForgot.errorRequired"));
      return;
    }

    if (!isValidEmail(email)) {
      setError(t("authForgot.errorInvalid"));
      return;
    }

    setIsSubmitting(true);
    setError("");
    try {
      await apiClient.forgotPassword(email);
      setSuccess(true);
      toast.showSuccess(t("authForgot.toastSent"));
    } catch (err: any) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Forgot password error:", err);
      }
      // Handle 404 (email not found) specifically
      if (err?.status === 404 || err?.response?.status === 404) {
        const errorMessage = err?.message || err?.error || t("authForgot.errorNotFound");
        toast.showError(errorMessage);
        setError(errorMessage);
      } else {
        const errorMessage = err?.message || err?.error || t("authForgot.errorFailed");
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
              <h1>{t("authForgot.successTitle")}</h1>
              <p>{t("authForgot.successSubtitle")} {email}</p>
            </div>
            <div className="success-message">
              <p>{t("authForgot.successBody")}</p>
              <button
                type="button"
                onClick={() => router.push("/portal/reset-password")}
                className="btn"
                style={{ marginTop: "20px" }}
              >
                {t("authForgot.continueReset")}
              </button>
              <button
                type="button"
                onClick={() => router.push("/portal/login")}
                className="btn btn-secondary"
                style={{ marginTop: "10px" }}
              >
                {t("authForgot.backToLogin")}
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
            <h1>{t("authForgot.title")}</h1>
            <p>{t("authForgot.subtitle")}</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">
                {t("authForgot.emailLabel")}
              </label>
              <input
                type="email"
                id="email"
                className={`form-input ${error ? "error" : ""}`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("authForgot.emailPlaceholder")}
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
              {isSubmitting ? t("authForgot.sending") : t("authForgot.submit")}
            </button>
          </form>

          <div className="forgot-password">
            <div className="forgot-links">
              <a
                href="/portal/login"
                style={{ color: "#f39c12", textDecoration: "none" }}
              >
                {t("authForgot.backToLogin")}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
