import "server-only";

/**
 * Server-side fetch of a translations namespace, used to seed a page's first
 * paint so it renders real text instead of fallbacks (no translation FOUC).
 *
 * Mirrors the layout's getInitialCommon: prefers the in-cluster INTERNAL_API_URL
 * (avoids the pod hairpinning out through the ingress and back), stays cacheable
 * via ISR `revalidate`, never touches cookies()/headers() (which would turn the
 * route dynamic), and is bounded by a short timeout — the client-side
 * LanguageProvider self-heals on a miss, so the only cost is a first-paint FOUC.
 */
export async function getServerTranslations(
  namespace: string,
  languageCode: string = "en"
): Promise<Record<string, string>> {
  const base =
    process.env.INTERNAL_API_URL ||
    process.env.API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "";
  if (!base) return {};
  try {
    const res = await fetch(`${base}/api/translations/${languageCode}/${namespace}`, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(500),
    });
    if (!res.ok) return {};
    return (await res.json()).translations ?? {};
  } catch {
    return {};
  }
}
