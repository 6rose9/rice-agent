"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Handshake, MessageCircle, Share2, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { savePost, unsavePost, likePost, unlikePost } from "@/lib/posts/actions";

interface PostActionsProps {
  postId: string;
  reactionCount: number;
  commentCount: number;
  isLiked?: boolean;
  isSaved?: boolean;
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
  onComment,
  onSave,
  isAuthenticated = false,
}: PostActionsProps) {
  const router = useRouter();
  const [liked, setLiked] = useState(isLiked);
  const [saved, setSaved] = useState(isSaved);
  const [likes, setLikes] = useState(reactionCount);
  const [saving, setSaving] = useState(false);
  const [liking, setLiking] = useState(false);

  function requireAuth(action: () => void) {
    if (isAuthenticated) {
      action();
    } else {
      const returnTo = encodeURIComponent(window.location.pathname);
      router.push(`/login?redirect=${returnTo}`);
    }
  }

  async function handleLike() {
    requireAuth(async () => {
      if (liking) return;
      setLiking(true);
      const newLiked = !liked;
      setLiked(newLiked);
      setLikes((c) => newLiked ? c + 1 : c - 1);
      try {
        if (newLiked) {
          await likePost(postId);
        } else {
          await unlikePost(postId);
        }
      } catch (err) {
        console.error("Failed to toggle like:", err);
        setLiked(!newLiked);
        setLikes((c) => newLiked ? c - 1 : c + 1);
      } finally {
        setLiking(false);
      }
    });
  }

  function handleComment() {
    requireAuth(() => {
      onComment?.(postId);
    });
  }

  async function handleSave() {
    requireAuth(async () => {
      if (saving) return;
      setSaving(true);
      const newSaved = !saved;
      setSaved(newSaved);
      try {
        if (newSaved) {
          await savePost(postId);
        } else {
          await unsavePost(postId);
        }
        onSave?.(postId);
      } catch (err) {
        console.error("Failed to toggle bookmark:", err);
        // Revert on error
        setSaved(!newSaved);
      } finally {
        setSaving(false);
      }
    });
  }

  const [copied, setCopied] = useState(false);

  function handleCopyLink() {
    const url = `${window.location.origin}/post/${postId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex items-center gap-1 pt-1">
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "gap-1.5 h-8 px-2 transition-transform hover:scale-110",
          liked && "text-yellow-500 hover:text-yellow-600"
        )}
        onClick={handleLike}
        disabled={liking}
      >
        <Handshake className="h-5 w-5" />
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

      <DropdownMenu>
        <DropdownMenuTrigger
          className="inline-flex items-center justify-center gap-1.5 rounded-md h-8 px-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
        >
          <Share2 className="h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={handleCopyLink}>
            {copied ? "Copied!" : "Copy Link"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="flex-1" />

      <Button
        variant="ghost"
        size="sm"
        className={cn("gap-1.5 h-8 px-2", saved && "text-primary")}
        onClick={handleSave}
        disabled={saving}
      >
        <Bookmark className={cn("h-4 w-4", saved && "fill-current")} />
      </Button>
    </div>
  );
}
