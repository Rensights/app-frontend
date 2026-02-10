"use client";

import React, { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiClient } from "@/lib/api";
import { useUser } from "@/context/UserContext";
import "./signup.css";
import { useTranslations } from "@/hooks/useTranslations";

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
  { value: "rental-income", labelKey: "authSignup.goals.rentalIncome" },
  { value: "capital-appreciation", labelKey: "authSignup.goals.capitalAppreciation" },
  { value: "portfolio-diversification", labelKey: "authSignup.goals.portfolioDiversification" },
  { value: "lifestyle-residence", labelKey: "authSignup.goals.lifestyleResidence" },
];

type Step = "form" | "verification" | "payment";

const CODE_LENGTH = 6;

function SignUpPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useUser();
  const { t } = useTranslations("authSignup", {
    "authSignup.loading": "Loading...",
    "authSignup.redirecting": "Redirecting to dashboard...",
    "authSignup.tagline": "Property Intelligence Platform",
    "authSignup.verifyTitle": "Verify Your Email",
    "authSignup.verifySubtitle": "We've sent a verification code to your email address",
    "authSignup.verifyInfoTitle": "📧 Email Verification",
    "authSignup.verifyInfoText": "Please check your email and enter the 6-digit code sent to",
    "authSignup.codeLabel": "Verification Code",
    "authSignup.verifyButton": "Verify & Continue",
    "authSignup.verifying": "Verifying...",
    "authSignup.resendPrompt": "Didn't receive the code?",
    "authSignup.resendButton": "Resend Code",
    "authSignup.resendCountdown": "Resend available in",
    "authSignup.backToRegistration": "Back to Registration",
    "authSignup.successTitle": "Email Verified Successfully!",
    "authSignup.successSubtitle": "Your account has been created. Redirecting to the platform...",
    "authSignup.accountInfo": "Account Information",
    "authSignup.firstName": "First Name",
    "authSignup.lastName": "Last Name",
    "authSignup.email": "Email",
    "authSignup.emailPlaceholder": "your.email@example.com",
    "authSignup.phone": "Phone (Optional)",
    "authSignup.password": "Password",
    "authSignup.confirmPassword": "Confirm Password",
    "authSignup.passwordPlaceholder": "Create a strong password",
    "authSignup.confirmPlaceholder": "Re-enter password",
    "authSignup.passwordHintsTitle": "Password must include:",
    "authSignup.passwordHintLength": "At least 8 characters",
    "authSignup.passwordHintUpper": "One uppercase letter (A-Z)",
    "authSignup.passwordHintLower": "One lowercase letter (a-z)",
    "authSignup.passwordHintNumber": "One number (0-9)",
    "authSignup.passwordHintSpecial": "One special character (@$!%*?&)",
    "authSignup.passwordHintAllowed": "Only allowed characters (A-Z, a-z, 0-9, @$!%*?&)",
    "authSignup.passwordInvalid": "Password contains invalid characters. Only letters, numbers, and these special characters are allowed: @$!%*?&",
    "authSignup.profileTitle": "Your Profile",
    "authSignup.budget": "Investment Budget Range",
    "authSignup.budgetSelect": "Select budget range",
    "authSignup.goalsTitle": "Primary Investment Goals",
    "authSignup.portfolio": "Current Investment Portfolio",
    "authSignup.portfolioSelect": "Select portfolio size",
    "authSignup.planTitle": "Choose Your Plan",
    "authSignup.planFree": "Free Registration",
    "authSignup.planFreeDesc": "Get started with basic insights",
    "authSignup.planStandard": "Standard Package",
    "authSignup.planStandardDesc": "Perfect for active property seekers",
    "authSignup.planFeature1": "1 tailored pricing analysis of properties selected by you",
    "authSignup.planFeature2": "City analysis",
    "authSignup.planFeature3": "5 tailored pricing analysis of properties selected by you",
    "authSignup.planFeature4": "Advanced city analysis",
    "authSignup.planFeature5": "Potentially underpriced deals",
    "authSignup.termsText": "I have read and agree to the",
    "authSignup.and": "and",
    "authSignup.termsLink": "Terms of Services",
    "authSignup.privacyLink": "Privacy Policy",
    "authSignup.submitRegister": "Register",
    "authSignup.submitPay": "Pay",
    "authSignup.submitting": "Creating Account...",
    "authSignup.haveAccount": "Already have an account? Sign In",
    "authSignup.goals.rentalIncome": "Rental Income",
    "authSignup.goals.capitalAppreciation": "Capital Appreciation",
    "authSignup.goals.portfolioDiversification": "Portfolio Diversification",
    "authSignup.goals.lifestyleResidence": "Lifestyle/Residence Investment",
  });
  const [step, setStep] = useState<Step>("form");
  const [formState, setFormState] = useState<FormState>(initialFormState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>("");
  const [verificationEmail, setVerificationEmail] = useState<string>("");
  const [codeDigits, setCodeDigits] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const [codeError, setCodeError] = useState<string>("");
  const [resendTimer, setResendTimer] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [termsError, setTermsError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const codeRefs = React.useRef<(HTMLInputElement | null)[]>([]);

  // Redirect to city analysis if user is already logged in
  useEffect(() => {
    if (!loading && user) {
      router.push("/city-analysis");
    }
  }, [loading, user, router]);

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
    // Phone is optional, but if provided, validate it contains only numbers and phone characters
    if (formState.phone.trim() && !/^[\d+\-() ]+$/.test(formState.phone.trim())) {
      nextErrors.phone = "Phone number can only contain numbers, +, -, spaces, and parentheses";
    }
    // SECURITY FIX: Enforce strong password requirements to match backend exactly
    // Backend regex: ^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$
    const backendPasswordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    
    if (!formState.password || formState.password.trim().length === 0) {
      nextErrors.password = "Password is required";
    } else if (formState.password.length < 8) {
      nextErrors.password = "Password must be at least 8 characters long";
    } else if (!backendPasswordPattern.test(formState.password)) {
      // Check for characters that are NOT allowed (only allow A-Z, a-z, 0-9, @$!%*?&)
      const invalidChars = formState.password.match(/[^A-Za-z\d@$!%*?&]/);
      if (invalidChars) {
        nextErrors.password = `Password contains invalid characters. Only letters, numbers, and these special characters are allowed: @$!%*?&`;
      } else {
        // Provide specific feedback on what's missing
        const missing = [];
        if (!/[a-z]/.test(formState.password)) missing.push("lowercase letter (a-z)");
        if (!/[A-Z]/.test(formState.password)) missing.push("uppercase letter (A-Z)");
        if (!/\d/.test(formState.password)) missing.push("number (0-9)");
        if (!/[@$!%*?&]/.test(formState.password)) missing.push("special character (@$!%*?&)");
        
        if (missing.length === 1) {
          nextErrors.password = `Password must include: ${missing[0]}`;
        } else if (missing.length === 2) {
          nextErrors.password = `Password must include: ${missing[0]} and ${missing[1]}`;
        } else if (missing.length > 2) {
          nextErrors.password = `Password must include: ${missing.slice(0, -1).join(", ")}, and ${missing[missing.length - 1]}`;
        } else {
          nextErrors.password = "Password must contain: uppercase letter, lowercase letter, number, and special character (@$!%*?&)";
        }
      }
    }
    if (formState.password !== formState.confirmPassword)
      nextErrors.confirmPassword = "Passwords must match";
    if (!formState.budget) nextErrors.budget = "Required";
    if (formState.goals.length === 0)
      nextErrors.goals = "Select at least one goal";
    if (!formState.portfolio) nextErrors.portfolio = "Required";
    if (!formState.plan) nextErrors.plan = "Please select a plan";
    if (!agreeTerms) setTermsError("Please accept the Terms of Services and Privacy Policy.");

    setErrors(nextErrors);
    
    if (Object.keys(nextErrors).length > 0) {
      // Scroll to first error field after state updates
      const firstErrorField = Object.keys(nextErrors)[0];
      
      // Function to scroll to error field
      const scrollToErrorField = () => {
        const fieldContainer = document.querySelector(`[data-field="${firstErrorField}"]`) as HTMLElement;
        if (!fieldContainer) {
          return false;
        }
        
        // Look for input, select, or goals-grid within the container
        const inputElement = fieldContainer.querySelector('input:not([type="checkbox"]), select, textarea') as HTMLElement;
        const goalsGrid = fieldContainer.querySelector('.goals-grid') as HTMLElement;
        const planCard = fieldContainer.querySelector('.plan-card') as HTMLElement;
        const elementToScroll = inputElement || goalsGrid || planCard || fieldContainer;
        
        if (!elementToScroll) {
          return false;
        }
        
        // Get header
        const header = document.querySelector('header') as HTMLElement;
        
        // Measure actual header height
        const headerRect = header?.getBoundingClientRect();
        const headerHeight = headerRect ? headerRect.height : 20;
        
        // Calculate total offset needed - header + padding
        const totalOffset = headerHeight + 40;
        
        // Get element position BEFORE scrolling
        const elementRect = elementToScroll.getBoundingClientRect();
        const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
        const elementTop = elementRect.top + currentScroll;
        
        // Calculate target scroll position
        const targetScroll = elementTop - totalOffset;
        
        // Scroll directly to the calculated position (no smooth for immediate effect, then smooth)
        // First do instant scroll to get close
        window.scrollTo({
          top: Math.max(0, targetScroll - 100), // Scroll a bit higher first
          behavior: 'auto'
        });
        
        // Then smooth scroll to exact position
        setTimeout(() => {
          const newElementRect = elementToScroll.getBoundingClientRect();
          const newScroll = window.pageYOffset || document.documentElement.scrollTop;
          const newElementTop = newElementRect.top + newScroll;
          const finalTargetScroll = newElementTop - totalOffset;
          
          window.scrollTo({
            top: Math.max(0, finalTargetScroll),
            behavior: 'smooth'
          });
          
          // Final verification after smooth scroll
          setTimeout(() => {
            const finalRect = elementToScroll.getBoundingClientRect();
            const finalHeaderRect = header?.getBoundingClientRect();
            const headerBottom = finalHeaderRect ? finalHeaderRect.bottom : 0;
            
            // If still under header, force one more time
            if (finalRect.top <= headerBottom + 20) {
              const forceScroll = (finalRect.top + (window.pageYOffset || document.documentElement.scrollTop)) - totalOffset;
              window.scrollTo({
                top: Math.max(0, forceScroll),
                behavior: 'smooth'
              });
            }
          }, 1000);
        }, 50);
        
        // Focus input after scroll
        if (inputElement && (inputElement.tagName === 'INPUT' || inputElement.tagName === 'SELECT')) {
          setTimeout(() => {
            (inputElement as HTMLElement).focus();
            inputElement.style.transition = 'box-shadow 0.3s';
            inputElement.style.boxShadow = '0 0 0 3px rgba(220, 38, 38, 0.3)';
            setTimeout(() => {
              inputElement.style.boxShadow = '';
            }, 2000);
          }, 600);
        }
        
        return true;
      };
      
      // Try scrolling with increasing delays to ensure DOM is ready
      setTimeout(() => {
        if (!scrollToErrorField()) {
          setTimeout(() => {
            if (!scrollToErrorField()) {
              setTimeout(scrollToErrorField, 200);
            }
          }, 200);
        }
      }, 300);
    }
    
    return Object.keys(nextErrors).length === 0 && agreeTerms;
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
        if (process.env.NODE_ENV === 'development') {
          console.log("Email verification disabled - token received, redirecting to dashboard");
        }
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
        
        // Redirect to city analysis for free plan
        router.push("/city-analysis");
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
      // Handle validation errors with field-specific messages
      if (error.fieldErrors && error.fieldErrors.password) {
        setErrors((prev) => ({ ...prev, password: error.fieldErrors.password }));
        setSubmitError("Please fix the password requirements above");
      } else if (error.message) {
        // Check if error message contains password-related info
        if (error.message.toLowerCase().includes('password')) {
          const passwordError = error.fieldErrors?.password || error.message;
          setErrors((prev) => ({ ...prev, password: passwordError }));
          setSubmitError("Please check the password requirements");
        } else {
          setSubmitError(error.message);
        }
      } else {
        setSubmitError("Registration failed. Please check all fields and try again.");
      }
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
      // Note: Token is set in HttpOnly cookie by backend, no need to manually set it
      const authResponse = await apiClient.verifyEmail(verificationEmail, code, deviceFingerprint);
      
      if (process.env.NODE_ENV === 'development') {
        console.log("Email verified successfully. Plan:", formState.plan);
        console.log("Auth response:", authResponse);
        console.log("Current step before check:", step);
      }

      // Show success message first
      setShowSuccess(true);
      setIsSubmitting(false);
      
      // Force a refresh of the user context to pick up the new authentication state
      // This ensures the UserContext recognizes the user is authenticated
      if (typeof window !== 'undefined') {
        // Trigger storage event for cross-tab sync
        window.localStorage.setItem('rensights-auth-sync', Date.now().toString());
        window.localStorage.removeItem('rensights-auth-sync');
        // Also dispatch custom event for same-tab updates
        window.dispatchEvent(new Event('auth-state-changed'));
      }
      
      // IMPORTANT: Check plan AFTER showing success
      // If a paid plan is selected, redirect to Stripe Checkout after success message
      if (formState.plan === "premium") {
        setTimeout(() => {
          if (process.env.NODE_ENV === 'development') {
            console.log("✅ Premium plan detected! Redirecting to Stripe Checkout");
          }
          setIsSubmitting(true);
          try {
            apiClient.createCheckoutSession("PREMIUM").then((checkoutResponse) => {
              if (checkoutResponse.url) {
                window.location.href = checkoutResponse.url;
              }
            }).catch((error: any) => {
              console.error("Failed to create checkout session:", error);
              setShowSuccess(false);
              setCodeError(error.message || "Failed to start payment. Please try again.");
              setIsSubmitting(false);
            });
          } catch (error: any) {
            console.error("Failed to create checkout session:", error);
            setShowSuccess(false);
            setCodeError(error.message || "Failed to start payment. Please try again.");
            setIsSubmitting(false);
          }
        }, 2000);
        return;
      }

      // Redirect to dashboard for free plan after success message
      // Wait a bit longer to ensure UserContext has time to load the user
      setTimeout(() => {
        if (process.env.NODE_ENV === 'development') {
          console.log("Free plan selected, redirecting to dashboard");
        }
        // Save token if present in response
        if (authResponse.token) {
          apiClient.setToken(authResponse.token);
        }
        // Use window.location.replace for a full page reload to ensure auth state is picked up
        // This prevents back button issues and ensures clean state
        window.location.replace("/city-analysis");
      }, 1500);
    } catch (error: any) {
      // Handle expired code or network errors
      const errorMessage = error?.message || error?.error || "Invalid verification code. Please try again.";
      if (errorMessage.toLowerCase().includes("expired") || errorMessage.toLowerCase().includes("failed to fetch")) {
        setCodeError("The verification code has expired. Please request a new code.");
      } else {
        setCodeError(errorMessage);
      }
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
      // Clear the code input fields when resending
      setCodeDigits(Array(CODE_LENGTH).fill(""));
      // Focus the first input field
      setTimeout(() => codeRefs.current[0]?.focus(), 100);
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

  const handleCodePaste = (event: React.ClipboardEvent<HTMLInputElement>, index: number) => {
    event.preventDefault();
    const pastedText = event.clipboardData.getData('text');
    
    // Extract only digits from pasted text
    const digitsOnly = pastedText.replace(/\D/g, '');
    
    if (digitsOnly.length === 0) return;
    
    // Create a new array with existing digits
    const nextDigits = [...codeDigits];
    
    // Fill digits starting from the current index
    for (let i = 0; i < digitsOnly.length && (index + i) < CODE_LENGTH; i++) {
      nextDigits[index + i] = digitsOnly[i];
    }
    
    setCodeDigits(nextDigits);
    setCodeError(""); // Clear error when user pastes
    
    // Focus the last filled input or the last input if all filled
    const lastFilledIndex = Math.min(index + digitsOnly.length - 1, CODE_LENGTH - 1);
    const nextFocusIndex = Math.min(lastFilledIndex + 1, CODE_LENGTH - 1);
    setTimeout(() => {
      codeRefs.current[nextFocusIndex]?.focus();
    }, 0);
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

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="signup-page">
        <div className="signup-container">
          <div className="signup-card">
            <div className="logo">Rensights</div>
            <div style={{ textAlign: 'center', padding: '2rem' }}>{t("authSignup.loading")}</div>
          </div>
        </div>
      </div>
    );
  }

  // Don't render signup form if user is logged in (redirect will happen)
  if (user) {
    return (
      <div className="signup-page">
        <div className="signup-container">
          <div className="signup-card">
            <div className="logo">Rensights</div>
            <div style={{ textAlign: 'center', padding: '2rem' }}>{t("authSignup.redirecting")}</div>
          </div>
        </div>
      </div>
    );
  }

  if (step === "verification") {
    return (
      <div className="signup-page">
        <div className="signup-container">
          <div className="signup-card">
            <div className="logo">Rensights</div>
            <div className="tagline">Property Intelligence Platform</div>

            <div className="form-step active">
              <div className="step-title">{t("authSignup.verifyTitle")}</div>
              <div className="step-description">
                {t("authSignup.verifySubtitle")}
              </div>

              {showSuccess ? (
                <div style={{
                  textAlign: 'center',
                  padding: '2rem',
                  backgroundColor: '#f0fdf4',
                  borderRadius: '12px',
                  border: '2px solid #22c55e',
                  marginBottom: '2rem'
                }}>
                  <div style={{
                    fontSize: '3rem',
                    marginBottom: '1rem'
                  }}>✓</div>
                  <h2 style={{
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    color: '#16a34a',
                    marginBottom: '0.5rem'
                  }}>{t("authSignup.successTitle")}</h2>
                  <p style={{
                    fontSize: '1rem',
                    color: '#166534',
                    marginBottom: '1rem'
                  }}>
                    {t("authSignup.successSubtitle")}
                  </p>
                </div>
              ) : (
                <>
                  <div className="device-info">
                    <div className="device-info-title">{t("authSignup.verifyInfoTitle")}</div>
                    <div className="device-info-text">
                      {t("authSignup.verifyInfoText")} <strong>{maskEmail(verificationEmail)}</strong>
                    </div>
                  </div>

                  <div className="form-group">
                <label className="form-label">{t("authSignup.codeLabel")}</label>
                <div className="verification-code">
                  {codeDigits.map((digit, index) => (
                    <input
                      key={index}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      className={`code-input ${codeError ? "error" : ""}`}
                      maxLength={1}
                      value={digit}
                      onChange={(event) => handleCodeChange(event.target.value, index)}
                      onKeyDown={(event) => handleCodeKeyDown(event, index)}
                      onPaste={(event) => handleCodePaste(event, index)}
                      ref={(ref) => { codeRefs.current[index] = ref; }}
                    />
                  ))}
                </div>
                {codeError && (
                  <div className="error-message show" style={{ marginTop: '0.5rem', fontSize: '0.75rem' }}>
                    <span>⚠</span>
                    <span>{codeError}</span>
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
                    {t("authSignup.verifying")}
                  </>
                ) : (
                  t("authSignup.verifyButton")
                )}
              </button>

              <div className="resend-section">
                <div className="resend-text">{t("authSignup.resendPrompt")}</div>
                <button
                  type="button"
                  className={`resend-link ${resendTimer ? "disabled" : ""}`}
                  onClick={handleResendCode}
                  disabled={!!resendTimer || isSubmitting}
                >
                  {t("authSignup.resendButton")}
                </button>
                {resendTimer > 0 && (
                  <div className="countdown">
                    {t("authSignup.resendCountdown")} <span>{resendTimer}</span>s
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
                    ← {t("authSignup.backToRegistration")}
                  </button>
                </>
              )}
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
          <div className="tagline">{t("authSignup.tagline")}</div>

          <form className="signup-form" onSubmit={handleSubmit} noValidate>
            <SectionTitle>{t("authSignup.accountInfo")}</SectionTitle>

            <div className="form-row">
              <div data-field="firstName">
                <Field
                  id="firstName"
                  label={t("authSignup.firstName")}
                  placeholder="John"
                  value={formState.firstName}
                  onChange={(value) => handleChange("firstName", value)}
                  error={errors.firstName}
                />
              </div>
              <div data-field="lastName">
                <Field
                  id="lastName"
                  label={t("authSignup.lastName")}
                  placeholder="Doe"
                  value={formState.lastName}
                  onChange={(value) => handleChange("lastName", value)}
                  error={errors.lastName}
                />
              </div>
            </div>

            <div className="form-row">
              <div data-field="email">
                <Field
                  id="email"
                  label={t("authSignup.email")}
                  type="email"
                  placeholder={t("authSignup.emailPlaceholder") || "your.email@example.com"}
                  value={formState.email}
                  onChange={(value) => handleChange("email", value)}
                  error={errors.email}
                />
              </div>
              <div data-field="phone">
                <Field
                  id="phone"
                  label={t("authSignup.phone")}
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={formState.phone}
                  onChange={(value) => handleChange("phone", value)}
                  error={errors.phone}
                  required={false}
                />
              </div>
            </div>

            <div className="form-row">
              <div className={`form-group ${errors.password ? 'has-error' : ''}`} data-field="password" style={{ flex: 1 }}>
                <label className="form-label required-label" htmlFor="password">
                  {t("authSignup.password")}
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    className={`form-input ${errors.password ? "error" : ""}`}
                    placeholder={t("authSignup.passwordPlaceholder")}
                    value={formState.password}
                    onChange={(event) => handleChange("password", event.target.value)}
                    style={{ paddingRight: "3rem" }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    style={{
                      position: "absolute",
                      right: "0.75rem",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      color: "#6b7280",
                      fontSize: "0.875rem",
                      cursor: "pointer",
                    }}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                {errors.password && (
                  <div className="error-message show" style={{ fontSize: '0.75rem' }}>
                    <span>⚠</span>
                    <span>{errors.password}</span>
                  </div>
                )}
                {formState.password && (
                  <div className="password-hints" style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#666' }}>
                    <div style={{ fontWeight: '500', marginBottom: '0.25rem' }}>{t("authSignup.passwordHintsTitle")}</div>
                    <ul style={{ margin: 0, paddingLeft: '1.25rem', listStyle: 'disc' }}>
                      <li style={{ color: formState.password.length >= 8 ? '#22c55e' : '#666' }}>
                        {t("authSignup.passwordHintLength")} {formState.password.length >= 8 ? '✓' : ''}
                      </li>
                      <li style={{ color: /[A-Z]/.test(formState.password) ? '#22c55e' : '#666' }}>
                        {t("authSignup.passwordHintUpper")} {/[A-Z]/.test(formState.password) ? '✓' : ''}
                      </li>
                      <li style={{ color: /[a-z]/.test(formState.password) ? '#22c55e' : '#666' }}>
                        {t("authSignup.passwordHintLower")} {/[a-z]/.test(formState.password) ? '✓' : ''}
                      </li>
                      <li style={{ color: /\d/.test(formState.password) ? '#22c55e' : '#666' }}>
                        {t("authSignup.passwordHintNumber")} {/\d/.test(formState.password) ? '✓' : ''}
                      </li>
                      <li style={{ color: /[@$!%*?&]/.test(formState.password) ? '#22c55e' : '#666' }}>
                        {t("authSignup.passwordHintSpecial")} {/[@$!%*?&]/.test(formState.password) ? '✓' : ''}
                      </li>
                      <li style={{ color: /^[A-Za-z\d@$!%*?&]+$/.test(formState.password) ? '#22c55e' : '#ef4444' }}>
                        {t("authSignup.passwordHintAllowed")} {/^[A-Za-z\d@$!%*?&]+$/.test(formState.password) ? '✓' : '✗'}
                      </li>
                    </ul>
                    {!/^[A-Za-z\d@$!%*?&]+$/.test(formState.password) && (
                      <div style={{ marginTop: '0.5rem', padding: '0.5rem', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '4px', color: '#991b1b', fontSize: '0.8125rem' }}>
                        ⚠️ {t("authSignup.passwordInvalid")}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className={`form-group ${errors.confirmPassword ? 'has-error' : ''}`} data-field="confirmPassword" style={{ flex: 1 }}>
                <label className="form-label required-label" htmlFor="confirmPassword">
                  {t("authSignup.confirmPassword")}
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    className={`form-input ${errors.confirmPassword ? "error" : ""}`}
                    placeholder={t("authSignup.confirmPlaceholder")}
                    value={formState.confirmPassword}
                    onChange={(event) => handleChange("confirmPassword", event.target.value)}
                    style={{ paddingRight: "3rem" }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    style={{
                      position: "absolute",
                      right: "0.75rem",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      color: "#6b7280",
                      fontSize: "0.875rem",
                      cursor: "pointer",
                    }}
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? "Hide" : "Show"}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <div className="error-message show" style={{ fontSize: '0.75rem' }}>
                    <span>⚠</span>
                    <span>{errors.confirmPassword}</span>
                  </div>
                )}
              </div>
            </div>

            <SectionTitle>{t("authSignup.profileTitle")}</SectionTitle>

            <div data-field="budget">
                <SelectField
                  id="budget"
                  label={t("authSignup.budget")}
                  value={formState.budget}
                  onChange={(value) => handleChange("budget", value)}
                  options={[
                    { value: "", label: t("authSignup.budgetSelect") },
                    { value: "under-100k", label: "Under $100,000" },
                    { value: "100k-250k", label: "$100,000 - $250,000" },
                    { value: "250k-500k", label: "$250,000 - $500,000" },
                  { value: "500k-1m", label: "$500,000 - $1M" },
                  { value: "1m-5m", label: "$1M - $5M" },
                  { value: "above-5m", label: "Above $5M" },
                ]}
                error={errors.budget}
              />
            </div>

            <div className={`form-group ${errors.goals ? 'has-error' : ''}`} data-field="goals">
              <label className="form-label required-label">{t("authSignup.goalsTitle")}</label>
              <div className={`goals-grid ${errors.goals ? 'has-error' : ''}`}>
                {goalOptions.map((goal) => (
                  <label key={goal.value} className="goal-option">
                    <input
                      type="checkbox"
                      checked={formState.goals.includes(goal.value)}
                      onChange={() => toggleGoal(goal.value)}
                    />
                    <span>{t(goal.labelKey)}</span>
                  </label>
                ))}
              </div>
              {errors.goals && (
                <div className="error-message show" style={{ fontSize: '0.75rem' }}>
                  <span>⚠</span>
                  <span>{errors.goals}</span>
                </div>
              )}
            </div>

            <div data-field="portfolio">
                <SelectField
                  id="portfolio"
                  label={t("authSignup.portfolio")}
                  value={formState.portfolio}
                  onChange={(value) => handleChange("portfolio", value)}
                  options={[
                    { value: "", label: t("authSignup.portfolioSelect") },
                    { value: "below-5", label: "Below 5 properties" },
                    { value: "5-10", label: "5-10 properties" },
                    { value: "above-10", label: "Above 10 properties" },
                ]}
                error={errors.portfolio}
              />
            </div>

            <SectionTitle>{t("authSignup.planTitle")}</SectionTitle>

            <div className="plans-grid two-cols" data-field="plan">
              <PlanCard
                title={t("authSignup.planFree")}
                price="$0"
                cadence="/mo"
                description={t("authSignup.planFreeDesc")}
                features={[
                  t("authSignup.planFeature1"),
                  t("authSignup.planFeature2"),
                ]}
                selected={formState.plan === "free"}
                onSelect={() => handlePlanSelect("free")}
              />
              <PlanCard
                title={t("authSignup.planStandard")}
                price="$20"
                cadence="/mo"
                description={t("authSignup.planStandardDesc")}
                features={[
                  t("authSignup.planFeature3"),
                  t("authSignup.planFeature4"),
                  t("authSignup.planFeature5"),
                ]}
                selected={formState.plan === "premium"}
                onSelect={() => handlePlanSelect("premium")}
              />
            </div>
            {errors.plan && (
              <div className="error-message show plan-error" style={{ marginTop: '0.5rem', fontSize: '0.75rem' }}>
                <span>⚠</span>
                <span>{errors.plan}</span>
              </div>
            )}

            {submitError && (
              <div className="error-message show" style={{ marginBottom: "1rem", fontSize: '0.75rem' }}>
                <span>⚠</span>
                <span>{submitError}</span>
              </div>
            )}

            <div className="terms-consent">
              <label className="terms-checkbox">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(event) => {
                    setAgreeTerms(event.target.checked);
                    setTermsError("");
                  }}
                />
                <span>
                  {t("authSignup.termsText")}{" "}
                  <a
                    className="terms-link"
                    href="/privacy-terms"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {t("authSignup.termsLink")}
                  </a>{" "}
                  {t("authSignup.and") || "and"}{" "}
                  <a
                    className="terms-link"
                    href="/privacy-terms"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {t("authSignup.privacyLink")}
                  </a>
                  .
                </span>
              </label>
              {termsError && (
                <div className="error-message show" style={{ marginTop: '0.5rem', fontSize: '0.75rem' }}>
                  <span>⚠</span>
                  <span>{termsError}</span>
                </div>
              )}
            </div>

            <button type="submit" className="btn" disabled={isSubmitting || !agreeTerms}>
              {isSubmitting ? (
                  <>
                    <span className="loading" />
                    {t("authSignup.submitting")}
                  </>
                ) : (
                  formState.plan === "premium" ? t("authSignup.submitPay") : t("authSignup.submitRegister")
                )}
            </button>
          </form>

          <div className="back-to-login">
            <a
              href="/portal/login"
              onClick={(event) => {
                event.preventDefault();
                window.location.href = "/portal/login";
              }}
            >
              {t("authSignup.haveAccount")}
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
  required?: boolean;
};

const Field = ({
  id,
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  error,
  required = true,
}: FieldProps) => {
  const handlePhoneChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (type === "tel") {
      // Only allow numbers, +, -, spaces, and parentheses for phone numbers
      const phoneValue = event.target.value.replace(/[^\d+\-() ]/g, '');
      onChange(phoneValue);
    } else {
      onChange(event.target.value);
    }
  };

  return (
    <div className={`form-group ${error ? 'has-error' : ''}`}>
      <label className={`form-label ${required ? "required-label" : ""}`} htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        type={type}
        className={`form-input ${error ? "error" : ""}`}
        value={value}
        placeholder={placeholder}
        onChange={type === "tel" ? handlePhoneChange : (event) => onChange(event.target.value)}
        required={required}
        pattern={type === "tel" ? "[0-9+\-() ]*" : undefined}
      />
      {error && (
        <div className="error-message show" style={{ fontSize: '0.75rem' }}>
          <span>⚠</span>
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

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
  <div className={`form-group ${error ? 'has-error' : ''}`}>
    <label className="form-label required-label" htmlFor={id}>
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
    {error && (
      <div className="error-message show" style={{ fontSize: '0.75rem' }}>
        <span>⚠</span>
        <span>{error}</span>
      </div>
    )}
  </div>
);

type PlanCardProps = {
  title: string;
  price: string;
  cadence: string;
  description?: string;
  features: string[];
  selected: boolean;
  onSelect: () => void;
};

const PlanCard = ({
  title,
  price,
  cadence,
  description,
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
    {description && (
      <div className="plan-description" style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.5rem', marginBottom: '1rem' }}>
        {description}
      </div>
    )}
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
