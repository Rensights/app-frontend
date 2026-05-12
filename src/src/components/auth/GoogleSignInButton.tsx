"use client";

import { useEffect, useRef } from "react";

/** GIS client on window — avoid augmenting `Window` (conflicts with @types/google.maps). */
type GoogleIdentityServicesWindow = Window & {
  google?: {
    accounts?: {
      id?: {
        initialize: (config: Record<string, unknown>) => void;
        renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void;
        cancel?: () => void;
      };
    };
  };
};

const GSI_SCRIPT_ID = "google-gsi-client";

function loadGsiScript(): Promise<void> {
  if (typeof document === "undefined") return Promise.resolve();
  if (document.getElementById(GSI_SCRIPT_ID)) {
    return Promise.resolve();
  }
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.id = GSI_SCRIPT_ID;
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google Sign-In"));
    document.head.appendChild(script);
  });
}

export type GoogleButtonText = "signin_with" | "signup_with" | "continue_with";

type GoogleSignInButtonProps = {
  clientId: string;
  onCredential: (credential: string) => void;
  onError?: (message: string) => void;
  disabled?: boolean;
  buttonText?: GoogleButtonText;
};

/**
 * Renders Google Identity Services button. Requires NEXT_PUBLIC_GOOGLE_CLIENT_ID at build/runtime.
 */
export function GoogleSignInButton({
  clientId,
  onCredential,
  onError,
  disabled,
  buttonText = "continue_with",
}: GoogleSignInButtonProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const onCredentialRef = useRef(onCredential);
  const onErrorRef = useRef(onError);
  onCredentialRef.current = onCredential;
  onErrorRef.current = onError;

  useEffect(() => {
    if (!clientId || disabled) return;

    let cancelled = false;

    const cancelGsi = () => {
      try {
        (window as GoogleIdentityServicesWindow).google?.accounts?.id?.cancel?.();
      } catch {
        /* ignore */
      }
    };

    (async () => {
      try {
        await loadGsiScript();
        if (cancelled || !containerRef.current) return;
        const google = (window as GoogleIdentityServicesWindow).google;
        const idApi = google?.accounts?.id;
        if (!idApi) {
          onErrorRef.current?.("Google Sign-In unavailable");
          return;
        }

        // GIS expects button width in pixels, not "100%" (logs: invalid width).
        const measureWidthPx = (): number => {
          const el = containerRef.current;
          if (!el) return 400;
          const w = Math.round(el.getBoundingClientRect().width);
          if (Number.isFinite(w) && w >= 200) return w;
          return 400;
        };

        cancelGsi();
        if (cancelled || !containerRef.current) return;

        idApi.initialize({
          client_id: clientId,
          callback: (response: { credential?: string }) => {
            if (response?.credential) {
              onCredentialRef.current(response.credential);
            } else {
              onErrorRef.current?.("No credential from Google");
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true,
        });
        if (cancelled || !containerRef.current) return;

        const host = containerRef.current;
        host.innerHTML = "";
        const widthPx = measureWidthPx();
        if (cancelled) return;

        idApi.renderButton(host, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: buttonText,
          width: widthPx,
          locale: "en",
        });
      } catch (e) {
        if (!cancelled) {
          onErrorRef.current?.(
            e instanceof Error ? e.message : "Google Sign-In failed to load"
          );
        }
      }
    })();

    return () => {
      cancelled = true;
      cancelGsi();
    };
  }, [clientId, disabled, buttonText]);

  if (!clientId) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", minHeight: "44px", display: "flex", justifyContent: "center" }}
      aria-label="Google sign-in"
    />
  );
}

export function getGoogleClientId(): string {
  if (typeof window !== "undefined") {
    const fromWindow = (window as Window & { __GOOGLE_CLIENT_ID__?: string })
      .__GOOGLE_CLIENT_ID__;
    if (fromWindow && String(fromWindow).trim()) {
      return String(fromWindow).trim();
    }
  }
  return process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim() || "";
}
