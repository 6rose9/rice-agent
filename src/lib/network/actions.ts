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
    console.error("Follow user error:", error.message);
    return { success: false, error: "Failed to follow user. Please try again." };
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
    console.error("Unfollow user error:", error.message);
    return { success: false, error: "Failed to unfollow user. Please try again." };
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

// ── Batch: check follow status for multiple users ───────────────────

export async function getFollowingSet(userIds: string[]): Promise<Set<string>> {
  if (userIds.length === 0) return new Set();

  const auth = await requireAuth();
  if (!auth.ok) return new Set();
  const { user, supabase } = auth;

  const { data } = await supabase
    .from("follows")
    .select("following_id")
    .eq("follower_id", user.id)
    .in("following_id", userIds);

  return new Set((data ?? []).map((r) => r.following_id));
}

// ── Connection Request: Send ────────────────────────────────────────

export async function sendConnectionRequest(targetUserId: string): Promise<ActionResult> {
  const auth = await requireAuth();
  if (!auth.ok) return auth;
  const { user, supabase } = auth;

  if (user.id === targetUserId) {
    return { success: false, error: "You cannot connect with yourself." };
  }

  // Check if already connected
  const [u1, u2] = [user.id, targetUserId].sort();
  const { data: existingConn } = await supabase
    .from("connections")
    .select("user1_id")
    .eq("user1_id", u1)
    .eq("user2_id", u2)
    .maybeSingle();

  if (existingConn) {
    return { success: false, error: "Already connected." };
  }

  // Check for existing request in either direction
  const { data: existingRequest } = await supabase
    .from("connection_requests")
    .select("id, status")
    .or(`and(sender_id.eq.${user.id},receiver_id.eq.${targetUserId}),and(sender_id.eq.${targetUserId},receiver_id.eq.${user.id})`)
    .maybeSingle();

  if (existingRequest) {
    if (existingRequest.status === "pending") {
      return { success: false, error: "Request already pending." };
    }
    // If declined, allow re-send by updating the old request
    const { error } = await supabase
      .from("connection_requests")
      .update({ status: "pending", updated_at: new Date().toISOString() })
      .eq("id", existingRequest.id);

    if (error) {
      console.error("Resend connection request error:", error.message);
      return { success: false, error: "Failed to send request. Please try again." };
    }
    revalidatePath("/mynetwork");
    revalidatePath(`/profile`);
    return { success: true };
  }

  const { error } = await supabase
    .from("connection_requests")
    .insert({ sender_id: user.id, receiver_id: targetUserId });

  if (error) {
    console.error("Send connection request error:", error.message);
    return { success: false, error: "Failed to send request. Please try again." };
  }

  revalidatePath("/mynetwork");
  revalidatePath(`/profile`);
  return { success: true };
}

// ── Connection Request: Accept ──────────────────────────────────────

export async function acceptConnectionRequest(requestId: string): Promise<ActionResult> {
  const auth = await requireAuth();
  if (!auth.ok) return auth;
  const { user, supabase } = auth;

  // Fetch the request
  const { data: request, error: fetchError } = await supabase
    .from("connection_requests")
    .select("id, sender_id, receiver_id, status")
    .eq("id", requestId)
    .maybeSingle();

  if (fetchError || !request) {
    return { success: false, error: "Request not found." };
  }

  if (request.receiver_id !== user.id) {
    return { success: false, error: "Only the receiver can accept." };
  }

  if (request.status !== "pending") {
    return { success: false, error: "Request is no longer pending." };
  }

  // Create connection with canonical ordering (user1 < user2)
  const [u1, u2] = [request.sender_id, request.receiver_id].sort();
  const { error: connError } = await supabase
    .from("connections")
    .insert({ user1_id: u1, user2_id: u2 });

  if (connError) {
    // Ignore duplicate (already connected)
    if (connError.code !== "23505") {
      console.error("Accept connection error:", connError.message);
      return { success: false, error: "Failed to accept request. Please try again." };
    }
  }

  // Delete the request
  await supabase.from("connection_requests").delete().eq("id", requestId);

  revalidatePath("/mynetwork");
  revalidatePath(`/profile`);
  return { success: true };
}

