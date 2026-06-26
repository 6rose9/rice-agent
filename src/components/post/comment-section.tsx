"use client";

import { useState, useEffect, useActionState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/components/auth/auth-provider";
import { getComments, createComment, deleteComment } from "@/lib/comments/actions";
import { formatRelativeTime } from "@/lib/utils/format";
import type { Comment } from "@/types";
import type { ActionResult } from "@/lib/actions";
import { Loader2, Send, Trash2 } from "lucide-react";
import Link from "next/link";

interface CommentSectionProps {
  postId: string;
}

export function CommentSection({ postId }: CommentSectionProps) {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const formRef = useRef<HTMLFormElement>(null);

  // Fetch comments on mount
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const { comments: fetched } = await getComments(postId);
      if (!cancelled) {
        setComments(fetched);
        setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [postId]);

  // Server action for creating comments
  const [createState, createAction, createPending] = useActionState(
    async (_prev: ActionResult | null, formData: FormData): Promise<ActionResult> => {
      const result = await createComment(postId, _prev, formData);
      if (result.success && result.data) {
        setComments((prev) => [...prev, result.data!]);
        formRef.current?.reset();
      }
      return result;
    },
    null,
  );

  async function handleDelete(commentId: string) {
    const result = await deleteComment(commentId);
    if (result.success) {
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    }
  }

  function handleInputClick() {
    if (!isAuthenticated) {
      const returnTo = encodeURIComponent(window.location.pathname);
      router.push(`/login?redirect=${returnTo}`);
    }
  }

  return (
    <div className="border-t px-4 py-3 space-y-3">
      {/* Existing comments */}
      {loading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      ) : comments.length > 0 ? (
        <div className="space-y-3 max-h-[280px] overflow-y-auto">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-2.5 group">
              <Link href={`/profile/${comment.author.username}`}>
                <Avatar className="h-7 w-7 shrink-0">
                  <AvatarImage src={comment.author.avatar_url ?? undefined} />
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
                    {formatRelativeTime(comment.created_at)}
                  </span>
                  {user?.profile.id === comment.author_id && (
                    <button
                      type="button"
                      onClick={() => handleDelete(comment.id)}
                      className="ml-auto opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
                      aria-label="Delete comment"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
                <p className="text-sm mt-0.5 break-words">{comment.content}</p>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {/* Comment input */}
      <form
        ref={formRef}
        action={createAction}
        className="flex items-center gap-2"
      >
        <Avatar className="h-7 w-7 shrink-0">
          <AvatarImage src={user?.profile.avatar_url ?? undefined} />
          <AvatarFallback className="text-[10px] bg-accent">
            {user?.profile.full_name?.charAt(0) || "?"}
          </AvatarFallback>
        </Avatar>
        <Input
          type="text"
          name="content"
          placeholder={isAuthenticated ? "Write a comment..." : "Sign in to comment"}
          onClick={handleInputClick}
          disabled={!isAuthenticated || createPending}
          className="h-8 text-sm flex-1"
          autoComplete="off"
        />
        <Button
          type="submit"
          size="icon"
          className="h-8 w-8 shrink-0"
          disabled={!isAuthenticated || createPending}
        >
          {createPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Send className="h-3.5 w-3.5" />
          )}
        </Button>
      </form>

      {/* Error message */}
      {createState && !createState.success && (
        <p className="text-xs text-destructive px-9">{createState.error}</p>
      )}
    </div>
  );
}
