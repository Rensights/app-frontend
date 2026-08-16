"use client";

import { useEffect, useRef } from "react";
import clarity from "@microsoft/clarity";

declare global {
  interface Window {
    // Injected at container startup by docker-entrypoint.sh (see window.__API_URL__).
    __CLARITY_PROJECT_ID__?: string;
  }
}

/**
 * Microsoft Clarity Analytics Component
 * Initializes Clarity tracking on the client side
 *
 * Clarity belongs to the "statistics" consent category and is only
 * initialized after the user grants that consent via Cookiebot. It reacts
 * to consent that was already granted before mount as well as to later
 * consent changes, and fails closed (no tracking) when Cookiebot is absent.
 *
 * Usage: Add <Clarity /> to your root layout
 *
 * Project ID, from https://clarity.microsoft.com, resolved in this order:
 *   1. window.__CLARITY_PROJECT_ID__ - runtime config written by docker-entrypoint.sh from
 *      the CLARITY_PROJECT_ID env var, the same way __API_URL__ and __FARO_URL__ work.
 *   2. NEXT_PUBLIC_CLARITY_PROJECT_ID - build-time fallback, for local dev via .env.local.
 *
 * The runtime path matters: NEXT_PUBLIC_* values are inlined when the image is built, so a
 * value set only in the Kubernetes deployment never reaches the browser bundle. The project
 * ID is a public, browser-exposed value, so injecting it at runtime is safe.
 */
export default function Clarity() {
  // Guards against double initialization: the CookiebotOnConsentReady event
  // can fire multiple times, but clarity.init must only run once.
  const initialized = useRef(false);

  useEffect(() => {
    // Only initialize on client side
    if (typeof window === "undefined") return;

    // Runtime config first, build-time env as the local-dev fallback.
    const projectId =
      window.__CLARITY_PROJECT_ID__ || process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;

    if (!projectId) {
      if (process.env.NODE_ENV === "development") {
        console.warn(
          "Microsoft Clarity: no project ID (CLARITY_PROJECT_ID / NEXT_PUBLIC_CLARITY_PROJECT_ID). Clarity will not be initialized."
        );
      }
      return;
    }

    const initClarity = () => {
      // Fail closed: only initialize when Cookiebot granted statistics consent.
      if (!window.Cookiebot?.consent?.statistics) return;
      if (initialized.current) return;
      initialized.current = true;

      try {
        clarity.init(projectId);
      } catch (error) {
        console.error("Error initializing Microsoft Clarity:", error);
      }
    };

    // Case 1: consent was already granted before this component mounted
    // (Cookiebot loads beforeInteractive, so the event may have already fired).
    initClarity();

    // Case 2: catch the first consent response and any later consent changes.
    window.addEventListener("CookiebotOnConsentReady", initClarity);

    return () => {
      window.removeEventListener("CookiebotOnConsentReady", initClarity);
    };
  }, []);

  // This component doesn't render anything
  return null;
}

