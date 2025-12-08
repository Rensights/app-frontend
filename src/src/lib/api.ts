// API URL - can be set at build time OR runtime
// Runtime: Injected via window.__API_URL__ from server-side (Kubernetes secret)
// Build time: NEXT_PUBLIC_API_URL (Next.js replaces it at build time)
// Priority: window.__API_URL__ (runtime) > process.env.NEXT_PUBLIC_API_URL (build time)
const getApiUrlFromEnv = (): string => {
  // Check if we're in browser/client-side
  if (typeof window !== 'undefined') {
    // Client-side: First check for runtime-injected value (from Kubernetes secret)
    const runtimeUrl = (window as any).__API_URL__;
    if (runtimeUrl && runtimeUrl !== '') {
      return runtimeUrl;
    }
    
    // Fallback to build-time value (Next.js replaced process.env.NEXT_PUBLIC_API_URL)
    const buildTimeUrl = process.env.NEXT_PUBLIC_API_URL;
    if (buildTimeUrl && buildTimeUrl !== '') {
      return buildTimeUrl;
    }
    
    // Neither runtime nor build-time URL available
    if (process.env.NODE_ENV === 'development') {
      console.warn('NEXT_PUBLIC_API_URL is not set. Check Kubernetes secret configuration.');
    }
    return '';
  } else {
      // Server-side: Read from process.env (available at runtime from Kubernetes secret)
      // Try API_URL first (regular env var, available at runtime), then NEXT_PUBLIC_API_URL
      const url = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;
      if (!url || url === '') {
        if (process.env.NODE_ENV === 'development') {
          console.warn('API_URL or NEXT_PUBLIC_API_URL is not set on server-side. Check Kubernetes secret configuration.');
        }
        return '';
      }
    return url;
  }
};

export interface RegisterRequest {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  deviceFingerprint?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  deviceFingerprint?: string;
}

export interface LoginResponse {
  requiresVerification: boolean;
  token?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  deviceFingerprint?: string;
}

export interface AuthResponse {
  token: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

export interface UserResponse {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  userTier: 'FREE' | 'PREMIUM' | 'ENTERPRISE';
  customerId?: string; // Our internal customer ID (format: CUST-XXXXXXXX)
  createdAt?: string; // ISO date string or empty string
}

export interface SubscriptionResponse {
  id: string;
  planType: 'FREE' | 'PREMIUM' | 'ENTERPRISE';
  status: 'ACTIVE' | 'CANCELLED' | 'EXPIRED';
  startDate: string;
  endDate?: string;
  createdAt: string;
}

// Optimized: Request cache and deduplication
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

class ApiClient {
  private baseUrl: string | null = null;
  // SECURITY: Token is now stored in HttpOnly cookie, not in localStorage or memory
  // Cookies are automatically sent with requests, so we don't need to manage tokens
  // Optimized: Add request cache and deduplication
  private cache = new Map<string, CacheEntry<any>>();
  private pendingRequests = new Map<string, Promise<any>>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Get the API URL
   * - Client-side: Uses process.env.NEXT_PUBLIC_API_URL (Next.js replaces it at build time)
   * - Server-side: Reads from process.env.NEXT_PUBLIC_API_URL (from Kubernetes secret)
   */
  private getApiUrl(): string {
    return getApiUrlFromEnv();
  }

  updateBaseUrl(newUrl: string) {
    this.baseUrl = newUrl;
  }

  // Optimized: Request deduplication and caching
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    useCache: boolean = false
  ): Promise<T> {
    const apiUrl = this.baseUrl || this.getApiUrl();
    const url = `${apiUrl}${endpoint}`;
    const cacheKey = `${options.method || 'GET'}:${url}`;
    
    // Check cache for GET requests
    if (useCache && (options.method === 'GET' || !options.method)) {
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() < cached.expiresAt) {
        return cached.data;
      }
    }
    
    // Deduplicate concurrent requests
    if (this.pendingRequests.has(cacheKey)) {
      return this.pendingRequests.get(cacheKey)!;
    }
    
