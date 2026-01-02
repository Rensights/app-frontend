"use client";

import { useEffect } from "react";
import { clarity } from "@microsoft/clarity";

/**
 * Microsoft Clarity Analytics Component
 * Initializes Clarity tracking on the client side
 * 
 * Usage: Add <Clarity /> to your root layout
 * 
 * Environment Variable Required:
 * NEXT_PUBLIC_CLARITY_PROJECT_ID - Your Clarity project ID from https://clarity.microsoft.com
 */
export default function Clarity() {
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

    // Initialize Clarity
    try {
      clarity.init(projectId);
      if (process.env.NODE_ENV === "development") {
        console.log("Microsoft Clarity initialized with project ID:", projectId);
      }
    } catch (error) {
      console.error("Error initializing Microsoft Clarity:", error);
    }
  }, []);

  // This component doesn't render anything
  return null;
}

