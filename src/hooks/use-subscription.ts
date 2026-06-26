"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getSubscriptionTier,
  type SubscriptionTier,
} from "@/lib/subscription";

/**
 * Reactive hook for subscription tier. Syncs across:
 * - Component mounts
 * - localStorage changes from other tabs (storage event)
 * - Window focus (user navigated back from /pricing)
 */
export function useSubscription() {
  const [tier, setTier] = useState<SubscriptionTier>("free");
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(() => {
    setTier(getSubscriptionTier());
    setIsLoading(false);
  }, []);

  useEffect(() => {
    // Initial read
    refresh();

    // Sync when user returns from another tab or /pricing page
    function handleFocus() {
      refresh();
    }

    // Sync across tabs
    function handleStorage(e: StorageEvent) {
      if (e.key === "subscription_tier") {
        refresh();
      }
    }

    window.addEventListener("focus", handleFocus);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("storage", handleStorage);
    };
  }, [refresh]);

  return {
    tier,
    isPro: tier !== "free",
    isLoading,
    refresh,
  };
}
