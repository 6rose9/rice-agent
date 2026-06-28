"use client";

import { useState } from "react";
import Link from "next/link";
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "@/components/ui/hover-card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchPostLikers } from "@/lib/posts/actions";
import type { PostLiker } from "@/lib/posts/actions";

interface PostLikersProps {
  postId: string;
  likeCount: number;
  isAuthenticated?: boolean;
  children: React.ReactNode;
}

export function PostLikers({ postId, likeCount, isAuthenticated = false, children }: PostLikersProps) {
  const [likers, setLikers] = useState<PostLiker[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);

  function handleOpenChange(open: boolean) {
    if (open && !fetched && likeCount > 0) {
      setLoading(true);
      fetchPostLikers(postId)
        .then(setLikers)
        .catch(console.error)
        .finally(() => {
          setLoading(false);
          setFetched(true);
        });
    }
  }

  if (!isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <HoverCard onOpenChange={handleOpenChange}>
      <HoverCardTrigger render={<span />}>{children}</HoverCardTrigger>
      <HoverCardContent className="w-64 p-3">
        {likeCount === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-1">
            No likes yet
          </p>
        ) : loading ? (
          <div className="space-y-2">
            {Array.from({ length: Math.min(3, likeCount) }).map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-1 max-h-48 overflow-y-auto">
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Handshake by
            </p>
            {likers.map((liker) => (
              <Link
                key={liker.id}
                href={`/profile/${liker.username}`}
                className="flex items-center gap-2 rounded-md px-1 py-1.5 hover:bg-accent transition-colors"
              >
                <Avatar size="sm">
                  <AvatarImage src={liker.avatar_url ?? undefined} />
                  <AvatarFallback>
                    {(liker.full_name ?? liker.username ?? "?")[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium truncate">
                  {liker.full_name || liker.username}
                </span>
              </Link>
            ))}
          </div>
        )}
      </HoverCardContent>
    </HoverCard>
  );
}
