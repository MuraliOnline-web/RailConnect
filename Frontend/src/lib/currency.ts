/**
 * Single source of truth for monetary formatting across RailConnect.
 * Always renders Indian Rupees with exactly 2 decimal places.
 */

function toNumber(v: unknown): number {
  const n = typeof v === "number" ? v : Number(v ?? 0);
  return Number.isFinite(n) ? n : 0;
}

/** Round a number to 2 decimal places without precision drift. */
export function round2(v: unknown): number {
  return Math.round(toNumber(v) * 100) / 100;
}

/**
 * Format a numeric value as Indian Rupees with 2 decimals and ₹ prefix.
 * Examples: 47 → "₹47.00", 42.3 → "₹42.30", -47 → "−₹47.00"
 */
export function formatINR(value: unknown): string {
  const n = round2(value);
  const abs = Math.abs(n).toFixed(2);
  return `${n < 0 ? "−" : ""}₹${abs}`;
}

/**
 * Signed formatting for credits/debits in transaction rows.
 * Positive → "+₹42.30", negative → "−₹47.00", zero → "₹0.00".
 */
export function formatSignedINR(value: unknown): string {
  const n = round2(value);
  if (n === 0) return "₹0.00";
  const abs = Math.abs(n).toFixed(2);
  return `${n > 0 ? "+" : "−"}₹${abs}`;
}

/** Format a plain amount with 2 decimals, no sign. */
export function formatAmount(value: unknown): string {
  return Math.abs(round2(value)).toFixed(2);
}
