"use client";

import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import { useUser } from "@/context/UserContext";
import { useTranslations } from "@/hooks/useTranslations";
import { GoogleSignInButton, getGoogleClientId } from "@/components/auth/GoogleSignInButton";
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
    "authLogin.googleNotConfigured": "Google sign-in: set NEXT_PUBLIC_GOOGLE_CLIENT_ID on the frontend container (e.g. Secret frontend-config), then restart the pod. It is read at runtime via the root layout.",
    "authSignup.googleNotConfigured": "Google sign-up: set NEXT_PUBLIC_GOOGLE_CLIENT_ID on the frontend container (e.g. Secret frontend-config), then restart the pod.",
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
  const googleClientId = useMemo(() => getGoogleClientId(), []);

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

  const handleGoogleCredential = useCallback(
    async (credential: string) => {
      setLoginError("");
      setIsSubmitting(true);
      try {
        const loginResponse = await apiClient.loginWithGoogle(credential);
        const resolvedEmail = (loginResponse.email || email).trim().toLowerCase();
        if (resolvedEmail) {
          setEmail(resolvedEmail);
        }

        if (loginResponse.requiresVerification) {
          if (loginResponse.deviceFingerprint && typeof window !== "undefined") {
            localStorage.setItem("pendingDeviceFingerprint", loginResponse.deviceFingerprint);
          } else {
            const fp = apiClient.getDeviceFingerprint();
            if (fp && typeof window !== "undefined") {
              localStorage.setItem("pendingDeviceFingerprint", fp);
            }
          }
          showVerificationStep(resolvedEmail);
          setResendTimer(60);
          setCodeDigits(Array(CODE_LENGTH).fill(""));
          setTimeout(() => codeRefs.current[0]?.focus(), 200);
          setIsSubmitting(false);
          return;
        }

        rememberThisDevice();
        if (typeof window !== "undefined") {
          localStorage.setItem("rensights-force-subscription-sync", "true");
          window.localStorage.setItem("rensights-auth-sync", Date.now().toString());
          window.localStorage.removeItem("rensights-auth-sync");
          window.dispatchEvent(new Event("auth-state-changed"));
        }
        setTimeout(() => {
          window.location.replace("/city-analysis");
        }, 300);
      } catch (error: unknown) {
        const msg =
          error instanceof Error ? error.message : t("authLogin.errorLogin");
        setLoginError(msg);
        setIsSubmitting(false);
      }
    },
    [email, rememberThisDevice, showVerificationStep, t]
  );
  
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

            {googleClientId ? (
              <div className="social-login-section">
                <div className="social-buttons">
                  <GoogleSignInButton
                    clientId={googleClientId}
                    buttonText="signin_with"
                    disabled={isSubmitting}
                    onCredential={handleGoogleCredential}
                    onError={(message) => {
                      setLoginError(message);
                      setIsSubmitting(false);
                    }}
                  />
                </div>
              </div>
            ) : (
              <p
                style={{
                  textAlign: "center",
                  color: "#888",
                  fontSize: "0.875rem",
                  margin: "0 0 1rem",
                  lineHeight: 1.45,
                }}
              >
                {t("authLogin.googleNotConfigured")}
              </p>
            )}

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

