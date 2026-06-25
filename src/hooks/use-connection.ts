"use client";

import { useState, useCallback } from "react";
import {
  sendConnectionRequest,
  declineConnectionRequest,
  type ConnectionStatus,
} from "@/lib/network/actions";

export function useConnection(initialStatus: ConnectionStatus) {
  const [status, setStatus] = useState<ConnectionStatus>(initialStatus);
  const [isLoading, setIsLoading] = useState(false);

  const sendRequest = useCallback(
    async (targetUserId: string) => {
      if (isLoading) return;
      setIsLoading(true);
      const prev = status;

      // Optimistic
      setStatus("pending_sent");

      const result = await sendConnectionRequest(targetUserId);
      if (!result.success) {
        setStatus(prev);
      }

      setIsLoading(false);
    },
    [isLoading, status],
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
