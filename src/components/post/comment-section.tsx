"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/components/auth/auth-provider";
import { mockComments, timeAgo } from "@/lib/mock-data";
import type { Comment } from "@/types";
import { Loader2, Send } from "lucide-react";
import Link from "next/link";

interface CommentSectionProps {
  postId: string;
}

export function CommentSection({ postId }: CommentSectionProps) {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const [comments, setComments] = useState<Comment[]>(
    mockComments[postId] || []
  );
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newComment.trim()) return;

    if (!isAuthenticated) {
      const returnTo = encodeURIComponent(window.location.pathname);
      router.push(`/login?redirect=${returnTo}`);
      return;
    }

    setSubmitting(true);
    // Mock add comment
    setTimeout(() => {
      const fallbackAuthor = {
        id: user?.profile.id || "",
        phone: user?.profile.phone || "",
        email: user?.profile.email || null,
        username: user?.profile.username || "",
        full_name: user?.profile.full_name || "You",
        role: user?.profile.role || "general_user",
        avatar_url: null,
        cover_url: null,
        bio: null,
        region_id: 15,
        township_id: 1,
        market_status_id: null,
        phone_verified: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const comment: Comment = {
        id: `comment-${Date.now()}`,
        post_id: postId,
        author_id: user?.profile.id || "",
        author: user?.profile || fallbackAuthor,
        content: newComment.trim(),
        created_at: new Date().toISOString(),
      };
      setComments((prev) => [...prev, comment]);
      setNewComment("");
      setSubmitting(false);
    }, 400);
  }

  return (
    <div className="border-t px-4 py-3 space-y-3">
      {/* Existing comments */}
      {comments.length > 0 && (
        <div className="space-y-3 max-h-[280px] overflow-y-auto">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-2.5">
              <Link href={`/profile/${comment.author.username}`}>
                <Avatar className="h-7 w-7 shrink-0">
                  <AvatarFallback className="text-[10px] bg-accent">
                    {comment.author.full_name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </Link>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/profile/${comment.author.username}`}
                    className="text-xs font-semibold hover:text-primary"
                  >
                    {comment.author.full_name}
                  </Link>
                  <span className="text-[10px] text-muted-foreground">
                    {timeAgo(comment.created_at)}
                  </span>
                </div>
                <p className="text-sm mt-0.5 break-words">{comment.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Comment input */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <Avatar className="h-7 w-7 shrink-0">
          <AvatarFallback className="text-[10px] bg-accent">
            {user?.profile.full_name?.charAt(0) || "?"}
          </AvatarFallback>
        </Avatar>
        <Input
          type="text"
          placeholder={isAuthenticated ? "Write a comment..." : "Sign in to comment"}
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onClick={() => {
            if (!isAuthenticated) {
              const returnTo = encodeURIComponent(window.location.pathname);
              router.push(`/login?redirect=${returnTo}`);
            }
          }}
          className="h-8 text-sm flex-1"
        />
        <Button
          type="submit"
          size="icon"
          className="h-8 w-8 shrink-0"
          disabled={!newComment.trim() || submitting || !isAuthenticated}
        >
          {submitting ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Send className="h-3.5 w-3.5" />
          )}
        </Button>
      </form>
    </div>
  );
}
