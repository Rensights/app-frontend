"use client";

import { ReactNode } from "react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

/**
 * Gates content on a namespace's translation load state (from useTranslations):
 * shows a loader until the response arrives and an error message if it fails,
 * so the page never flashes the default/fallback text and then swaps it for the
 * real (or translated) content.
 */
export default function TranslationGate({
  ready,
  error,
  children,
  loadingMessage = "Loading...",
  errorMessage = "Something went wrong loading this page. Please refresh and try again.",
}: {
  ready: boolean;
  error: boolean;
  children: ReactNode;
  loadingMessage?: string;
  errorMessage?: string;
}) {
  if (error) {
    return (
      <div className="py-24 text-center text-muted-foreground">
        <p>{errorMessage}</p>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="py-24">
        <LoadingSpinner message={loadingMessage} />
      </div>
    );
  }

  return <>{children}</>;
}
