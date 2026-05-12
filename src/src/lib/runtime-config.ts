// Runtime configuration - read from environment variables at runtime
// This file is imported by Server Components to get runtime values

let cachedApiUrl: string | null = null;

export function getRuntimeApiUrl(): string {
  // Server-side: read from environment variables
  if (typeof window === 'undefined') {
    // Try multiple sources
    const apiUrl = 
      process.env.API_URL || 
      process.env.NEXT_PUBLIC_API_URL ||
      '';
    
    if (apiUrl) {
      cachedApiUrl = apiUrl;
    }
    
    return apiUrl;
  }
  
  // Client-side: should already be injected via window.__API_URL__
  return '';
}

export function getCachedApiUrl(): string {
  return cachedApiUrl || '';
}

/** Server-only: Google Web client ID from container env (e.g. K8s secret) for root layout injection. */
export function getRuntimeGoogleClientIdForInjection(): string {
  if (typeof window !== "undefined") return "";
  return (process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "").trim();
}
