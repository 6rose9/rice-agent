"use client";

import { useState, useCallback } from "react";
import { followUser, unfollowUser } from "@/lib/network/actions";

export function useFollow(initialIsFollowing: boolean) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isLoading, setIsLoading] = useState(false);

  const toggle = useCallback(
    async (targetUserId: string) => {
      if (isLoading) return;

      setIsLoading(true);
      const wasFollowing = isFollowing;

      // Optimistic update
      setIsFollowing(!wasFollowing);

      try {
        const result = wasFollowing
          ? await unfollowUser(targetUserId)
          : await followUser(targetUserId);

        if (!result.success) {
          // Revert on error
          setIsFollowing(wasFollowing);
        }
      } catch {
        // Revert on error
        setIsFollowing(wasFollowing);
      } finally {
        setIsLoading(false);
      }
    },
    [isFollowing, isLoading],
  );

  return { isFollowing, isLoading, toggle };
}