    // SECURITY: Token is now stored in HttpOnly cookie, automatically sent by browser
    // No need to manually add Authorization header - cookie is sent automatically
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };
    // Note: Authorization header removed - using HttpOnly cookie instead

    const requestPromise = fetch(url, {
      ...options,
      headers,
      credentials: 'include', // CRITICAL: Include credentials (cookies) for cookie-based authentication
    })
      .then(async (response) => {
        if (!response.ok) {
          // Handle authentication/authorization errors (401/403) - redirect to login
          if (response.status === 401 || response.status === 403) {
            // Clear state on authentication failure (cookie is cleared by backend if needed)
            this.clearToken();
            // Redirect to login page if we're in the browser and not already on a public page
            if (typeof window !== 'undefined') {
              const currentPath = window.location.pathname;
              const publicPaths = ['/', '/signup', '/forgot-password', '/reset-password', '/early-access'];
              const isPublicPath = publicPaths.some(path => currentPath === path || currentPath.startsWith(path + '/'));
              
              if (!isPublicPath) {
                window.location.href = '/';
              }
            }
          }
          
          const errorText = await response.text().catch(() => 'Unknown error');
          let error;
          try {
            error = JSON.parse(errorText);
          } catch {
            error = { error: errorText || `Request failed with status ${response.status}` };
          }
          if (process.env.NODE_ENV === 'development') {
            console.error(`API Error [${response.status}]: ${endpoint}`, error);
          }
          const errorMessage = error.error || error.message || error.details || errorText || `Request failed with status ${response.status}`;
          const apiError = new Error(errorMessage);
          (apiError as any).status = response.status;
          (apiError as any).response = error;
          throw apiError;
        }
        return response.json();
      })
      .then((data: T) => {
        // Cache successful GET requests
        if (useCache && (options.method === 'GET' || !options.method)) {
          this.cache.set(cacheKey, {
            data,
            timestamp: Date.now(),
            expiresAt: Date.now() + this.CACHE_TTL,
          });
        }
        return data;
      })
      .finally(() => {
        this.pendingRequests.delete(cacheKey);
      });
    
    this.pendingRequests.set(cacheKey, requestPromise);
    return requestPromise;
  }
  
  // Optimized: Clear cache when needed
  clearCache() {
    this.cache.clear();
    // Also clear pending requests to prevent stale promises
    this.pendingRequests.clear();
  }

  // SECURITY: setToken deprecated - tokens are now in HttpOnly cookies
  // Kept for backward compatibility but does nothing (cookie is set by backend)
  setToken(token: string) {
    // Token is now stored in HttpOnly cookie by backend
    // No need to store in localStorage (more secure)
    this.clearCache(); // Clear cache on authentication state change
  }

  clearToken() {
    // SECURITY: Token clearing is handled by backend logout endpoint (clears cookie)
    // Clear cached fingerprint
    this.cachedFingerprint = null;
    if (typeof window !== 'undefined') {
      // Clear device storage for login (but keep fingerprint for convenience)
      localStorage.removeItem('rensights-remembered-device');
      localStorage.removeItem('pendingDeviceFingerprint');
      // Note: deviceFingerprint can stay for convenience
    }
    // Clear cache AND pending requests to ensure clean state
    this.clearCache();
  }

  /**
   * Optimized: Generate device fingerprint with memoization
   */
  private cachedFingerprint: string | null = null;
  
  getDeviceFingerprint(): string {
    if (typeof window === 'undefined') {
      return '';
    }
    
    // Return cached value if available
    if (this.cachedFingerprint) {
      return this.cachedFingerprint;
    }
    
    // Check localStorage first
    const stored = localStorage.getItem('deviceFingerprint');
    if (stored) {
      this.cachedFingerprint = stored;
      return stored;
    }
    
    // Optimized: Generate fingerprint using more efficient string operations
    const parts = [
      navigator.userAgent,
      navigator.language,
      navigator.platform,
      `${screen.width}x${screen.height}`,
      String(new Date().getTimezoneOffset()),
    ];
    
    // Optimized: Use faster hash algorithm
    let hash = 0;
    const combined = parts.join('|');
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    const fingerprintStr = Math.abs(hash).toString();
    this.cachedFingerprint = fingerprintStr;
    localStorage.setItem('deviceFingerprint', fingerprintStr);
    return fingerprintStr;
  }

  // Auth endpoints
  async register(data: RegisterRequest): Promise<{ message: string } | AuthResponse> {
    // Register may return token directly if email verification is disabled
    return this.request<{ message: string } | AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async verifyEmail(email: string, code: string, deviceFingerprint?: string): Promise<AuthResponse> {
    // SECURITY: Token is now set in HttpOnly cookie by backend
    // Response will not contain token (for security)
    const response = await this.request<AuthResponse>('/api/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ 
        email, 
        code, 
        deviceFingerprint: deviceFingerprint || this.getDeviceFingerprint() 
      }),
    });
    // Token is automatically stored in HttpOnly cookie by backend
    return response;
  }

  async login(data: LoginRequest): Promise<LoginResponse> {
    // Add device fingerprint if not provided
    if (!data.deviceFingerprint) {
      data.deviceFingerprint = this.getDeviceFingerprint();
    }
    
    // Clear cache before login to ensure fresh state
    this.clearCache();
    
    // Use fetch directly to ensure cookie is set properly and avoid cache interference
    const apiUrl = this.baseUrl || this.getApiUrl();
    const response = await fetch(`${apiUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // CRITICAL: Include credentials to receive and send cookies
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      let error;
      try {
        error = JSON.parse(errorText);
      } catch {
        error = { error: errorText || `Login failed with status ${response.status}` };
      }
      const errorMessage = error.error || error.message || error.details || errorText || `Login failed with status ${response.status}`;
      const apiError = new Error(errorMessage);
      (apiError as any).status = response.status;
      throw apiError;
    }
    
    const loginResponse: LoginResponse = await response.json();
    
    // Token is now in HttpOnly cookie (set by backend), no need to store it
    // Clear cache after login to ensure fresh user data is loaded
    this.clearCache();
    
    return loginResponse;
  }

  async verifyDevice(email: string, code: string, deviceFingerprint: string): Promise<AuthResponse> {
    // SECURITY: Token is now set in HttpOnly cookie by backend
    const response = await this.request<AuthResponse>('/api/auth/verify-device', {
      method: 'POST',
      body: JSON.stringify({ email, code, deviceFingerprint }),
    });
    // Token is automatically stored in HttpOnly cookie by backend
    return response;
  }

  async logout() {
    // SECURITY: Call backend logout endpoint to clear HttpOnly cookie
    try {
      // Use fetch directly to avoid cache/pending requests interference
      const apiUrl = this.baseUrl || this.getApiUrl();
      await fetch(`${apiUrl}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include', // Include cookies
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      // Continue with logout even if backend call fails
      if (process.env.NODE_ENV === 'development') {
        console.error('Logout API call failed:', error);
      }
    }
    // Clear local state
    this.clearToken();
    // Note: Navigation is handled by UserContext to ensure state is properly reset
  }

  // Device verification endpoints (for resending codes)
  async resendVerificationCode(email: string): Promise<{ message: string }> {
    return this.request<{ message: string }>('/api/auth/resend-verification-code', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  // Password reset endpoints
  async forgotPassword(email: string): Promise<{ message: string }> {
    return this.request<{ message: string }>('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async verifyResetCode(email: string, code: string): Promise<{ message: string }> {
    return this.request<{ message: string }>('/api/auth/verify-reset-code', {
      method: 'POST',
      body: JSON.stringify({ email, code }),
    });
  }

  async resetPassword(email: string, code: string, newPassword: string): Promise<{ message: string }> {
    return this.request<{ message: string }>('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, code, newPassword }),
    });
  }

  // User endpoints - Optimized: Enable caching for GET requests
  async getCurrentUser(): Promise<UserResponse> {
    // Don't use cache - always fetch fresh user data to avoid stale state after login/logout
    return this.request<UserResponse>('/users/me', {}, false);
  }

  async updateUserProfile(data: { firstName?: string; lastName?: string }): Promise<UserResponse> {
    const result = await this.request<UserResponse>('/users/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    // Invalidate user cache on update (not using cache anymore, but keep for consistency)
    this.cache.delete('GET:/users/me');
    return result;
  }

  async getPaymentHistory(): Promise<SubscriptionResponse[]> {
    return this.request<SubscriptionResponse[]>('/users/me/payment-history', {}, false);
  }

  // Subscription endpoints - Optimized: Enable caching
  async getAvailablePlans(): Promise<('FREE' | 'PREMIUM' | 'ENTERPRISE')[]> {
    return this.request<('FREE' | 'PREMIUM' | 'ENTERPRISE')[]>('/api/subscriptions/plans', {}, true);
  }

  async getCurrentSubscription(): Promise<SubscriptionResponse> {
    // Don't use cache - always fetch fresh subscription data
    return this.request<SubscriptionResponse>('/api/subscriptions', {}, false);
  }

  async purchasePlan(planType: 'FREE' | 'PREMIUM' | 'ENTERPRISE', paymentMethodId?: string): Promise<SubscriptionResponse> {
    return this.request<SubscriptionResponse>('/api/subscriptions/purchase', {
      method: 'POST',
      body: JSON.stringify({ 
        planType,
        paymentMethodId: paymentMethodId || undefined
      }),
    });
  }

  async createCheckoutSession(planType: 'PREMIUM' | 'ENTERPRISE'): Promise<{ url: string }> {
    return this.request<{ url: string }>('/api/subscriptions/create-checkout-session', {
      method: 'POST',
      body: JSON.stringify({ planType }),
    });
  }

  async cancelSubscription(): Promise<SubscriptionResponse> {
    return this.request<SubscriptionResponse>('/api/subscriptions/cancel', {
      method: 'PUT',
    });
  }

  // Analysis request endpoints
  async submitAnalysisRequest(formData: FormData): Promise<{ message: string }> {
    // SECURITY: Token is in HttpOnly cookie, automatically sent by browser
    const apiUrl = this.baseUrl || this.getApiUrl();
    const url = `${apiUrl}/api/analysis-requests`;
    
    // No Authorization header needed - cookie is sent automatically
    const headers: Record<string, string> = {};
    // Don't set Content-Type for FormData - browser will set it with boundary
    
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });
    
    if (!response.ok) {
          // Handle authentication errors (401/403)
          // Cookie is cleared by backend if needed
          if (response.status === 401 || response.status === 403) {
            // Clear token on authentication failure
            this.clearToken();
            // Redirect to login page if we're in the browser and not already on a public page
            if (typeof window !== 'undefined') {
              const currentPath = window.location.pathname;
              const publicPaths = ['/', '/signup', '/forgot-password', '/reset-password', '/early-access'];
              const isPublicPath = publicPaths.some(path => currentPath === path || currentPath.startsWith(path + '/'));
              
              if (!isPublicPath) {
                window.location.href = '/';
              }
            }
          }
      
      const errorText = await response.text().catch(() => 'Unknown error');
      let error;
      try {
        error = JSON.parse(errorText);
      } catch {
        error = { error: errorText || `Request failed with status ${response.status}` };
      }
      if (process.env.NODE_ENV === 'development') {
        console.error(`API Error [${response.status}]: /api/analysis-requests`, error);
      }
      const errorMessage = error.error || error.message || error.details || errorText || `Request failed with status ${response.status}`;
      const apiError = new Error(errorMessage);
      (apiError as any).status = response.status;
      (apiError as any).response = error;
      throw apiError;
    }
    
    return response.json();
  }

  async checkoutSuccess(sessionId: string): Promise<SubscriptionResponse> {
    return this.request<SubscriptionResponse>(`/api/subscriptions/checkout-success?session_id=${sessionId}`, {
      method: 'GET',
    });
  }

  // Dashboard endpoints
  async getDashboardStats(): Promise<any> {
    return this.request<any>('/dashboard/stats');
  }

  async getMarketInsights(): Promise<any> {
    return this.request<any>('/dashboard/insights');
  }

  // Deal endpoints
  async getDeals(page: number = 0, size: number = 20, city?: string, area?: string, bedroomCount?: string, buildingStatus?: string): Promise<PaginatedDealResponse> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('size', size.toString());
    if (city) params.append('city', city);
    if (area) params.append('area', area);
    if (bedroomCount) params.append('bedroomCount', bedroomCount);
    if (buildingStatus) params.append('buildingStatus', buildingStatus);
    return this.request<PaginatedDealResponse>(`/api/deals?${params.toString()}`, {}, true);
  }

  async getDealById(dealId: string): Promise<Deal> {
    return this.request<Deal>(`/api/deals/${dealId}`, {}, true);
  }
}

export interface Deal {
  id: string;
  name: string;
  location: string;
  city: string;
  area: string;
  bedrooms: string;
  bedroomCount?: string;
  size: string;
  listedPrice: string;
  priceValue: number;
  estimateMin?: number;
  estimateMax?: number;
  estimateRange?: string;
  discount?: string;
  rentalYield?: string;
  buildingStatus: string;
}

export interface PaginatedDealResponse {
  content: Deal[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

// Create API client - URL will be read lazily from window.__API_URL__ at request time
// This ensures we always use the value injected by layout.tsx from the Kubernetes secret
export const apiClient = new ApiClient();
