// Re-export from centralized constants — kept for backward compatibility.
// Prefer importing from `@/lib/constants` and `@/lib/utils/format` directly.
export {
  RICE_TYPES,
  MEASURING,
  PRICE_MIN,
  PRICE_MAX,
  PRICE_STEP,
  QTY_MIN,
  QTY_MAX,
  QTY_STEP,
  POUND_MIN,
  POUND_MAX,
} from "@/lib/constants";

export { formatLakh } from "@/lib/utils/format";
