"use client";

import React, { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiClient } from "@/lib/api";
import "./signup.css";

type Plan = "free" | "premium";

type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  budget: string;
  portfolio: string;
  goals: string[];
  plan: Plan;
};

type FormErrors = {
  [K in keyof FormState]?: string;
};

const initialFormState: FormState = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  budget: "",
  portfolio: "",
  goals: [],
  plan: "free",
};

const goalOptions = [
  { value: "rental-income", label: "Rental Income" },
  { value: "capital-appreciation", label: "Capital Appreciation" },
  { value: "portfolio-diversification", label: "Portfolio Diversification" },
  { value: "lifestyle-residence", label: "Lifestyle/Residence Investment" },
];

type Step = "form" | "verification" | "payment";

const CODE_LENGTH = 6;

function SignUpPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<Step>("form");
  const [formState, setFormState] = useState<FormState>(initialFormState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>("");
  const [verificationEmail, setVerificationEmail] = useState<string>("");
  const [codeDigits, setCodeDigits] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const [codeError, setCodeError] = useState<string>("");
  const [resendTimer, setResendTimer] = useState(0);
  const codeRefs = React.useRef<(HTMLInputElement | null)[]>([]);

  // Check if user canceled Stripe checkout
  useEffect(() => {
    if (searchParams?.get('canceled') === 'true') {
      setSubmitError("Payment was canceled. You can try again or continue with a free plan.");
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

  const handleChange = (field: keyof FormState, value: string | string[]) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const toggleGoal = (value: string) => {
    handleChange(
      "goals",
      formState.goals.includes(value)
        ? formState.goals.filter((goal) => goal !== value)
        : [...formState.goals, value]
    );
  };

  const handlePlanSelect = (plan: Plan) => {
    handleChange("plan", plan);
    setErrors((prev) => ({ ...prev, plan: "" }));
  };

  const validateForm = () => {
    const nextErrors: FormErrors = {};

    if (!formState.firstName.trim()) nextErrors.firstName = "Required";
    if (!formState.lastName.trim()) nextErrors.lastName = "Required";
    if (!isValidEmail(formState.email))
      nextErrors.email = "Valid email required";
    if (!formState.phone.trim()) nextErrors.phone = "Required";
    // SECURITY FIX: Enforce strong password requirements to match backend
    if (formState.password.length < 8) {
      nextErrors.password = "Min. 8 characters";
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(formState.password)) {
      nextErrors.password = "Must contain uppercase, lowercase, number, and special character";
    }
    if (formState.password !== formState.confirmPassword)
      nextErrors.confirmPassword = "Passwords must match";
    if (!formState.budget) nextErrors.budget = "Required";
    if (formState.goals.length === 0)
      nextErrors.goals = "Select at least one goal";
    if (!formState.portfolio) nextErrors.portfolio = "Required";
    if (!formState.plan) nextErrors.plan = "Please select a plan";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitError("");

    try {
      // Get device fingerprint
      const deviceFingerprint = apiClient.getDeviceFingerprint();
      
      // Register user - may return token directly if verification is disabled
      const registerResponse = await apiClient.register({
        email: formState.email,
        password: formState.password,
        firstName: formState.firstName,
        lastName: formState.lastName,
        deviceFingerprint: deviceFingerprint,
      });

      // Check if token is returned (email verification disabled)
      if ('token' in registerResponse && registerResponse.token) {
        console.log("Email verification disabled - token received, redirecting to dashboard");
        // Token received - save it and redirect
        apiClient.setToken(registerResponse.token);
        
        // If premium plan, redirect to Stripe Checkout
        if (formState.plan === "premium") {
          try {
            const checkoutResponse = await apiClient.createCheckoutSession("PREMIUM");
            if (checkoutResponse.url) {
              window.location.href = checkoutResponse.url;
              return;
            }
          } catch (error: any) {
            console.error("Failed to create checkout session:", error);
            setSubmitError(error.message || "Failed to start payment. Please try again.");
            setIsSubmitting(false);
            return;
          }
        }
        
        // Redirect to dashboard for free plan
        router.push("/dashboard");
        return;
      }

      // Email verification required - show verification step
      setVerificationEmail(formState.email);
      setStep("verification");
      setResendTimer(60);
      setCodeDigits(Array(CODE_LENGTH).fill(""));
      setCodeError("");
      setIsSubmitting(false);
      setTimeout(() => codeRefs.current[0]?.focus(), 200);
    } catch (error: any) {
      setSubmitError(error.message || "Registration failed. Please try again.");
      setIsSubmitting(false);
    }
  };

  const handleVerifyEmail = async () => {
    const code = codeDigits.join("");
    if (code.length !== CODE_LENGTH) {
      setCodeError("Please enter the complete verification code");
      return;
    }

    setIsSubmitting(true);
    setCodeError("");

    try {
      // Get device fingerprint
      const deviceFingerprint = apiClient.getDeviceFingerprint();
      
      // Verify email and get token (device will be registered)
      const authResponse = await apiClient.verifyEmail(verificationEmail, code, deviceFingerprint);
      
      console.log("Email verified successfully. Plan:", formState.plan);
      console.log("Auth response:", authResponse);
      console.log("Current step before check:", step);

      // IMPORTANT: Check plan BEFORE any redirect
      // If a paid plan is selected, redirect to Stripe Checkout
      if (formState.plan === "premium") {
        console.log("✅ Premium plan detected! Redirecting to Stripe Checkout");
        setIsSubmitting(true);
        try {
          const checkoutResponse = await apiClient.createCheckoutSession("PREMIUM");
          if (checkoutResponse.url) {
            window.location.href = checkoutResponse.url;
            return;
          }
        } catch (error: any) {
          console.error("Failed to create checkout session:", error);
          setCodeError(error.message || "Failed to start payment. Please try again.");
          setIsSubmitting(false);
          return;
        }
      }

      // Redirect to dashboard for free plan
      console.log("Free plan selected, redirecting to dashboard");
      router.push("/dashboard");
    } catch (error: any) {
      setCodeError(error.message || "Invalid verification code. Please try again.");
      setIsSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    if (resendTimer) return;
    
    setIsSubmitting(true);
    try {
      await apiClient.resendVerificationCode(verificationEmail);
      setResendTimer(60);
      setCodeError("");
    } catch (error: any) {
      setCodeError("Failed to resend code: " + (error.message || "Unknown error"));
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleCodeKeyDown = (event: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (event.key === "Backspace" && !codeDigits[index] && index > 0) {
      codeRefs.current[index - 1]?.focus();
    }
  };

  const handleCodeChange = (value: string, index: number) => {
    if (!/^\d?$/.test(value)) return;
    const nextDigits = [...codeDigits];
    nextDigits[index] = value;
    setCodeDigits(nextDigits);
    setCodeError(""); // Clear error when user types
    if (value && index < CODE_LENGTH - 1) {
      codeRefs.current[index + 1]?.focus();
    }
  };

  const maskEmail = (email: string) => {
    const [username, domain] = email.split("@");
    if (!username || !domain) return email;
    const masked = username[0] + "*".repeat(Math.max(0, username.length - 2)) + 
                   (username.length > 1 ? username.slice(-1) : "");
    return `${masked}@${domain}`;
  };

  if (step === "verification") {
    return (
      <div className="signup-page">
        <div className="signup-container">
          <div className="signup-card">
            <div className="logo">Rensights</div>
            <div className="tagline">Property Intelligence Platform</div>

            <div className="form-step active">
              <div className="step-title">Verify Your Email</div>
              <div className="step-description">
                We&apos;ve sent a verification code to your email address
              </div>

              <div className="device-info">
                <div className="device-info-title">📧 Email Verification</div>
                <div className="device-info-text">
                  Please check your email and enter the 6-digit code sent to <strong>{maskEmail(verificationEmail)}</strong>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Verification Code</label>
                <div className="verification-code">
                  {codeDigits.map((digit, index) => (
                    <input
                      key={index}
                      type="text"
                      className={`code-input ${codeError ? "error" : ""}`}
                      maxLength={1}
                      value={digit}
                      onChange={(event) => handleCodeChange(event.target.value, index)}
                      onKeyDown={(event) => handleCodeKeyDown(event, index)}
                      ref={(ref) => { codeRefs.current[index] = ref; }}
                    />
                  ))}
                </div>
                {codeError && (
                  <div className="error-message show" style={{ marginTop: '0.5rem' }}>
                    {codeError}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handleVerifyEmail}
                className="btn"
                disabled={isSubmitting || codeDigits.join("").length !== CODE_LENGTH}
                style={{ width: '100%' }}
              >
                {isSubmitting ? (
                  <>
                    <span className="loading" />
                    Verifying...
                  </>
                ) : (
                  "Verify & Continue"
                )}
              </button>

              <div className="resend-section">
                <div className="resend-text">Didn&apos;t receive the code?</div>
                <button
                  type="button"
                  className={`resend-link ${resendTimer ? "disabled" : ""}`}
                  onClick={handleResendCode}
                  disabled={!!resendTimer || isSubmitting}
                >
                  Resend Code
                </button>
                {resendTimer > 0 && (
                  <div className="countdown">
                    Resend available in <span>{resendTimer}</span>s
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  setStep("form");
                  setCodeDigits(Array(CODE_LENGTH).fill(""));
                  setCodeError("");
                  setResendTimer(0);
                }}
                className="btn btn-secondary"
                style={{ width: '100%', marginTop: '1rem' }}
              >
                ← Back to Registration
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="signup-page">
      <div className="signup-container">
        <div className="signup-card">
          <div className="logo">Rensights</div>
          <div className="tagline">Property Intelligence Platform</div>

          <form className="signup-form" onSubmit={handleSubmit}>
            <SectionTitle>Account Information</SectionTitle>

            <div className="form-row">
              <Field
                id="firstName"
                label="First Name"
                placeholder="John"
                value={formState.firstName}
                onChange={(value) => handleChange("firstName", value)}
                error={errors.firstName}
              />
              <Field
                id="lastName"
                label="Last Name"
                placeholder="Doe"
                value={formState.lastName}
                onChange={(value) => handleChange("lastName", value)}
                error={errors.lastName}
              />
            </div>

            <div className="form-row">
              <Field
                id="email"
                label="Email"
                type="email"
                placeholder="your.email@example.com"
                value={formState.email}
                onChange={(value) => handleChange("email", value)}
                error={errors.email}
              />
              <Field
                id="phone"
                label="Phone"
                placeholder="+1 (555) 000-0000"
                value={formState.phone}
                onChange={(value) => handleChange("phone", value)}
                error={errors.phone}
              />
            </div>

            <div className="form-row">
              <Field
                id="password"
                label="Password"
                type="password"
                placeholder="Min. 8 characters"
                value={formState.password}
                onChange={(value) => handleChange("password", value)}
                error={errors.password}
              />
              <Field
                id="confirmPassword"
                label="Confirm Password"
                type="password"
                placeholder="Re-enter password"
                value={formState.confirmPassword}
                onChange={(value) => handleChange("confirmPassword", value)}
                error={errors.confirmPassword}
              />
            </div>

            <SectionTitle>Your Profile</SectionTitle>

            <SelectField
              id="budget"
              label="Investment Budget Range"
              value={formState.budget}
              onChange={(value) => handleChange("budget", value)}
              options={[
                { value: "", label: "Select budget range" },
                { value: "under-100k", label: "Under $100,000" },
                { value: "100k-250k", label: "$100,000 - $250,000" },
                { value: "250k-500k", label: "$250,000 - $500,000" },
                { value: "500k-1m", label: "$500,000 - $1M" },
                { value: "1m-5m", label: "$1M - $5M" },
                { value: "above-5m", label: "Above $5M" },
              ]}
              error={errors.budget}
            />

            <div className="form-group">
              <label className="form-label">Primary Investment Goals</label>
              <div className="goals-grid">
                {goalOptions.map((goal) => (
                  <label key={goal.value} className="goal-option">
                    <input
                      type="checkbox"
                      checked={formState.goals.includes(goal.value)}
                      onChange={() => toggleGoal(goal.value)}
                    />
                    <span>{goal.label}</span>
                  </label>
                ))}
              </div>
              {errors.goals && (
                <div className="error-message show">{errors.goals}</div>
              )}
            </div>

            <SelectField
              id="portfolio"
              label="Current Investment Portfolio"
              value={formState.portfolio}
              onChange={(value) => handleChange("portfolio", value)}
              options={[
                { value: "", label: "Select portfolio size" },
                { value: "below-5", label: "Below 5 properties" },
                { value: "5-10", label: "5-10 properties" },
                { value: "above-10", label: "Above 10 properties" },
              ]}
              error={errors.portfolio}
            />

            <SectionTitle>Choose Your Plan</SectionTitle>

            <div className="plans-grid two-cols">
              <PlanCard
                title="Free"
                price="$0"
                cadence="/mo"
                features={["1 report per month", "City analysis"]}
                selected={formState.plan === "free"}
                onSelect={() => handlePlanSelect("free")}
              />
              <PlanCard
                title="Standard Premium Package"
                price="$20"
                cadence="/mo"
                features={[
                  "5 reports per month",
                  "City analysis",
                  "Weekly insights with potentially underpriced deals",
                ]}
                selected={formState.plan === "premium"}
                onSelect={() => handlePlanSelect("premium")}
              />
            </div>
            {errors.plan && (
              <div className="error-message show plan-error">{errors.plan}</div>
            )}

            {submitError && (
              <div className="error-message show" style={{ marginBottom: "1rem" }}>
                {submitError}
              </div>
            )}

            <button type="submit" className="btn" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <span className="loading" />
                  Creating Account...
                </>
              ) : (
                "Start Your Free Trial"
              )}
            </button>
          </form>

          <div className="back-to-login">
            <a
              href="/"
              onClick={(event) => {
                event.preventDefault();
                window.location.href = "/";
              }}
            >
              Already have an account? Sign In
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="signup-page"><div className="signup-container"><div className="signup-card">Loading...</div></div></div>}>
      <SignUpPageContent />
    </Suspense>
  );
}

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <div className="section-title">{children}</div>
);

type FieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  error?: string;
};

const Field = ({
  id,
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  error,
}: FieldProps) => (
  <div className="form-group">
    <label className="form-label" htmlFor={id}>
      {label}
    </label>
    <input
      id={id}
      type={type}
      className={`form-input ${error ? "error" : ""}`}
      value={value}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
      required
    />
    {error && <div className="error-message show">{error}</div>}
  </div>
);

type SelectFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  error?: string;
};

const SelectField = ({
  id,
  label,
  value,
  onChange,
  options,
  error,
}: SelectFieldProps) => (
  <div className="form-group">
    <label className="form-label" htmlFor={id}>
      {label}
    </label>
    <select
      id={id}
      className={`form-select ${error ? "error" : ""}`}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      required
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
    {error && <div className="error-message show">{error}</div>}
  </div>
);

type PlanCardProps = {
  title: string;
  price: string;
  cadence: string;
  features: string[];
  selected: boolean;
  onSelect: () => void;
};

const PlanCard = ({
  title,
  price,
  cadence,
  features,
  selected,
  onSelect,
}: PlanCardProps) => (
  <button
    type="button"
    className={`plan-card ${selected ? "selected" : ""}`}
    onClick={onSelect}
  >
    <div className="plan-name">{title}</div>
    <div className="plan-price">
      {price}
      <span>{cadence}</span>
    </div>
    <div className="plan-features">
      {features.map((feature) => (
        <div key={feature} className="plan-feature">
          {feature}
        </div>
      ))}
    </div>
  </button>
);

const isValidEmail = (value: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

