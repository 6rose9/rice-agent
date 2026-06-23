const STORAGE_KEY = "subscription_tier";

export type SubscriptionTier = "free" | "pro" | "pro_plus";

export function getSubscriptionTier(): SubscriptionTier {
  if (typeof window === "undefined") return "free";
  const value = localStorage.getItem(STORAGE_KEY);
  if (value === "pro" || value === "pro_plus") return value;
  return "free";
}

export function setSubscriptionTier(tier: SubscriptionTier) {
  localStorage.setItem(STORAGE_KEY, tier);
}

export function isProUser(): boolean {
  return getSubscriptionTier() !== "free";
}
