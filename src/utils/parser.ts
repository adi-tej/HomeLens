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

/**
 * Round percentage to 2 decimal places
 * @param percent - The percentage value to round
 * @returns Rounded percentage value
 */
export function roundPercentage(percent: number): number {
    return Math.round(percent * 100) / 100;
}

/**
 * Format percentage only if it has more than 2 decimals
 * @param percent - The percentage value to format
 * @returns Formatted percentage as string
 */
export function formatPercentText(percent: number): string {
    const str = percent.toString();
    const decimalIndex = str.indexOf(".");

    // If no decimal or 2 or fewer decimal places, return as-is
    if (decimalIndex === -1 || str.length - decimalIndex - 1 <= 2) {
        return str;
    }

    // More than 2 decimals, round to 2
    return percent.toFixed(2);
}

/**
 * Calculate percentage from currency value relative to a property value
 * @param currencyValue - The currency amount
 * @param propertyValue - The total property value
 * @returns Percentage (rounded to 2 decimals) or null if invalid
 */
export function calculatePercentFromCurrency(
    currencyValue: number,
    propertyValue: number,
): number | null {
    if (!propertyValue || propertyValue <= 0) return null;
    const percent = (currencyValue / propertyValue) * 100;
    return Number.isFinite(percent) ? roundPercentage(percent) : null;
}

/**
 * Calculate currency value from percentage of a property value
 * @param percent - The percentage value
 * @param propertyValue - The total property value
 * @returns Currency amount (rounded to nearest integer) or null if invalid
 */
export function calculateCurrencyFromPercent(
    percent: number,
    propertyValue: number,
): number | null {
    if (!propertyValue || propertyValue <= 0) return null;
    return Math.round((percent / 100) * propertyValue);
}
