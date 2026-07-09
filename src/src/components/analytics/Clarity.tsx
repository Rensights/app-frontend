"use client";

import { useEffect, useRef } from "react";
import clarity from "@microsoft/clarity";

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
 * Environment Variable Required:
 * NEXT_PUBLIC_CLARITY_PROJECT_ID - Your Clarity project ID from https://clarity.microsoft.com
 */
export default function Clarity() {
  // Guards against double initialization: the CookiebotOnConsentReady event
  // can fire multiple times, but clarity.init must only run once.
  const initialized = useRef(false);

  useEffect(() => {
    // Only initialize on client side
    if (typeof window === "undefined") return;

    // Get Clarity project ID from environment variable
    const projectId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;

    if (!projectId) {
      if (process.env.NODE_ENV === "development") {
        console.warn(
          "Microsoft Clarity: NEXT_PUBLIC_CLARITY_PROJECT_ID is not set. Clarity will not be initialized."
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

