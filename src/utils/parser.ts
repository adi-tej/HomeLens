export function formatCurrency(n?: number) {
  if (n == null || Number.isNaN(n)) return "";

  // Prefer Intl.NumberFormat when available.
  if (typeof Intl !== "undefined" && (Intl as any).NumberFormat) {
    try {
      return new Intl.NumberFormat("en-AU", {
        style: "currency",
        currency: "AUD",
        maximumFractionDigits: 0,
      }).format(n);
    } catch {
      // fall through to fallback formatter
    }
  }

  // Fallback: round and insert commas for thousands.
  const rounded = Math.round(n);
  return `$${rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
}

export function parseNumber(input: string): number | undefined {
  if (!input) return undefined;

  // Remove everything except digits, dot and minus sign.
  let s = input.replace(/[^0-9.-]/g, "");
  if (!s) return undefined;

  // Keep only the first dot (decimal point), remove other dots
  const firstDot = s.indexOf(".");
  if (firstDot !== -1) {
    s = s.slice(0, firstDot + 1) + s.slice(firstDot + 1).replace(/\./g, "");
  }

  // Allow a single leading minus sign only.
  s = s.replace(/(?!^)-/g, "");

  // If the string is just '-' or '.' or '-.' it's not a number
  if (s === "-" || s === "." || s === "-.") return undefined;

  const num = Number(s);
  return Number.isFinite(num) ? num : undefined;
}
