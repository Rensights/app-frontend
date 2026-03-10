"use client";

import "./LoadingSpinner.css";

interface LoadingSpinnerProps {
  size?: "small" | "medium" | "large";
  message?: string;
  fullPage?: boolean;
  subMessage?: string;
}

export default function LoadingSpinner({ 
  size = "medium", 
  message = "Loading...",
  fullPage = false,
  subMessage
}: LoadingSpinnerProps) {
  const sizeClass = `spinner-${size}`;
  const containerClass = fullPage ? "loading-container-fullpage" : "loading-container";
  const showDefaultSubMessage = !subMessage && message.toLowerCase().includes("loading");
  const resolvedSubMessage = subMessage || (showDefaultSubMessage ? "This usually takes a few seconds." : "");

  return (
    <div className={containerClass}>
      <div className="loading-panel">
        <div className="loading-content">
        <div className={`spinner ${sizeClass}`}>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
        </div>
        {message && (
          <p className="loading-message">{message}</p>
        )}
        {resolvedSubMessage && (
          <p className="loading-submessage">{resolvedSubMessage}</p>
        )}
        </div>
      </div>
    </div>
  );
}






