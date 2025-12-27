/**
 * Environment Variable Validation
 * Validates required environment variables at runtime
 * Fails fast with clear error messages if missing
 */

interface EnvConfig {
  required: string[];
  optional: string[];
}

const envConfig: EnvConfig = {
  // Required environment variables (will throw error if missing)
  required: [
    // API URL is required - can be set at build time or runtime
    // 'NEXT_PUBLIC_API_URL', // Commented out because it can be injected at runtime
  ],
  // Optional environment variables (will only warn if missing)
  optional: [
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    'NEXT_PUBLIC_GOOGLE_MAPS_API_KEY',
  ],
};

/**
 * Validates environment variables
 * @param isProduction - Whether we're in production mode
 * @throws Error if required env vars are missing
 */
export function validateEnv(isProduction: boolean = false): void {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check required variables
  for (const key of envConfig.required) {
    const value = process.env[key];
    if (!value || value.trim() === '') {
      errors.push(`Required environment variable ${key} is not set`);
    }
  }

  // Check optional variables (warn in production, info in dev)
  for (const key of envConfig.optional) {
    const value = process.env[key];
    if (!value || value.trim() === '') {
      warnings.push(`Optional environment variable ${key} is not set`);
    }
  }

  // Throw error for required variables
  if (errors.length > 0) {
    const errorMessage = `Environment validation failed:\n${errors.join('\n')}`;
    if (isProduction) {
      throw new Error(errorMessage);
    } else {
      console.error(errorMessage);
    }
  }

  // Log warnings for optional variables
  if (warnings.length > 0) {
    const warningMessage = `Environment warnings:\n${warnings.join('\n')}`;
    if (isProduction) {
      console.warn(warningMessage);
    } else {
      console.info(warningMessage);
    }
  }
}

/**
 * Validates API URL (can be from env or runtime injection)
 * @returns true if API URL is available, false otherwise
 */
export function validateApiUrl(): boolean {
  // Check runtime injection first (from Kubernetes secret)
  if (typeof window !== 'undefined') {
    const runtimeUrl = (window as any).__API_URL__;
    if (runtimeUrl && runtimeUrl.trim() !== '') {
      return true;
    }
  }

  // Check build-time environment variable
  const buildTimeUrl = process.env.NEXT_PUBLIC_API_URL;
  if (buildTimeUrl && buildTimeUrl.trim() !== '') {
    return true;
  }

  // Check server-side environment variable
  if (typeof window === 'undefined') {
    const serverUrl = process.env.API_URL;
    if (serverUrl && serverUrl.trim() !== '') {
      return true;
    }
  }

  return false;
}

/**
 * Gets a validated environment variable
 * @param key - Environment variable key
 * @param defaultValue - Default value if not set
 * @param required - Whether this variable is required
 * @returns The environment variable value
 * @throws Error if required and not set
 */
export function getEnv(
  key: string,
  defaultValue: string = '',
  required: boolean = false
): string {
  const value = process.env[key] || defaultValue;

  if (required && (!value || value.trim() === '')) {
    throw new Error(`Required environment variable ${key} is not set`);
  }

  return value;
}

