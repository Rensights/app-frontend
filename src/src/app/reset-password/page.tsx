"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiClient } from "@/lib/api";
import "../login.css";

const CODE_LENGTH = 6;

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
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
    if (!email) {
      setError("Email is required");
      return;
    }

    const code = codeDigits.join("");
    if (code.length !== CODE_LENGTH) {
      setCodeError("Please enter the complete 6-digit code");
      return;
    }

    setIsSubmitting(true);
    setCodeError("");
    try {
      await apiClient.verifyResetCode(email, code);
      setStep("password");
    } catch (err: any) {
      setCodeError(err.message || "Invalid or expired code. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!newPassword) {
      setError("Password is required");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    const code = codeDigits.join("");
    if (code.length !== CODE_LENGTH) {
      setError("Please enter the complete 6-digit code");
      return;
    }

    setIsSubmitting(true);
    try {
      await apiClient.resetPassword(email, code, newPassword);
      setStep("success");
    } catch (err: any) {
      setError(err.message || "Failed to reset password. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    if (!email) {
      setError("Email is required");
      return;
    }

    try {
      await apiClient.forgotPassword(email);
      setResendTimer(60);
      setCodeDigits(Array(CODE_LENGTH).fill(""));
      setCodeError("");
      setTimeout(() => codeRefs.current[0]?.focus(), 200);
    } catch (err: any) {
      setError(err.message || "Failed to resend code. Please try again.");
    }
  };

  if (step === "success") {
    return (
      <div className="login-container">
        <div className="login-box">
          <div className="login-header">
            <h1>Password Reset Successful</h1>
            <p>Your password has been reset successfully</p>
          </div>
          <div className="success-message">
            <p>You can now log in with your new password.</p>
            <button
              type="button"
              onClick={() => router.push("/")}
              className="submit-btn"
              style={{ marginTop: "20px" }}
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === "password") {
    return (
      <div className="login-container">
        <div className="login-box">
          <div className="login-header">
            <h1>Reset Password</h1>
            <p>Enter your new password</p>
          </div>

          <form onSubmit={handleResetPassword}>
            <div className="form-group">
              <label htmlFor="newPassword">New Password</label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (min 6 characters)"
                disabled={isSubmitting}
                required
                minLength={6}
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                disabled={isSubmitting}
                required
                minLength={6}
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button
              type="submit"
              className="submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Resetting..." : "Reset Password"}
            </button>
          </form>

          <div className="forgot-password">
            <div className="forgot-links">
              <a
                href="/"
                style={{ color: "#f39c12", textDecoration: "none" }}
              >
                Back to Login
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <h1>Reset Password</h1>
          <p>Enter the 6-digit code sent to your email</p>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleVerifyCode(); }}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              disabled={isSubmitting || !!searchParams?.get("email")}
              required
            />
          </div>

          <div className="form-group">
            <label>Verification Code</label>
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
                  className="code-input"
                  disabled={isSubmitting}
                />
              ))}
            </div>
            {codeError && <div className="error-message" style={{ marginTop: "10px" }}>{codeError}</div>}
          </div>

          {error && <div className="error-message">{error}</div>}

          <button
            type="submit"
            className="submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Verifying..." : "Verify Code"}
          </button>
        </form>

        <div className="resend-code">
          {resendTimer > 0 ? (
            <p>Resend code in {resendTimer}s</p>
          ) : (
            <button
              type="button"
              onClick={handleResendCode}
              className="resend-btn"
              disabled={isSubmitting}
            >
              Resend Code
            </button>
          )}
        </div>

        <div className="forgot-password">
          <div className="forgot-links">
            <a
              href="/forgot-password"
              style={{ color: "#f39c12", textDecoration: "none" }}
            >
              Request New Code
            </a>
            <a
              href="/"
              style={{ color: "#f39c12", textDecoration: "none" }}
            >
              Back to Login
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

