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