// ── Connection Request: Decline / Cancel ────────────────────────────

export async function declineConnectionRequest(requestId: string): Promise<ActionResult> {
  const auth = await requireAuth();
  if (!auth.ok) return auth;
  const { user, supabase } = auth;

  const { data: request } = await supabase
    .from("connection_requests")
    .select("sender_id, receiver_id")
    .eq("id", requestId)
    .maybeSingle();

  if (!request) {
    return { success: false, error: "Request not found." };
  }

  // Either sender (cancel) or receiver (decline) can delete
  if (request.sender_id !== user.id && request.receiver_id !== user.id) {
    return { success: false, error: "Not authorized." };
  }

  const { error } = await supabase.from("connection_requests").delete().eq("id", requestId);

  if (error) {
    console.error("Decline connection request error:", error.message);
    return { success: false, error: "Failed to decline request. Please try again." };
  }

  revalidatePath("/mynetwork");
  return { success: true };
}

// ── Connection Request: Get Status ──────────────────────────────────

export type ConnectionStatus =
  | "none"
  | "pending_sent"
  | "pending_received"
  | "connected";

export async function getConnectionStatus(targetUserId: string): Promise<ConnectionStatus> {
  const auth = await requireAuth();
  if (!auth.ok) return "none";
  const { user, supabase } = auth;

  // Check if connected
  const [u1, u2] = [user.id, targetUserId].sort();
  const { data: conn } = await supabase
    .from("connections")
    .select("user1_id")
    .eq("user1_id", u1)
    .eq("user2_id", u2)
    .maybeSingle();

  if (conn) return "connected";

  // Check for pending request
  const { data: request } = await supabase
    .from("connection_requests")
    .select("sender_id, status")
    .or(`and(sender_id.eq.${user.id},receiver_id.eq.${targetUserId}),and(sender_id.eq.${targetUserId},receiver_id.eq.${user.id})`)
    .eq("status", "pending")
    .maybeSingle();

  if (!request) return "none";

  return request.sender_id === user.id ? "pending_sent" : "pending_received";
}

// ── Connection Request: Get Pending Invitations ─────────────────────

export interface ConnectionRequestRow {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: string;
  created_at: string;
  sender: Profile;
}

export interface SentRequestRow {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: string;
  created_at: string;
  receiver: Profile;
}

export async function getPendingRequests(): Promise<ConnectionRequestRow[]> {
  const auth = await requireAuth();
  if (!auth.ok) return [];
  const { user, supabase } = auth;

  const { data: requests, error } = await supabase
    .from("connection_requests")
    .select("*")
    .eq("receiver_id", user.id)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error || !requests || requests.length === 0) {
    return [];
  }

  // Fetch sender profiles
  const senderIds = [...new Set(requests.map((r) => r.sender_id))];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .in("id", senderIds);

  const profileMap = new Map(
    (profiles ?? []).map((p) => [p.id, p as unknown as Profile]),
  );

  return requests.map((r) => ({
    ...r,
    sender: profileMap.get(r.sender_id) ?? ({} as Profile),
  }));
}

// ── Get Pending Sent Requests ──────────────────────────────────────

export async function getPendingSentRequests(): Promise<SentRequestRow[]> {
  const auth = await requireAuth();
  if (!auth.ok) return [];
  const { user, supabase } = auth;

  const { data: requests, error } = await supabase
    .from("connection_requests")
    .select("*")
    .eq("sender_id", user.id)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error || !requests || requests.length === 0) {
    return [];
  }

  // Fetch receiver profiles
  const receiverIds = [...new Set(requests.map((r) => r.receiver_id))];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .in("id", receiverIds);

  const profileMap = new Map(
    (profiles ?? []).map((p) => [p.id, p as unknown as Profile]),
  );

  return requests.map((r) => ({
    ...r,
    receiver: profileMap.get(r.receiver_id) ?? ({} as Profile),
  }));
}

// ── Connection Count ────────────────────────────────────────────────

export async function getConnectionCount(userId: string): Promise<number> {
  const supabase = await createClient();

  const { count } = await supabase
    .from("connections")
    .select("user1_id", { count: "exact", head: true })
    .or(`user1_id.eq.${userId},user2_id.eq.${userId}`);

  return count ?? 0;
}

