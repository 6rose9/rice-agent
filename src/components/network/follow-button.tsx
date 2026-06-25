"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { useFollow } from "@/hooks/use-follow";
import { Button } from "@/components/ui/button";
import { UserPlus, UserCheck, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface FollowButtonProps {
  targetUserId: string;
  initialIsFollowing: boolean;
  variant?: "default" | "outline";
  size?: "sm" | "default";
  className?: string;
}

export function FollowButton({
  targetUserId,
  initialIsFollowing,
  variant = "default",
  size = "sm",
  className,
}: FollowButtonProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { isFollowing, isLoading, toggle } = useFollow(initialIsFollowing);

  function handleClick(e: React.MouseEvent) {
    e.stopPropagation();
    e.preventDefault();

    if (!isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    toggle(targetUserId);
  }

  return (
    <Button
      variant={isFollowing ? "outline" : variant}
      size={size}
      className={cn(
        "rounded-full font-medium",
        isFollowing && "border-muted-foreground/30 text-muted-foreground hover:text-foreground hover:border-foreground/50",
        className,
      )}
      onClick={handleClick}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : isFollowing ? (
        <>
          <UserCheck className="h-3.5 w-3.5 mr-1.5" />
          Following
        </>
      ) : (
        <>
          <UserPlus className="h-3.5 w-3.5 mr-1.5" />
          Follow
        </>
      )}
    </Button>
  );
}
