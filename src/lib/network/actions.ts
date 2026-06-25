"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAuth, type ActionResult } from "@/lib/actions";
import type { Profile } from "@/types";
import { revalidatePath } from "next/cache";

// ── Get Suggested Profiles ──────────────────────────────────────────

export async function getSuggestedProfiles(
  limit = 12,
): Promise<Profile[]> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let query = supabase
    .from("profiles")
    .select("*")
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (user) {
    query = query.neq("id", user.id);
  }

  const { data, error } = await query;

  if (error || !data) {
    console.error("Failed to fetch suggested profiles:", error?.message);
    return [];
  }

  return data as unknown as Profile[];
}

// ── Follow / Unfollow ───────────────────────────────────────────────

export async function followUser(targetUserId: string): Promise<ActionResult> {
  const auth = await requireAuth();
  if (!auth.ok) return auth;
  const { user, supabase } = auth;

  if (user.id === targetUserId) {
    return { success: false, error: "You cannot follow yourself." };
  }

  const { error } = await supabase
    .from("follows")
    .insert({ follower_id: user.id, following_id: targetUserId });

  if (error) {
    // Ignore duplicate key errors (already following)
    if (error.code === "23505") {
      return { success: true };
    }
    return { success: false, error: error.message };
  }

  revalidatePath("/mynetwork");
  return { success: true };
}

export async function unfollowUser(targetUserId: string): Promise<ActionResult> {
  const auth = await requireAuth();
  if (!auth.ok) return auth;
  const { user, supabase } = auth;

  const { error } = await supabase
    .from("follows")
    .delete()
    .eq("follower_id", user.id)
    .eq("following_id", targetUserId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/mynetwork");
  return { success: true };
}

// ── Check Follow Status ─────────────────────────────────────────────

export async function isFollowing(targetUserId: string): Promise<boolean> {
  const auth = await requireAuth();
  if (!auth.ok) return false;
  const { user, supabase } = auth;

  const { data } = await supabase
    .from("follows")
    .select("follower_id")
    .eq("follower_id", user.id)
    .eq("following_id", targetUserId)
    .maybeSingle();

  return !!data;
}

// ── Get Follow Counts ───────────────────────────────────────────────

export async function getFollowerCount(userId: string): Promise<number> {
  const supabase = await createClient();

  const { count } = await supabase
    .from("follows")
    .select("follower_id", { count: "exact", head: true })
    .eq("following_id", userId);

  return count ?? 0;
}

export async function getFollowingCount(userId: string): Promise<number> {
  const supabase = await createClient();

  const { count } = await supabase
    .from("follows")
    .select("follower_id", { count: "exact", head: true })
    .eq("follower_id", userId);

  return count ?? 0;
}

// ── Batch: check follow status + counts ─────────────────────────────

export async function getFollowInfo(targetUserId: string) {
  const [followerCount, followingCount] = await Promise.all([
    getFollowerCount(targetUserId),
    getFollowingCount(targetUserId),
  ]);

  const auth = await requireAuth();
  let isFollowingTarget = false;

  if (auth.ok) {
    const { user, supabase } = auth;
    const { data } = await supabase
      .from("follows")
      .select("follower_id")
      .eq("follower_id", user.id)
      .eq("following_id", targetUserId)
      .maybeSingle();

    isFollowingTarget = !!data;
  }

  return { followerCount, followingCount, isFollowing: isFollowingTarget };
}