// ── Batch: connection status for multiple users ─────────────────────

export async function getConnectionStatusMap(
  userIds: string[],
): Promise<Map<string, ConnectionStatus>> {
  if (userIds.length === 0) return new Map();

  const auth = await requireAuth();
  if (!auth.ok) return new Map();
  const { user, supabase } = auth;

  const statusMap = new Map<string, ConnectionStatus>();

  // Check connections
  const { data: conns } = await supabase
    .from("connections")
    .select("user1_id, user2_id")
    .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);

  for (const conn of conns ?? []) {
    const otherId = conn.user1_id === user.id ? conn.user2_id : conn.user1_id;
    if (userIds.includes(otherId)) {
      statusMap.set(otherId, "connected");
    }
  }

  // Check pending requests
  const { data: requests } = await supabase
    .from("connection_requests")
    .select("sender_id, receiver_id, status")
    .eq("status", "pending")
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);

  for (const req of requests ?? []) {
    const otherId = req.sender_id === user.id ? req.receiver_id : req.sender_id;
    if (userIds.includes(otherId) && !statusMap.has(otherId)) {
      statusMap.set(otherId, req.sender_id === user.id ? "pending_sent" : "pending_received");
    }
  }

  // Fill remaining as "none"
  for (const id of userIds) {
    if (!statusMap.has(id)) {
      statusMap.set(id, "none");
    }
  }

  return statusMap;
}

// ── Get Connected Profiles ──────────────────────────────────────────

export async function getConnectedProfiles(): Promise<Profile[]> {
  const auth = await requireAuth();
  if (!auth.ok) return [];
  const { user, supabase } = auth;

  const { data: connections, error } = await supabase
    .from("connections")
    .select("user1_id, user2_id")
    .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);

  if (error || !connections || connections.length === 0) {
    return [];
  }

  const otherUserIds = connections.map((c) =>
    c.user1_id === user.id ? c.user2_id : c.user1_id,
  );

  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .in("id", otherUserIds)
    .is("deleted_at", null);

  return (profiles ?? []) as unknown as Profile[];
}

// ── Connection: Remove ─────────────────────────────────────────────

export async function removeConnection(targetUserId: string): Promise<ActionResult> {
  const auth = await requireAuth();
  if (!auth.ok) return auth;
  const { user, supabase } = auth;

  const [u1, u2] = [user.id, targetUserId].sort();
  const { error } = await supabase
    .from("connections")
    .delete()
    .eq("user1_id", u1)
    .eq("user2_id", u2);

  if (error) {
    console.error("Remove connection error:", error.message);
    return { success: false, error: "Failed to remove connection. Please try again." };
  }

  revalidatePath("/mynetwork");
  return { success: true };
}

// ── Get Following Profiles ─────────────────────────────────────────

export async function getFollowingProfiles(): Promise<Profile[]> {
  const auth = await requireAuth();
  if (!auth.ok) return [];
  const { user, supabase } = auth;

  const { data: follows, error } = await supabase
    .from("follows")
    .select("following_id")
    .eq("follower_id", user.id);

  if (error || !follows || follows.length === 0) {
    return [];
  }

  const followingIds = follows.map((f) => f.following_id);
  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .in("id", followingIds)
    .is("deleted_at", null);

  return (profiles ?? []) as unknown as Profile[];
}

// ── Batch: profile + connection status + follow status ──────────────

export async function getSuggestedProfilesWithStatus(limit = 12) {
  const profiles = await getSuggestedProfiles(limit);
  if (profiles.length === 0) return [];

  const userIds = profiles.map((p) => p.id);

  const [connectionStatusMap, followingSet] = await Promise.all([
    getConnectionStatusMap(userIds),
    getFollowingSet(userIds),
  ]);

  return profiles
    .filter((profile) => {
      const status = connectionStatusMap.get(profile.id);
      return status !== "connected" && status !== "pending_received" && status !== "pending_sent";
    })
    .map((profile) => ({
      profile,
      connectionStatus: connectionStatusMap.get(profile.id) ?? ("none" as ConnectionStatus),
      isFollowing: followingSet.has(profile.id),
    }));
}
