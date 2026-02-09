"use client";

import React, { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiClient } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import { useTranslations } from "@/hooks/useTranslations";
import "../../login.css";

const CODE_LENGTH = 6;

function ResetPasswordPageContent() {
  const router = useRouter();
  const toast = useToast();
  const searchParams = useSearchParams();
  const { t } = useTranslations("authReset", {
    "authReset.emailRequired": "Email is required",
    "authReset.codeRequired": "Please enter the complete 6-digit code",
    "authReset.codeVerified": "Code verified successfully",
    "authReset.invalidCode": "Invalid or expired code. Please try again.",
    "authReset.passwordRequired": "Password is required",
    "authReset.passwordLength": "Password must be at least 8 characters long",
    "authReset.passwordMissing": "Password must include: {missing}",
    "authReset.passwordComplex": "Password must contain: uppercase letter, lowercase letter, number, and special character (@$!%*?&)",
    "authReset.passwordMismatch": "Passwords do not match",
    "authReset.resetSuccess": "Password reset successfully!",
    "authReset.rateLimit": "Too many password reset requests. Please wait a minute and try again.",
    "authReset.resetFailed": "Failed to reset password. Please try again.",
    "authReset.resendSuccess": "Reset code sent to your email",
    "authReset.resendFailed": "Failed to resend code. Please try again.",
    "authReset.successTitle": "Password Reset Successful",
    "authReset.successSubtitle": "Your password has been updated. You can now log in with your new password.",
    "authReset.backToLogin": "Back to Login",
    "authReset.title": "Reset Your Password",
    "authReset.subtitle": "Enter the 6-digit code sent to your email",
    "authReset.passwordSubtitle": "Enter your new password",
    "authReset.emailLabel": "Email Address",
    "authReset.emailPlaceholder": "Enter your email",
    "authReset.codeLabel": "Verification Code",
    "authReset.verifyButton": "Verify Code",
    "authReset.verifying": "Verifying...",
    "authReset.newPassword": "New Password",
    "authReset.confirmPassword": "Confirm New Password",
    "authReset.passwordPlaceholder": "Create a strong password",
    "authReset.confirmPlaceholder": "Re-enter new password",
    "authReset.resetButton": "Reset Password",
    "authReset.resetting": "Resetting...",
    "authReset.resendPrompt": "Didn't receive the code?",
    "authReset.resendButton": "Resend Code",
    "authReset.resendCountdown": "Resend available in",
    "authReset.loading": "Loading...",
  });
  const [email, setEmail] = useState("");
  const [codeDigits, setCodeDigits] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [codeError, setCodeError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<"code" | "password" | "success">("code");
  const [resendTimer, setResendTimer] = useState(0);
  const codeRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Get email from query params if available
    const emailParam = searchParams?.get("email");
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!resendTimer) return;
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  useEffect(() => {
    if (step === "code") {
      setTimeout(() => codeRefs.current[0]?.focus(), 200);
    }
  }, [step]);

  const handleCodeChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newDigits = [...codeDigits];
    newDigits[index] = value.slice(-1);
    setCodeDigits(newDigits);
    setCodeError("");

    // Auto-focus next input
    if (value && index < CODE_LENGTH - 1) {
      codeRefs.current[index + 1]?.focus();
    }
  };

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !codeDigits[index] && index > 0) {
      codeRefs.current[index - 1]?.focus();
    }
  };

  const handleCodePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, CODE_LENGTH);
    if (!/^\d+$/.test(pastedData)) return;

    const newDigits = pastedData.split("").concat(Array(CODE_LENGTH - pastedData.length).fill(""));
    setCodeDigits(newDigits);
    setCodeError("");

    // Focus the next empty input or the last one
    const nextIndex = Math.min(pastedData.length, CODE_LENGTH - 1);
    codeRefs.current[nextIndex]?.focus();
  };

  const handleVerifyCode = async () => {
    setError("");
    setCodeError("");
    
    if (!email) {
      toast.showError(t("authReset.emailRequired"));
      return;
    }

    const code = codeDigits.join("");
    if (code.length !== CODE_LENGTH) {
      toast.showError(t("authReset.codeRequired"));
      return;
    }

    setIsSubmitting(true);
    try {
      await apiClient.verifyResetCode(email, code);
      setStep("password");
      toast.showSuccess(t("authReset.codeVerified"));
    } catch (err: any) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Verify reset code error:", err);
      }
      const errorMessage = err?.message || err?.error || t("authReset.invalidCode");
      toast.showError(errorMessage);
      setCodeError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!newPassword) {
      toast.showError(t("authReset.passwordRequired"));
      return;
    }

    // SECURITY: Enforce strong password requirements to match backend
    const backendPasswordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    
    if (newPassword.length < 8) {
      toast.showError(t("authReset.passwordLength"));
      return;
    }
    
    if (!backendPasswordPattern.test(newPassword)) {
      const missing = [];
      if (!/[a-z]/.test(newPassword)) missing.push("lowercase letter (a-z)");
      if (!/[A-Z]/.test(newPassword)) missing.push("uppercase letter (A-Z)");
      if (!/\d/.test(newPassword)) missing.push("number (0-9)");
      if (!/[@$!%*?&]/.test(newPassword)) missing.push("special character (@$!%*?&)");
      
      if (missing.length > 0) {
        toast.showError(t("authReset.passwordMissing").replace("{missing}", missing.join(", ")));
        return;
      }
      toast.showError(t("authReset.passwordComplex"));
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.showError(t("authReset.passwordMismatch"));
      return;
    }

    const code = codeDigits.join("");
    if (code.length !== CODE_LENGTH) {
      toast.showError(t("authReset.codeRequired"));
      return;
    }

    setIsSubmitting(true);
    try {
      await apiClient.resetPassword(email, code, newPassword);
      setStep("success");
      toast.showSuccess(t("authReset.resetSuccess"));
    } catch (err: any) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Reset password error:", err);
      }
      // Handle rate limiting errors (429)
      if (err?.status === 429 || err?.response?.status === 429) {
        const rateLimitMessage = err?.message || err?.error || t("authReset.rateLimit");
        toast.showError(rateLimitMessage, 8000); // Show longer for rate limit errors
        setError(rateLimitMessage);
        return;
      }
      // Handle validation errors from backend
      let errorMessage = t("authReset.resetFailed");
      if (err?.fieldErrors) {
        // Extract field-specific errors (e.g., newPassword validation)
        const fieldErrors = err.fieldErrors;
        if (fieldErrors.newPassword) {
          errorMessage = fieldErrors.newPassword;
        } else if (fieldErrors.code) {
          errorMessage = fieldErrors.code;
        } else if (fieldErrors.email) {
          errorMessage = fieldErrors.email;
        } else {
          // Combine all field errors
          errorMessage = Object.values(fieldErrors).join(". ");
        }
      } else if (err?.message) {
        errorMessage = err.message;
      } else if (err?.error) {
        errorMessage = err.error;
      }
      toast.showError(errorMessage);
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    setError("");
    setCodeError("");
    
    if (!email) {
      toast.showError(t("authReset.emailRequired"));
      return;
    }

    try {
      await apiClient.forgotPassword(email);
      setResendTimer(60);
      setCodeError("");
      // Clear the code input fields when resending
      setCodeDigits(Array(CODE_LENGTH).fill(""));
      toast.showSuccess(t("authReset.resendSuccess"));
      // Focus the first input field
      setTimeout(() => codeRefs.current[0]?.focus(), 100);
    } catch (err: any) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Resend code error:", err);
      }
      const errorMessage = err?.message || err?.error || t("authReset.resendFailed");
      toast.showError(errorMessage);
      setError(errorMessage);
    }
  };

  if (step === "success") {
    return (
      <div className="login-page">
        <div className="login-container">
          <div className="login-box">
            <div className="login-header">
              <h1>{t("authReset.successTitle")}</h1>
              <p>{t("authReset.resetSuccess")}</p>
            </div>
            <div className="success-message">
              <p>{t("authReset.successSubtitle")}</p>
              <button
                type="button"
                onClick={() => router.push("/portal/login")}
                className="btn"
                style={{ marginTop: "20px" }}
              >
                {t("authReset.backToLogin")}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === "password") {
    return (
      <div className="login-page">
        <div className="login-container">
          <div className="login-box">
            <div className="login-header">
              <h1>{t("authReset.title")}</h1>
              <p>{t("authReset.passwordSubtitle")}</p>
            </div>

            <form onSubmit={handleResetPassword}>
              <div className="form-group">
                <label className="form-label" htmlFor="newPassword">
                  {t("authReset.newPassword")}
                </label>
                <input
                  type="password"
                  id="newPassword"
                  className={`form-input ${error && !newPassword ? "error" : ""}`}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={t("authReset.passwordPlaceholder")}
                  disabled={isSubmitting}
                  required
                  minLength={6}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="confirmPassword">
                  {t("authReset.confirmPassword")}
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  className={`form-input ${error && newPassword !== confirmPassword ? "error" : ""}`}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t("authReset.confirmPlaceholder")}
                  disabled={isSubmitting}
                  required
                  minLength={6}
                />
              </div>

              {error && (
                <div className="error-message show">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? t("authReset.resetting") : t("authReset.resetButton")}
              </button>
            </form>

            <div className="forgot-password">
              <div className="forgot-links">
                <a
                  href="/portal/login"
                  style={{ color: "#f39c12", textDecoration: "none" }}
                >
                  {t("authReset.backToLogin")}
                </a>
              </div>
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
          <h1>{t("authReset.title")}</h1>
          <p>{t("authReset.subtitle")}</p>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleVerifyCode(); }}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              {t("authReset.emailLabel")}
            </label>
            <input
              type="email"
              id="email"
              className={`form-input ${error && !email ? "error" : ""}`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("authReset.emailPlaceholder") || "Enter your email"}
              disabled={isSubmitting || !!searchParams?.get("email")}
              required
            />
            {error && !codeError && (
              <div className="error-message show">
                {error}
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">{t("authReset.codeLabel")}</label>
            <div className="code-input-container">
              {codeDigits.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { codeRefs.current[index] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleCodeChange(index, e.target.value)}
                  onKeyDown={(e) => handleCodeKeyDown(index, e)}
                  onPaste={index === 0 ? handleCodePaste : undefined}
                  className={`code-input ${codeError ? "error" : ""}`}
                  disabled={isSubmitting}
                />
              ))}
            </div>
            {codeError && (
              <div className="error-message show" style={{ marginTop: "10px" }}>
                {codeError}
              </div>
            )}
          </div>

          <button
            type="submit"
            className="btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? t("authReset.verifying") : t("authReset.verifyButton")}
          </button>
        </form>

        <div className="resend-code">
          {resendTimer > 0 ? (
            <p>{t("authReset.resendCountdown")} {resendTimer}s</p>
          ) : (
            <button
              type="button"
              onClick={handleResendCode}
              className="resend-btn"
              disabled={isSubmitting}
            >
              {t("authReset.resendButton")}
            </button>
          )}
        </div>

        <div className="forgot-password">
          <div className="forgot-links">
            <a
              href="/portal/forgot-password"
              style={{ color: "#f39c12", textDecoration: "none" }}
            >
              {t("authReset.resendButton")}
            </a>
            <a
              href="/portal/login"
              style={{ color: "#f39c12", textDecoration: "none" }}
            >
              {t("authReset.backToLogin")}
            </a>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="login-page">
        <div className="login-container">
          <div className="login-box">
            <div className="login-header">
              <h1>{t("authReset.loading") || "Loading..."}</h1>
            </div>
          </div>
        </div>
      </div>
    }>
      <ResetPasswordPageContent />
    </Suspense>
  );
}
