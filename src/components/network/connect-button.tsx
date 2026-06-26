"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { useConnection } from "@/hooks/use-connection";
import { Button } from "@/components/ui/button";
import { UserPlus, Clock, Loader2, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ConnectionStatus } from "@/lib/network/actions";

interface ConnectButtonProps {
  targetUserId: string;
  initialStatus: ConnectionStatus;
  onStatusChange?: (status: ConnectionStatus) => void;
  variant?: "default" | "outline";
  size?: "sm" | "default";
  className?: string;
}

export function ConnectButton({
  targetUserId,
  initialStatus,
  onStatusChange,
  variant = "default",
  size = "sm",
  className,
}: ConnectButtonProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { status, isLoading, sendRequest } = useConnection(initialStatus, onStatusChange);

  function handleClick(e: React.MouseEvent) {
    e.stopPropagation();
    e.preventDefault();

    if (!isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    if (status === "none") {
      sendRequest(targetUserId);
    }
  }

  // Already connected
  if (status === "connected") {
    return (
      <Button
        variant="outline"
        size={size}
        className={cn("rounded-full font-medium border-muted-foreground/30 text-muted-foreground", className)}
        disabled
      >
        <Check className="h-3.5 w-3.5 mr-1.5" />
        Connected
      </Button>
    );
  }

  // Request sent, waiting for response
  if (status === "pending_sent") {
    return (
      <Button
        variant="outline"
        size={size}
        className={cn("rounded-full font-medium", className)}
        disabled
      >
        {isLoading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Clock className="h-3.5 w-3.5 mr-1.5" />
        )}
        Pending
      </Button>
    );
  }

  // Received a request (show accept/decline — handled by InvitationCard)
  if (status === "pending_received") {
    return (
      <Button
        variant="outline"
        size={size}
        className={cn("rounded-full font-medium", className)}
        disabled
      >
        <Clock className="h-3.5 w-3.5 mr-1.5" />
        Request Received
      </Button>
    );
  }

  // No relationship — show Connect
  return (
    <Button
      variant={variant}
      size={size}
      className={cn("rounded-full font-medium", className)}
      onClick={handleClick}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <>
          <UserPlus className="h-3.5 w-3.5 mr-1.5" />
          Connect
        </>
      )}
    </Button>
  );
}
