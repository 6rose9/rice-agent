"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, MessageCircle, Share2, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PostActionsProps {
  postId: string;
  reactionCount: number;
  commentCount: number;
  isLiked?: boolean;
  isSaved?: boolean;
  onLike?: (postId: string) => void;
  onComment?: (postId: string) => void;
  onSave?: (postId: string) => void;
  /** If false, actions that require auth will navigate to /login */
  isAuthenticated?: boolean;
}

export function PostActions({
  postId,
  reactionCount,
  commentCount,
  isLiked = false,
  isSaved = false,
  onLike,
  onComment,
  onSave,
  isAuthenticated = false,
}: PostActionsProps) {
  const router = useRouter();
  const [liked, setLiked] = useState(isLiked);
  const [saved, setSaved] = useState(isSaved);
  const [likes, setLikes] = useState(reactionCount);

  function requireAuth(action: () => void) {
    if (isAuthenticated) {
      action();
    } else {
      const returnTo = encodeURIComponent(window.location.pathname);
      router.push(`/login?redirect=${returnTo}`);
    }
  }

  function handleLike() {
    requireAuth(() => {
      if (liked) {
        setLiked(false);
        setLikes((c) => c - 1);
      } else {
        setLiked(true);
        setLikes((c) => c + 1);
      }
      onLike?.(postId);
    });
  }

  function handleComment() {
    requireAuth(() => {
      onComment?.(postId);
    });
  }

  function handleSave() {
    requireAuth(() => {
      setSaved(!saved);
      onSave?.(postId);
    });
  }

  function handleShare() {
    if (navigator.share) {
      navigator.share({
        title: "စပါးအောင်သွယ် Post",
        url: `${window.location.origin}/post/${postId}`,
      });
    } else {
      navigator.clipboard.writeText(
        `${window.location.origin}/post/${postId}`
      );
    }
  }

  return (
    <div className="flex items-center gap-1 pt-1">
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "gap-1.5 h-8 px-2",
          liked && "text-red-500 hover:text-red-600"
        )}
        onClick={handleLike}
      >
        <Heart className={cn("h-4 w-4", liked && "fill-current")} />
        {likes > 0 && <span className="text-xs">{likes}</span>}
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className="gap-1.5 h-8 px-2"
        onClick={handleComment}
      >
        <MessageCircle className="h-4 w-4" />
        {commentCount > 0 && <span className="text-xs">{commentCount}</span>}
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className="gap-1.5 h-8 px-2"
        onClick={handleShare}
      >
        <Share2 className="h-4 w-4" />
      </Button>

      <div className="flex-1" />

      <Button
        variant="ghost"
        size="sm"
        className={cn("gap-1.5 h-8 px-2", saved && "text-primary")}
        onClick={handleSave}
      >
        <Bookmark className={cn("h-4 w-4", saved && "fill-current")} />
      </Button>
    </div>
  );
}
