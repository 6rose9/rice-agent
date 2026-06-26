// ── User Roles ──────────────────────────────────────────────────────
export const ROLES = ["farmer", "trader", "agent", "general_user"] as const;
export type Role = (typeof ROLES)[number];

export const ROLE_LABELS: Record<Role, string> = {
  farmer: "🧑‍🌾 Farmer",
  trader: "🏭 Trader",
  agent: "🤝 Agent",
  general_user: "👤 User",
};

// ── Post Types ──────────────────────────────────────────────────────
export const POST_TYPES = ["general", "buying", "selling"] as const;
export type PostType = (typeof POST_TYPES)[number];

export const POST_TYPE_LABELS: Record<PostType, string> = {
  general: "📝 General",
  buying: "💰 Buying",
  selling: "🛒 Selling",
};

// ── Rice Types ──────────────────────────────────────────────────────
export const RICE_TYPES = [
  "Soft rice (ဆန်ပျော့)",
  "Hard rice (ဆန်မာ)",
  "Glutinous rice (ကောက်ညင်)",
  "Jasmine rice (ဂျက်မင် ဆန်)",
] as const;

// ── Measuring Units ─────────────────────────────────────────────────
export const MEASURING = [
  { value: "pound", label: "Weighting scale" },
  { value: "tin", label: "Tin container" },
] as const;

// ── Price Slider ────────────────────────────────────────────────────
export const PRICE_MIN = 500_000; // 5 lakh
export const PRICE_MAX = 7_500_000; // 75 lakh
export const PRICE_STEP = 5_000;

// ── Quantity Slider ─────────────────────────────────────────────────
export const QTY_MIN = 100;
export const QTY_MAX = 100_000;
export const QTY_STEP = 50;

// ── Pound per Bag Slider ────────────────────────────────────────────
export const POUND_MIN = 92;
export const POUND_MAX = 120;
