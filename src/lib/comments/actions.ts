"use server";

import { commentSchema } from "@/lib/validations/comment";
import type { Comment, Profile } from "@/types";
import { ActionResult, extractFirstFieldError, requireAuth } from "@/lib/actions";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// ── Types ─────────────────────────────────────────────────────────────

interface CommentRow {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

/** Fallback profile for missing/soft-deleted authors */
const UNKNOWN_PROFILE: Profile = {
  id: "unknown",
  phone: "",
  email: null,
  username: "unknown",
  full_name: "Unknown User",
  role: "general_user",
  avatar_url: null,
  cover_url: null,
  bio: null,
  region_id: 0,
  township_id: 0,
  market_status_id: null,
  phone_verified: false,
  phone_visibility: "private",
  email_visibility: "private",
  connections_visibility: "private",
  created_at: "",
  updated_at: "",
};

// ── Get Comments ──────────────────────────────────────────────────────

export async function getComments(
  postId: string,
  cursor?: string,
  pageSize = 20,
): Promise<{ comments: Comment[]; nextCursor: string | null }> {
  const supabase = await createClient();

  let query = supabase
    .from("comments")
    .select("*")
    .eq("post_id", postId)
    .order("created_at", { ascending: true })
    .limit(pageSize + 1);

  if (cursor) {
    query = query.gt("created_at", cursor);
  }

  const { data: rows, error } = await query;

  if (error || !rows) {
    console.error("Failed to fetch comments:", error?.message);
    return { comments: [], nextCursor: null };
  }

  // If unauthenticated, return empty (comments require auth per RLS)
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { comments: [], nextCursor: null };
  }

  const hasMore = rows.length > pageSize;
  const commentRows = hasMore ? rows.slice(0, pageSize) : rows;
  const lastRow = commentRows[commentRows.length - 1];
  const nextCursor = hasMore ? lastRow.created_at : null;

  // Fetch author profiles
  const authorIds = [...new Set(commentRows.map((c) => c.author_id))];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .in("id", authorIds);

  const profileMap = new Map(
    (profiles ?? []).map((p) => [p.id, p as unknown as Profile]),
  );

  const comments: Comment[] = commentRows.map((row) => {
    const r = row as unknown as CommentRow;
    return {
      id: r.id,
      post_id: r.post_id,
      content: r.content,
      created_at: r.created_at,
      updated_at: r.updated_at,
      author: profileMap.get(r.author_id) ?? { ...UNKNOWN_PROFILE, id: r.author_id },
    };
  });

  return { comments, nextCursor };
}

// ── Create Comment ────────────────────────────────────────────────────

export async function createComment(
  postId: string,
  _prevState: ActionResult<Comment> | null,
  formData: FormData,
): Promise<ActionResult<Comment>> {
  const rawData = {
    content: formData.get("content") as string,
  };

  const parsed = commentSchema.safeParse(rawData);
  if (!parsed.success) {
    const fe = parsed.error.flatten().fieldErrors;
    const msg = extractFirstFieldError(fe, "content") || "Invalid input.";
    return { success: false, error: msg };
  }

  const auth = await requireAuth();
  if (!auth.ok) return auth;
  const { user, supabase } = auth;

  try {
    const { data: row, error: insertError } = await supabase
      .from("comments")
      .insert({
        post_id: postId,
        author_id: user.id,
        content: parsed.data.content,
      })
      .select("*")
      .single();

    if (insertError || !row) {
      console.error("Failed to create comment:", insertError?.message);
      return {
        success: false,
        error: "Failed to create comment. Please try again.",
      };
    }

    // Fetch the author profile
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    const r = row as unknown as CommentRow;
    const comment: Comment = {
      id: r.id,
      post_id: r.post_id,
      content: r.content,
      created_at: r.created_at,
      updated_at: r.updated_at,
      author: profileData
        ? (profileData as unknown as Profile)
        : { ...UNKNOWN_PROFILE, id: user.id },
    };

    revalidatePath("/feed");
    return { success: true, data: comment };
  } catch (err) {
    console.error("Create comment error:", err);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

// ── Delete Comment ────────────────────────────────────────────────────

export async function deleteComment(commentId: string): Promise<ActionResult> {
  const auth = await requireAuth();
  if (!auth.ok) return auth;
  const { user, supabase } = auth;

  try {
    // Verify ownership
    const { data: existing } = await supabase
      .from("comments")
      .select("author_id")
      .eq("id", commentId)
      .maybeSingle();

    if (!existing || existing.author_id !== user.id) {
      return { success: false, error: "You can only delete your own comments." };
    }

    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("id", commentId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/feed");
    return { success: true };
  } catch (err) {
    console.error("Delete comment error:", err);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}
