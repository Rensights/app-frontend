"use client";

import { useEffect, useRef, useState, useMemo, useCallback, memo } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import { useUser } from "@/context/UserContext";
import { useTranslations } from "@/hooks/useTranslations";
import "../../login.css";

type Step = "login" | "verification" | "success";

const DEVICE_STORAGE_KEY = "rensights-remembered-device";
const CODE_LENGTH = 6;

export default function LoginPage() {
  const router = useRouter();
  const toast = useToast();
  const { user, loading } = useUser();
  const { t } = useTranslations("authLogin", {
    "authLogin.loading": "Loading...",
    "authLogin.redirecting": "Redirecting to dashboard...",
    "authLogin.tagline": "Property Intelligence Platform",
    "authLogin.welcomeTitle": "Welcome Back",
    "authLogin.welcomeSubtitle": "Sign in to access your property insights",
    "authLogin.emailLabel": "Email Address",
    "authLogin.passwordLabel": "Password",
    "authLogin.emailPlaceholder": "your@email.com",
    "authLogin.passwordPlaceholder": "Enter your password",
    "authLogin.loginButton": "Login",
    "authLogin.loggingIn": "Logging in...",
    "authLogin.or": "OR",
    "authLogin.google": "Continue with Google",
    "authLogin.forgotPassword": "Forgot password?",
    "authLogin.createAccount": "Create an account",
    "authLogin.verifyTitle": "Verify New Device",
    "authLogin.verifySubtitle": "We noticed a login from a new device. Please enter the verification code sent to your email.",
    "authLogin.deviceTitle": "🔒 New Device Detected",
    "authLogin.deviceText": "We sent a 6-digit code to",
    "authLogin.codeLabel": "Verification Code",
    "authLogin.verifyButton": "Verify & Continue",
    "authLogin.verifying": "Verifying...",
    "authLogin.resendPrompt": "Didn't receive the code?",
    "authLogin.resendButton": "Resend Code",
    "authLogin.resendCountdown": "Resend available in",
    "authLogin.backToLogin": "Back to Login",
    "authLogin.successTitle": "Welcome to Rensights!",
    "authLogin.successSubtitle": "You're all set. Redirecting to your dashboard...",
    "authLogin.errorEmail": "Please enter a valid email address",
    "authLogin.errorPassword": "Password is required",
    "authLogin.errorCode": "Please enter the complete verification code",
    "authLogin.errorLogin": "Login failed. Please check your credentials.",
    "authLogin.errorDevice": "Device fingerprint not available",
  });
  const [step, setStep] = useState<Step>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    code: "",
  });
  const [maskedEmail, setMaskedEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [codeDigits, setCodeDigits] = useState<string[]>(
    Array(CODE_LENGTH).fill("")
  );
  const [resendTimer, setResendTimer] = useState(0);
  const [loginError, setLoginError] = useState("");
  const codeRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [hasKnownDevice, setHasKnownDevice] = useState(false);

  // Redirect to city analysis if user is already logged in
  useEffect(() => {
    if (!loading && user) {
      router.push("/city-analysis");
    }
  }, [loading, user, router]);

  // Reset login form state when component mounts (e.g., after logout)
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    // Don't clear cache if user is logged in (prevents clearing on redirect)
    if (!user) {
      // Clear any cached authentication state and pending requests
      // This is critical after logout to ensure clean state
      apiClient.clearCache();
    }
    
    // Reset form state completely
    setStep("login");
    setEmail("");
    setPassword("");
    setErrors({ email: "", password: "", code: "" });
    setLoginError("");
    setCodeDigits(Array(CODE_LENGTH).fill(""));
    setIsSubmitting(false);
    
    // Check for remembered device
    setHasKnownDevice(localStorage.getItem(DEVICE_STORAGE_KEY) === "true");
    
    // Remove any URL parameters (like cache busting parameter from logout)
    if (window.location.search) {
      const url = new URL(window.location.href);
      url.search = '';
      window.history.replaceState({}, '', url.toString());
    }
  }, [user]);

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

  // Optimized: Memoize callback to prevent re-renders
  const handleLoginSubmit = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = { email: "", password: "", code: "" };
    setLoginError("");

    const normalizedEmail = email.trim().toLowerCase();
    if (!isValidEmail(normalizedEmail)) {
      nextErrors.email = t("authLogin.errorEmail");
    }
    if (!password) {
      nextErrors.password = t("authLogin.errorPassword");
    }

    setErrors(nextErrors);

    if (nextErrors.email || nextErrors.password) {
      return;
    }

    setIsSubmitting(true);
    try {
      const deviceFingerprint = apiClient.getDeviceFingerprint();
      const loginResponse = await apiClient.login({ email: normalizedEmail, password, deviceFingerprint });
      
      if (loginResponse.requiresVerification) {
        // New device or unverified email - verification code already sent by backend
        showVerificationStep(normalizedEmail);
        // Store device fingerprint for verification
        if (loginResponse.deviceFingerprint) {
          if (typeof window !== 'undefined') {
            localStorage.setItem('pendingDeviceFingerprint', loginResponse.deviceFingerprint);
          }
        } else if (deviceFingerprint) {
          if (typeof window !== 'undefined') {
            localStorage.setItem('pendingDeviceFingerprint', deviceFingerprint);
          }
        }
        setResendTimer(60);
        setCodeDigits(Array(CODE_LENGTH).fill(""));
        setTimeout(() => codeRefs.current[0]?.focus(), 200);
        setIsSubmitting(false);
      } else {
        // Known device - cookie is set by backend, redirect to dashboard
        // SECURITY: Token is now in HttpOnly cookie, not in response
        rememberThisDevice();
        
        // Force a refresh of the user context to pick up the new authentication state
        if (typeof window !== 'undefined') {
          // Force a one-time subscription sync after login
          localStorage.setItem('rensights-force-subscription-sync', 'true');
          // Trigger storage event for cross-tab sync
          window.localStorage.setItem('rensights-auth-sync', Date.now().toString());
          window.localStorage.removeItem('rensights-auth-sync');
          // Also dispatch custom event for same-tab updates
          window.dispatchEvent(new Event('auth-state-changed'));
        }
        
        // Clear any cached auth state to force fresh load after redirect
        // Don't clear cache here - let UserContext fetch fresh data after redirect
        // Wait longer to ensure cookie is fully set and propagated in browser
        setTimeout(() => {
          if (typeof window !== 'undefined') {
            // Use location.replace to ensure clean navigation (no back button to login)
            // This forces a full page reload, ensuring UserContext remounts with fresh state
            window.location.replace("/city-analysis");
          } else {
            router.push("/city-analysis");
          }
        }, 300); // Reduced delay - cookie should be available quickly
      }
    } catch (error: any) {
      // Check if error is about email not verified
      if (error.message && (error.message.includes("Email not verified") || error.message.includes("email not verified"))) {
        // Backend should send verification code, show verification step
        showVerificationStep(normalizedEmail);
        const deviceFingerprint = apiClient.getDeviceFingerprint();
        if (deviceFingerprint && typeof window !== 'undefined') {
          localStorage.setItem('pendingDeviceFingerprint', deviceFingerprint);
        }
        setResendTimer(60);
        setCodeDigits(Array(CODE_LENGTH).fill(""));
        setTimeout(() => codeRefs.current[0]?.focus(), 200);
        setIsSubmitting(false);
        return;
      }
      
      setLoginError(error.message || t("authLogin.errorLogin"));
      setIsSubmitting(false);
    }
  }, [email, password, router]);

  // Optimized: Memoize callbacks
  const showVerificationStep = useCallback((value: string) => {
    setMaskedEmail(maskEmail(value));
    setStep("verification");
    setResendTimer(60);
    setCodeDigits(Array(CODE_LENGTH).fill(""));
    setTimeout(() => codeRefs.current[0]?.focus(), 200);
  }, []);

  const rememberThisDevice = useCallback(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(DEVICE_STORAGE_KEY, "true");
    setHasKnownDevice(true);
  }, []);

  const showSuccess = useCallback(() => setStep("success"), []);

  const handleVerifyCode = useCallback(async () => {
    // Clean the code - remove any non-digits
    const code = codeDigits.join("").replace(/\D/g, '');
    
    // Check if all 6 digits are filled - all must be non-empty strings
    const allFilled = codeDigits.length === CODE_LENGTH && 
                     codeDigits.every(d => d !== null && d !== undefined && d.trim() !== '') &&
                     code.length === CODE_LENGTH;
    
    if (!allFilled) {
      setErrors((prev) => ({
        ...prev,
        code: t("authLogin.errorCode"),
      }));
      if (process.env.NODE_ENV === 'development') {
        console.log('Validation failed:', { 
          codeDigits, 
          code, 
          length: code.length, 
          allFilled: codeDigits.every(d => d && d.trim() !== '') 
        });
      }
      return;
    }
    
    setIsSubmitting(true);
    setErrors((prev) => ({ ...prev, code: "" }));
    
    try {
      // Get device fingerprint (should always be available for login verification)
      const deviceFingerprint = typeof window !== 'undefined' 
        ? (localStorage.getItem('pendingDeviceFingerprint') || apiClient.getDeviceFingerprint())
        : apiClient.getDeviceFingerprint();
      
      if (!deviceFingerprint) {
        throw new Error(t("authLogin.errorDevice"));
      }
      
      // For login verification, try verifyEmail first (for unverified email)
      // If that fails with "not found" or similar, try verifyDevice (for new device)
      try {
        await apiClient.verifyEmail(email, code, deviceFingerprint);
      } catch (emailVerifyError: any) {
        // If verifyEmail fails (e.g., user already verified but new device), try verifyDevice
        if (emailVerifyError.message && emailVerifyError.message.includes("not found")) {
          await apiClient.verifyDevice(email, code, deviceFingerprint);
        } else {
          throw emailVerifyError;
        }
      }
      
      if (typeof window !== 'undefined') {
        localStorage.removeItem('pendingDeviceFingerprint');
      }
      
      rememberThisDevice();
      showSuccess();
      
      // Force a refresh of the user context to pick up the new authentication state
      // This ensures the UserContext recognizes the user is authenticated across tabs
      if (typeof window !== 'undefined') {
        // Force a one-time subscription sync after login
        localStorage.setItem('rensights-force-subscription-sync', 'true');
        // Trigger storage event for cross-tab sync
        window.localStorage.setItem('rensights-auth-sync', Date.now().toString());
        window.localStorage.removeItem('rensights-auth-sync');
        // Also dispatch custom event for same-tab updates
        window.dispatchEvent(new Event('auth-state-changed'));
      }
      
      // SECURITY: Cookie is set by backend, wait a moment for it to be set before redirect
      // Redirect to city analysis after a short delay to ensure cookie is set
      setTimeout(() => {
        // Use window.location.replace for hard navigation to ensure cookie is sent
        // This prevents back button issues
        window.location.replace("/city-analysis");
      }, 1000);
    } catch (error: any) {
      setErrors((prev) => ({
        ...prev,
        code: error.message || "Invalid verification code. Please try again.",
      }));
      setIsSubmitting(false);
    }
  }, [email, router, codeDigits, rememberThisDevice, showSuccess]);

  const handleResendCode = useCallback(async () => {
    if (resendTimer) return;
    
    setIsSubmitting(true);
    try {
      await apiClient.resendVerificationCode(email);
      setResendTimer(60);
      setErrors((prev) => ({ ...prev, code: "" }));
      // Clear the code input fields when resending
      setCodeDigits(Array(CODE_LENGTH).fill(""));
      // Focus the first input field
      setTimeout(() => codeRefs.current[0]?.focus(), 100);
    } catch (error: any) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Failed to resend code:", error);
      }
      toast.showError("Failed to resend code: " + (error.message || "Unknown error"));
    } finally {
      setIsSubmitting(false);
    }
  }, [email, resendTimer]);

  const handleBackToLogin = useCallback(() => {
    setStep("login");
    setCodeDigits(Array(CODE_LENGTH).fill(""));
    setErrors({ email: "", password: "", code: "" });
    setResendTimer(0);
    setIsSubmitting(false);
  }, []);

  const handleCodeChange = useCallback((value: string, index: number) => {
    // Only allow digits, and limit to single character
    const digit = value.replace(/\D/g, '').slice(-1); // Extract last digit only
    if (!digit && value !== '') return; // Allow empty string for deletion
    
    setCodeDigits((prev) => {
      const nextDigits = [...prev];
      nextDigits[index] = digit;
      return nextDigits;
    });
    
    // Auto-focus next input when a digit is entered
    if (digit && index < CODE_LENGTH - 1) {
      setTimeout(() => codeRefs.current[index + 1]?.focus(), 0);
    }
  }, []);

  const handleCodePaste = useCallback((e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, CODE_LENGTH);
    
    if (pastedData.length === 0) return;
    
    setCodeDigits((prev) => {
      const nextDigits = [...prev];
      // Fill in the pasted digits starting from the current index
      const startIndex = parseInt((e.currentTarget as HTMLInputElement).getAttribute('data-index') || '0');
      for (let i = 0; i < pastedData.length && startIndex + i < CODE_LENGTH; i++) {
        nextDigits[startIndex + i] = pastedData[i];
      }
      return nextDigits;
    });
    
    // Focus on the next empty input or the last input
    const startIndex = parseInt((e.currentTarget as HTMLInputElement).getAttribute('data-index') || '0');
    const nextFocusIndex = Math.min(startIndex + pastedData.length, CODE_LENGTH - 1);
    setTimeout(() => codeRefs.current[nextFocusIndex]?.focus(), 0);
  }, []);

  const handleCodeKeyDown = useCallback((
    event: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (event.key === "Backspace" && !codeDigits[index] && index > 0) {
      codeRefs.current[index - 1]?.focus();
      // Clear the previous input when backspacing on empty input
      setCodeDigits((prev) => {
        const nextDigits = [...prev];
        nextDigits[index - 1] = '';
        return nextDigits;
      });
    }
  }, [codeDigits]);

  const handleSocialLogin = useCallback((provider: string) => {
    toast.showInfo(`Initiating ${provider} login... In a real application, this would redirect to the ${provider} OAuth flow.`);
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      showSuccess();
    }, 1000);
  }, [showSuccess]);
  
  // Optimized: Memoize computed values
  const maskedEmailMemo = useMemo(() => maskEmail(email), [email]);
  const codeComplete = useMemo(() => codeDigits.join("").length === CODE_LENGTH, [codeDigits]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="login-page">
        <div className="login-container">
          <div className="login-card">
            <div className="logo">Rensights</div>
            <div style={{ textAlign: 'center', padding: '2rem' }}>{t("authLogin.loading")}</div>
          </div>
        </div>
      </div>
    );
  }

  // Don't render login form if user is logged in (redirect will happen)
  if (user) {
    return (
      <div className="login-page">
        <div className="login-container">
          <div className="login-card">
            <div className="logo">Rensights</div>
            <div style={{ textAlign: 'center', padding: '2rem' }}>{t("authLogin.redirecting")}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <div className="logo">Rensights</div>
          <div className="tagline">{t("authLogin.tagline")}</div>

          <div className={`form-step ${step === "login" ? "active" : ""}`}>
            <div className="step-title">{t("authLogin.welcomeTitle")}</div>
            <div className="step-description">
              {t("authLogin.welcomeSubtitle")}
            </div>

            <form id="loginForm" onSubmit={handleLoginSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="email">
                  {t("authLogin.emailLabel")}
                </label>
                <input
                  type="email"
                  id="email"
                  className={`form-input ${errors.email ? "error" : ""}`}
                  placeholder={t("authLogin.emailPlaceholder")}
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  required
                />
                {errors.email && (
                  <div className="error-message show" id="emailError">
                    {errors.email}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="password">
                  {t("authLogin.passwordLabel")}
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    className={`form-input ${errors.password ? "error" : ""}`}
                    placeholder={t("authLogin.passwordPlaceholder")}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
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
                  <div className="error-message show" id="passwordError">
                    {errors.password}
                  </div>
                )}
              </div>

              {loginError && (
                <div className="error-message show" style={{ marginBottom: "1rem" }}>
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                className="btn"
                id="loginBtn"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="loading" />
                    {t("authLogin.loggingIn")}
                  </>
                ) : (
                  t("authLogin.loginButton")
                )}
              </button>
            </form>

            <div className="divider">
              <span>{t("authLogin.or")}</span>
            </div>

            <div className="social-login-section">
              <div className="social-buttons">
                <button
                  className="social-btn google"
                  type="button"
                  onClick={() => handleSocialLogin("Google")}
                >
                  <GoogleIcon />
                  {t("authLogin.google")}
                </button>
              </div>
        </div>

            <div className="forgot-password">
              <div className="forgot-links">
                <a
                  href="/portal/forgot-password"
                  style={{ color: "#f39c12", textDecoration: "none" }}
                >
                  {t("authLogin.forgotPassword")}
          </a>
                <a
                  href="/portal/signup"
                  style={{ color: "#f39c12", textDecoration: "none" }}
                >
                  {t("authLogin.createAccount")}
                </a>
              </div>
            </div>
          </div>

          <div className={`form-step ${step === "verification" ? "active" : ""}`}>
            <div className="step-title">{t("authLogin.verifyTitle")}</div>
            <div className="step-description">
              {t("authLogin.verifySubtitle")}
            </div>

            <div className="device-info">
              <div className="device-info-title">{t("authLogin.deviceTitle")}</div>
              <div className="device-info-text">
                {t("authLogin.deviceText")} <strong>{maskedEmail}</strong>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">{t("authLogin.codeLabel")}</label>
              <div className="verification-code">
                {codeDigits.map((digit, index) => (
                  <input
                    key={index}
                    type="text"
                    inputMode="numeric"
                    className="code-input"
                    maxLength={1}
                    value={digit}
                    data-index={index}
                    onChange={(event) =>
                      handleCodeChange(event.target.value, index)
                    }
                    onKeyDown={(event) => handleCodeKeyDown(event, index)}
                    onPaste={index === 0 ? handleCodePaste : undefined}
                    ref={(ref) => {
                      codeRefs.current[index] = ref;
                    }}
                  />
                ))}
              </div>
              {errors.code && (
                <div className="error-message show" id="codeError">
                  {errors.code}
                </div>
              )}
            </div>

            <button
              className="btn"
              onClick={handleVerifyCode}
              disabled={isSubmitting || codeDigits.join("").length !== CODE_LENGTH}
            >
              {isSubmitting ? (
                <>
                  <span className="loading" />
                  {t("authLogin.verifying")}
                </>
              ) : (
                t("authLogin.verifyButton")
              )}
            </button>

            <div className="resend-section">
              <div className="resend-text">{t("authLogin.resendPrompt")}</div>
              <button
                type="button"
                className={`resend-link ${resendTimer ? "disabled" : ""}`}
                onClick={handleResendCode}
                disabled={!!resendTimer}
              >
                {t("authLogin.resendButton")}
              </button>
              {resendTimer > 0 && (
                <div className="countdown">
                  {t("authLogin.resendCountdown")} <span>{resendTimer}</span>s
                </div>
              )}
            </div>

            <button className="btn btn-secondary" onClick={handleBackToLogin}>
              ← {t("authLogin.backToLogin")}
            </button>
          </div>

          <div className={`form-step ${step === "success" ? "active" : ""}`}>
            <div className="success-icon">✓</div>
            <div className="step-title">{t("authLogin.successTitle")}</div>
            <div className="step-description">
              {t("authLogin.successSubtitle")}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Optimized: Memoize utility functions
const isValidEmail = (value: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

// Optimized: Use more efficient string operations
const maskEmail = (value: string) => {
  const atIndex = value.indexOf("@");
  if (atIndex === -1) return value;
  const username = value.slice(0, atIndex);
  const domain = value.slice(atIndex + 1);
  if (!username || !domain) return value;
  const maskedUsername = username.length > 1
    ? `${username[0]}${"*".repeat(Math.max(0, username.length - 2))}${username.slice(-1)}`
    : username;
  return `${maskedUsername}@${domain}`;
};

// Optimized: Memoize icon components to prevent re-renders
const GoogleIcon = memo(() => (
  <svg viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
));
GoogleIcon.displayName = 'GoogleIcon';
