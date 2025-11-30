"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api";
import "../login.css";

export default function ForgotPasswordPage() {
  const router = useRouter();
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
    try {
      await apiClient.forgotPassword(email);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Failed to send reset code. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
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
              onClick={() => router.push("/reset-password")}
              className="submit-btn"
              style={{ marginTop: "20px" }}
            >
              Continue to Reset Password
            </button>
            <button
              type="button"
              onClick={() => router.push("/")}
              className="submit-btn"
              style={{ marginTop: "10px", backgroundColor: "#34495e" }}
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <h1>Forgot Password</h1>
          <p>Enter your email address and we'll send you a reset code</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              disabled={isSubmitting}
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button
            type="submit"
            className="submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Sending..." : "Send Reset Code"}
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

