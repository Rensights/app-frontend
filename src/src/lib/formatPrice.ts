/**
 * Parse a listed / transaction amount in AED from API or display strings.
 * Uses digit-only parsing so values like "AED 1,200,000" or "1200000" work.
 */
function parseListedAmount(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const s = String(value).trim();
  if (!s || s === "N/A") return null;
  const digits = s.replace(/\D/g, "");
  if (!digits) return null;
  const n = Number(digits);
  return Number.isFinite(n) ? n : null;
}

/**
 * Format AED amounts with dot thousand separators, e.g. 720000000 → "AED 720.000.000".
 */
export function formatListedPriceAed(value: unknown): string {
  const n = parseListedAmount(value);
  if (n === null) return "N/A";
  const rounded = Math.round(n);
  const abs = Math.abs(rounded);
  const body = abs.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  if (rounded < 0) return `AED -${body}`;
  return `AED ${body}`;
}
