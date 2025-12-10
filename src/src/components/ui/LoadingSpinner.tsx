"use client";

import "./LoadingSpinner.css";

interface LoadingSpinnerProps {
  size?: "small" | "medium" | "large";
  message?: string;
  fullPage?: boolean;
}

export default function LoadingSpinner({ 
  size = "medium", 
  message = "Loading...",
  fullPage = false 
}: LoadingSpinnerProps) {
  const sizeClass = `spinner-${size}`;
  const containerClass = fullPage ? "loading-container-fullpage" : "loading-container";

  return (
    <div className={containerClass}>
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
      </div>
    </div>
  );
}







