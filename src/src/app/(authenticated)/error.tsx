"use client";

import { useEffect } from "react";

export default function AuthenticatedError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="content-section active">
      <div className="section-card" style={{ textAlign: "center", padding: "48px 24px" }}>
        <div
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            background: "rgba(246, 176, 66, 0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
          }}
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#f6b042"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>

        <div className="section-title" style={{ marginBottom: "12px" }}>
          Something went wrong
        </div>

        <p className="info-text" style={{ marginBottom: "28px" }}>
          An unexpected error occurred while loading this page. Please try
          again, or contact support if the problem persists.
        </p>

        <button className="btn" onClick={reset}>
          Try again
        </button>
      </div>
    </section>
  );
}
