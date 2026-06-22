/**
 * Format a date string as a relative time label (e.g. "5m", "3h", "2d").
 * Falls back to a locale date string for anything older than 4 weeks.
 */
export function formatRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "Just Now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w`;
  return date.toLocaleDateString("my-MM");
}

/**
 * Format a price in Kyats.
 * Values >= 1 lakh are shown as "X.X Lakh Ks", otherwise "X,XXX Ks".
 */
export function formatPrice(price: number | null | undefined): string {
  if (price == null) return "—";
  if (price >= 100_000) {
    const lakh = price / 100_000;
    return `${lakh.toFixed(1)} Lakh Ks`;
  }
  return `${price.toLocaleString()} Ks`;
}

/**
 * Format a quantity with its unit label.
 */
export function formatQuantity(
  qty: number | null | undefined,
  unit?: string | null,
): string {
  if (qty == null) return "—";
  const unitLabel = unit === "pound" ? "pounds" : "baskets";
  return `${qty.toLocaleString()} ${unitLabel}`;
}

/**
 * Format a number with locale separators + " Ks" suffix.
 * Used by price sliders in the post form.
 */
export function formatLakh(n: number): string {
  return `${n.toLocaleString()} Ks`;
}
