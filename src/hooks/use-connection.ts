"use client";

import { useState, useCallback } from "react";
import {
  sendConnectionRequest,
  declineConnectionRequest,
  type ConnectionStatus,
} from "@/lib/network/actions";

export function useConnection(initialStatus: ConnectionStatus, onStatusChange?: (status: ConnectionStatus) => void) {
  const [status, setStatus] = useState<ConnectionStatus>(initialStatus);
  const [isLoading, setIsLoading] = useState(false);

  const sendRequest = useCallback(
    async (targetUserId: string) => {
      if (isLoading) return;
      const prev = status;

      // Optimistic — UI updates instantly before server call
      setStatus("pending_sent");
      onStatusChange?.("pending_sent");
      setIsLoading(true);

      try {
        const result = await sendConnectionRequest(targetUserId);
        if (!result.success) {
          setStatus(prev);
          onStatusChange?.(prev);
        }
      } catch {
        setStatus(prev);
        onStatusChange?.(prev);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, status, onStatusChange],
  );

  const declineRequest = useCallback(
    async (requestId: string) => {
      if (isLoading) return;
      setIsLoading(true);
      const prev = status;

      setStatus("none");

      const result = await declineConnectionRequest(requestId);
      if (!result.success) {
        setStatus(prev);
      }

      setIsLoading(false);
    },
    [isLoading, status],
  );

  return { status, isLoading, sendRequest, declineRequest };
}
