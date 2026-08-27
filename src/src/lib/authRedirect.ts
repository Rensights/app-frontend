/**
 * Post-login redirect handling.
 *
 * Deep links that land on an authenticated route while logged out (e.g. the
 * "your report is ready" email pointing at /analysis-request?id=<uuid>) are
 * bounced to /portal/login. The originally requested URL travels along as the
 * `redirect` query param so the user is returned to it once signed in.
 */

export const REDIRECT_PARAM = "redirect";
export const DEFAULT_AFTER_LOGIN = "/city-analysis";

/**
 * Accept only same-origin, absolute-path targets. Anything else (absolute URLs,
 * protocol-relative "//host", or the auth pages themselves) falls back to the
 * default so the param can't be used as an open redirect or a login loop.
 */
export function sanitizeRedirect(value: string | null | undefined): string | null {
  if (!value) return null;

  let target = value;
  try {
    target = decodeURIComponent(value);
  } catch {
    return null;
  }

  if (!target.startsWith("/")) return null;
  if (target.startsWith("//")) return null;
  if (target.startsWith("/portal/")) return null;

  return target;
}

/** Build the login URL that remembers where the user was heading. */
export function buildLoginUrl(target: string | null | undefined): string {
  const safe = sanitizeRedirect(target);
  return safe
    ? `/portal/login?${REDIRECT_PARAM}=${encodeURIComponent(safe)}`
    : "/portal/login";
}

/**
 * Read the pending target from the browser URL. The login page rewrites its own
 * query string on mount, so window.location is the source of truth here rather
 * than useSearchParams().
 */
export function readRedirectTarget(): string | null {
  if (typeof window === "undefined") return null;
  const param = new URLSearchParams(window.location.search).get(REDIRECT_PARAM);
  return sanitizeRedirect(param);
}

/** Where to send the user after a successful sign-in. */
export function resolveAfterLogin(): string {
  return readRedirectTarget() ?? DEFAULT_AFTER_LOGIN;
}
