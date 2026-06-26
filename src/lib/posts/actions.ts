"use server";

import { createClient } from "@/lib/supabase/server";
import { postSchema } from "@/lib/validations/post";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Post, PostImage, Profile } from "@/types";
import { ActionResult, extractFirstFieldError, requireAuth } from "@/lib/actions";
import { reportPostSchema } from "@/lib/validations/post";
import { revalidatePath, revalidateTag } from "next/cache";

// ── Types ─────────────────────────────────────────────────────────────

// Raw DB row shapes for joined queries
interface PostRow {
  id: string;
  author_id: string;
  type: string;
  content: string;
  rice_type: string | null;
  rice_name: string | null;
  price: number | null;
  quantity: number | null;
  unit: string | null;
  address: string | null;
  region: string | null;
  township: string | null;
  location: string | null;
  easy_to_carry: boolean | null;
  pound_per_bag: number | null;
  paddy_condition: string | null;
  badge: string | null;
  reaction_count: number;
  comment_count: number;
  is_active?: boolean;
  latitude?: number | null;
  longitude?: number | null;
  created_at: string;
  updated_at: string;
}

interface PostImageRow {
  id: string;
  post_id: string;
  url: string;
  sort_order: number;
}

// ── Shared Helpers ────────────────────────────────────────────────────

/** Encode a cursor from created_at + id for composite pagination */
function encodeCursor(created_at: string, id: string): string {
  return `${created_at}|${id}`;
}

/** Decode a composite cursor back into [created_at, id] */
function decodeCursor(cursor: string): [string, string] {
  const idx = cursor.lastIndexOf("|");
  if (idx === -1) return [cursor, ""]; // fallback for legacy single-value cursors
  return [cursor.slice(0, idx), cursor.slice(idx + 1)];
}

/** Fallback profile for missing/soft-deleted authors */
const UNKNOWN_PROFILE: Profile = {
  id: "",
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
  created_at: "",
  updated_at: "",
};

/** Fetch profiles for a set of author IDs, returned as a Map */
async function fetchProfilesMap(
  supabase: SupabaseClient,
  authorIds: string[],
): Promise<Map<string, Profile>> {
  if (authorIds.length === 0) return new Map();

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .in("id", authorIds);

  return new Map(
    (data ?? []).map((p) => [p.id, p as unknown as Profile]),
  );
}

/** Fetch images for a set of post IDs, returned as a Map of postId → PostImage[] */
async function fetchImagesMap(
  supabase: SupabaseClient,
  postIds: string[],
): Promise<Map<string, PostImage[]>> {
  if (postIds.length === 0) return new Map();

  const { data } = await supabase
    .from("post_images")
    .select("*")
    .in("post_id", postIds)
    .order("sort_order");

  const map = new Map<string, PostImage[]>();
  for (const img of (data ?? []) as PostImageRow[]) {
    const list = map.get(img.post_id) ?? [];
    list.push({
      id: img.id,
      post_id: img.post_id,
      url: img.url,
      sort_order: img.sort_order,
    } as PostImage);
    map.set(img.post_id, list);
  }
  return map;
}

/** Fetch the set of post IDs that the current user has liked */
async function fetchLikedPostIds(
  supabase: SupabaseClient,
  postIds: string[],
): Promise<Set<string>> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Set();

  const { data } = await supabase
    .from("post_reactions")
    .select("post_id")
    .eq("user_id", user.id)
    .in("post_id", postIds);

  return new Set((data ?? []).map((r) => r.post_id));
}

/** Convert a raw PostRow into an application Post object */
function assemblePost(
  row: PostRow,
  author: Profile,
  images: PostImage[],
  extra?: Partial<Pick<Post, "is_saved" | "is_liked">>,
): Post {
  return {
    id: row.id,
    author_id: row.author_id,
    author,
    type: row.type as Post["type"],
    content: row.content,
    rice_type: row.rice_type ?? undefined,
    rice_name: row.rice_name ?? undefined,
    price: row.price ?? null,
    quantity: row.quantity ?? null,
    unit: row.unit ?? undefined,
    address: row.address ?? undefined,
    region: row.region ?? undefined,
    township: row.township ?? null,
    location: row.location ?? null,
    easy_to_carry: row.easy_to_carry ?? undefined,
    pound_per_bag: row.pound_per_bag ?? null,
    paddy_condition: (row.paddy_condition as Post["paddy_condition"]) ?? undefined,
    badge: (row.badge as Post["badge"]) ?? undefined,
    latitude: row.latitude,
    longitude: row.longitude,
    images,
    reaction_count: row.reaction_count,
    comment_count: row.comment_count,
    created_at: row.created_at,
    updated_at: row.updated_at,
    ...extra,
  };
}

// ── Get Single Post ────────────────────────────────────────────────

export async function getPost(postId: string): Promise<Post | null> {
  const supabase = await createClient();

  const { data: postRow, error } = await supabase
    .from("posts")
    .select("*")
    .eq("id", postId)
    .maybeSingle();

  if (error || !postRow) {
    return null;
  }

  const row = postRow as unknown as PostRow;

  const [{ data: profileData }, imagesMap, likedIds] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", row.author_id).maybeSingle(),
    fetchImagesMap(supabase, [row.id]),
    fetchLikedPostIds(supabase, [row.id]),
  ]);

  const author: Profile = profileData
    ? (profileData as unknown as Profile)
    : { ...UNKNOWN_PROFILE, id: row.author_id };

  return assemblePost(row, author, imagesMap.get(row.id) ?? [], {
    is_liked: likedIds.has(row.id),
  });
}

// ── Create Post ──────────────────────────────────────────────────────

export async function createPost(
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const postType = formData.get("type") as string;

  // Subscription gate: buying/selling posts require pro tier
  // Client sends tier as a hidden field; server validates.
  // (For demo/localStorage subscription — not cryptographically secure)
  if (postType === "buying" || postType === "selling") {
    const tier = formData.get("subscription_tier") as string;
    if (tier !== "pro" && tier !== "pro_plus") {
      return {
        success: false,
        error: "Buying and selling posts require a Pro subscription. Please upgrade to continue.",
      };
    }
  }

  // Extract all fields from FormData
  const rawData: Record<string, unknown> = {
    type: formData.get("type") as string,
    content: formData.get("content") as string,
    rice_type: (formData.get("rice_type") as string) || undefined,
    rice_name: (formData.get("rice_name") as string) || undefined,
    price: formData.get("price") || undefined,
    quantity: formData.get("quantity") || undefined,
    unit: (formData.get("unit") as string) || undefined,
    address: (formData.get("address") as string) || undefined,
    region: (formData.get("region") as string) || undefined,
    township: (formData.get("township") as string) || undefined,
    pound_per_bag: formData.get("pound_per_bag") || undefined,
    paddy_condition: (formData.get("paddy_condition") as string) || undefined,
    easy_to_carry: formData.get("easy_to_carry") || undefined,
    latitude: formData.get("latitude") || undefined,
    longitude: formData.get("longitude") || undefined,
  };

  // Validate with zod schema
  const parsed = postSchema.safeParse(rawData);
  if (!parsed.success) {
    const fe = parsed.error.flatten().fieldErrors;
    const msg =
      extractFirstFieldError(fe, "content", "rice_type", "price", "quantity", "pound_per_bag", "paddy_condition") ||
      "Invalid input.";
    return { success: false, error: msg };
  }

  const supabase = await createClient();

  // Get authenticated user
  const auth = await requireAuth();
  if (!auth.ok) return auth;
  const { user } = auth;

  // Image URLs (comma-separated string from form)
  const imageUrls = (formData.get("images") as string)
    ?.split(",")
    .map((u) => u.trim())
    .filter(Boolean) ?? [];

  try {
    // Build the insert payload from validated data
    const payload: Record<string, unknown> = {
      author_id: user.id,
      type: parsed.data.type,
      content: parsed.data.content,
    };

    // Add trading fields only for buying/selling
    if (parsed.data.type !== "general") {
      payload.rice_type = parsed.data.rice_type;
      payload.rice_name = parsed.data.rice_name || null;
      payload.price = parsed.data.price ?? null;
      payload.quantity = parsed.data.quantity ?? null;
      payload.unit = parsed.data.unit || null;
      payload.address = parsed.data.address || null;
      payload.region = parsed.data.region || null;
      payload.township = parsed.data.township || null;
      payload.easy_to_carry = parsed.data.easy_to_carry ?? null;
      payload.pound_per_bag = parsed.data.pound_per_bag ?? null;
      payload.paddy_condition = parsed.data.paddy_condition || null;
      payload.latitude = parsed.data.latitude ?? null;
      payload.longitude = parsed.data.longitude ?? null;
      // Premium posts get pro badge
      payload.badge = "pro";
    }

    // Insert post
    const { data: post, error: insertError } = await supabase
      .from("posts")
      .insert(payload)
      .select("id")
      .single();

    if (insertError || !post) {
      return {
        success: false,
        error: insertError?.message || "Failed to create post.",
      };
    }

    // Insert post images
    if (imageUrls.length > 0) {
      const imageRows = imageUrls.map((url, i) => ({
        post_id: post.id,
        url,
        sort_order: i,
      }));

      const { error: imageError } = await supabase
        .from("post_images")
        .insert(imageRows);

      if (imageError) {
        // Post was created but images failed — return success anyway
        // (the post is still valid without images)
        console.error("Failed to insert post images:", imageError.message);
      }
    }

    // Invalidate feed cache so new post appears on next visit
    revalidatePath("/feed");
    revalidateTag("posts", "default");

    return { success: true, redirect: "/feed" };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to create post.",
    };
  }
}

// ── Fetch Posts ──────────────────────────────────────────────────────

export async function getPosts(
  cursor?: string,
  pageSize = 20,
  type?: "buying" | "selling",
): Promise<{ posts: Post[]; nextCursor: string | null }> {
  const supabase = await createClient();

  // Fetch posts ordered by newest first, with cursor-based pagination
  // Cursor is a composite "created_at|id" to handle identical timestamps
  let query = supabase
    .from("posts")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(pageSize + 1); // fetch one extra to detect if there are more

  if (cursor) {
    const [cursorDate, cursorId] = decodeCursor(cursor);
    // Filter rows that come strictly before the cursor position
    // created_at < cursorDate, OR (created_at = cursorDate AND id < cursorId)
    query = query.or(
      `created_at.lt.${cursorDate},and(created_at.eq.${cursorDate},id.lt.${cursorId})`,
    );
  }

  if (type) {
    query = query.eq("type", type);
  }

  const { data: postRows, error: postError } = await query;

  if (postError || !postRows) {
    console.error("Failed to fetch posts:", postError?.message);
    return { posts: [], nextCursor: null };
  }

  const hasMore = postRows.length > pageSize;
  const rows = hasMore ? postRows.slice(0, pageSize) : postRows;
  const lastRow = rows[rows.length - 1];
  const nextCursor = hasMore
    ? encodeCursor(lastRow.created_at, lastRow.id)
    : null;

  const posts = rows as unknown as PostRow[];
  const authorIds = [...new Set(posts.map((p) => p.author_id))];
  const postIds = posts.map((p) => p.id);

  const [profileMap, imagesMap, likedIds] = await Promise.all([
    fetchProfilesMap(supabase, authorIds),
    fetchImagesMap(supabase, postIds),
    fetchLikedPostIds(supabase, postIds),
  ]);

  return {
    posts: posts.map((row) =>
      assemblePost(
        row,
        profileMap.get(row.author_id) ?? { ...UNKNOWN_PROFILE, id: row.author_id },
        imagesMap.get(row.id) ?? [],
        { is_liked: likedIds.has(row.id) },
      ),
    ),
    nextCursor,
  };
}

// ── Fetch Posts by Author ────────────────────────────────────────────

export async function getPostsByAuthor(
  authorId: string,
  authorProfile?: Profile,
): Promise<Post[]> {
  const supabase = await createClient();

  const { data: postRows, error: postError } = await supabase
    .from("posts")
    .select("*")
    .eq("author_id", authorId)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (postError || !postRows) {
    console.error("Failed to fetch author posts:", postError?.message);
    return [];
  }

  const posts = postRows as unknown as PostRow[];

  // Fetch the author profile (skip if already provided) + all images in parallel
  const postIds = posts.map((p) => p.id);
  const profilePromise = authorProfile
    ? Promise.resolve({ data: authorProfile as unknown as Record<string, unknown> })
    : supabase.from("profiles").select("*").eq("id", authorId).maybeSingle();

  const [{ data: profileData }, imagesMap, likedIds] = await Promise.all([
    profilePromise,
    fetchImagesMap(supabase, postIds),
    fetchLikedPostIds(supabase, postIds),
  ]);

  const resolvedProfile: Profile = profileData
    ? (profileData as unknown as Profile)
    : { ...UNKNOWN_PROFILE, id: authorId };

  return posts.map((row) =>
    assemblePost(row, resolvedProfile, imagesMap.get(row.id) ?? [], {
      is_liked: likedIds.has(row.id),
    }),
  );
}

// ── Update Post ──────────────────────────────────────────────────────

export async function updatePost(
  postId: string,
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const rawData: Record<string, unknown> = {
    type: formData.get("type") as string,
    content: formData.get("content") as string,
    rice_type: (formData.get("rice_type") as string) || undefined,
    rice_name: (formData.get("rice_name") as string) || undefined,
    price: formData.get("price") || undefined,
    quantity: formData.get("quantity") || undefined,
    unit: (formData.get("unit") as string) || undefined,
    address: (formData.get("address") as string) || undefined,
    region: (formData.get("region") as string) || undefined,
    township: (formData.get("township") as string) || undefined,
    pound_per_bag: formData.get("pound_per_bag") || undefined,
    paddy_condition: (formData.get("paddy_condition") as string) || undefined,
    easy_to_carry: formData.get("easy_to_carry") || undefined,
    latitude: formData.get("latitude") || undefined,
    longitude: formData.get("longitude") || undefined,
  };

  const parsed = postSchema.safeParse(rawData);
  if (!parsed.success) {
    const fe = parsed.error.flatten().fieldErrors;
    const msg =
      extractFirstFieldError(fe, "content", "rice_type", "price", "quantity", "pound_per_bag", "paddy_condition") ||
      "Invalid input.";
    return { success: false, error: msg };
  }

  const supabase = await createClient();
  const auth = await requireAuth();
  if (!auth.ok) return auth;
  const { user } = auth;

  // Verify ownership
  const { data: existing } = await supabase
    .from("posts")
    .select("author_id")
    .eq("id", postId)
    .maybeSingle();

  if (!existing || existing.author_id !== user.id) {
    return { success: false, error: "You can only edit your own posts." };
  }

  try {
    const payload: Record<string, unknown> = {
      type: parsed.data.type,
      content: parsed.data.content,
    };

    if (parsed.data.type !== "general") {
      payload.rice_type = parsed.data.rice_type;
      payload.rice_name = parsed.data.rice_name || null;
      payload.price = parsed.data.price ?? null;
      payload.quantity = parsed.data.quantity ?? null;
      payload.unit = parsed.data.unit || null;
      payload.address = parsed.data.address || null;
      payload.region = parsed.data.region || null;
      payload.township = parsed.data.township || null;
      payload.easy_to_carry = parsed.data.easy_to_carry ?? null;
      payload.pound_per_bag = parsed.data.pound_per_bag ?? null;
      payload.paddy_condition = parsed.data.paddy_condition || null;
      payload.latitude = parsed.data.latitude ?? null;
      payload.longitude = parsed.data.longitude ?? null;
      // Premium posts get pro badge
      payload.badge = "pro";
    } else {
      // General posts get free badge
      payload.badge = "free";
    }

    const { error: updateError } = await supabase
      .from("posts")
      .update(payload)
      .eq("id", postId);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    // Invalidate feed and profile caches
    revalidatePath("/feed");
    revalidatePath("/saved");
    revalidateTag("posts", "default");

    // Handle images: remove old, insert new
    const imageUrls = (formData.get("images") as string)
      ?.split(",")
      .map((u) => u.trim())
      .filter(Boolean) ?? [];

    await supabase.from("post_images").delete().eq("post_id", postId);

    if (imageUrls.length > 0) {
      const imageRows = imageUrls.map((url, i) => ({
        post_id: postId,
        url,
        sort_order: i,
      }));
      await supabase.from("post_images").insert(imageRows);
    }

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update post.",
    };
  }
}

// ── Save / Unsave Post ──────────────────────────────────────────────

export async function savePost(postId: string): Promise<ActionResult> {
  try {
    const auth = await requireAuth();
    if (!auth.ok) return auth;
    const { user, supabase } = auth;

    const { error } = await supabase
      .from("saved_posts")
      .upsert({ user_id: user.id, post_id: postId }, { onConflict: "user_id,post_id" });

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/feed");
    revalidatePath("/saved");
    revalidateTag("posts", "default");
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to save post.",
    };
  }
}

export async function unsavePost(postId: string): Promise<ActionResult> {
  try {
    const auth = await requireAuth();
    if (!auth.ok) return auth;
    const { user, supabase } = auth;

    const { error } = await supabase
      .from("saved_posts")
      .delete()
      .eq("user_id", user.id)
      .eq("post_id", postId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/feed");
    revalidatePath("/saved");
    revalidateTag("posts", "default");
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to unsave post.",
    };
  }
}

// ── Fetch Saved Posts ────────────────────────────────────────────────

export async function getSavedPosts(): Promise<Post[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return [];
  }

  // Fetch saved post IDs for current user, newest first
  const { data: savedRows, error: savedError } = await supabase
    .from("saved_posts")
    .select("post_id, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (savedError || !savedRows || savedRows.length === 0) {
    return [];
  }

  const postIds = savedRows.map((r) => r.post_id);

  // Fetch the actual posts
  const { data: postRows, error: postError } = await supabase
    .from("posts")
    .select("*")
    .in("id", postIds)
    .eq("is_active", true);

  if (postError || !postRows) {
    return [];
  }

  const posts = postRows as unknown as PostRow[];

  // Sort posts to match saved order
  const orderMap = new Map(savedRows.map((r, i) => [r.post_id, i]));
  posts.sort((a, b) => (orderMap.get(a.id) ?? 0) - (orderMap.get(b.id) ?? 0));

  const authorIds = [...new Set(posts.map((p) => p.author_id))];
  const [profileMap, imagesMap] = await Promise.all([
    fetchProfilesMap(supabase, authorIds),
    fetchImagesMap(supabase, postIds),
  ]);

  return posts.map((row) =>
    assemblePost(
      row,
      profileMap.get(row.author_id) ?? { ...UNKNOWN_PROFILE, id: row.author_id },
      imagesMap.get(row.id) ?? [],
      { is_saved: true },
    ),
  );
}

// ── Like / Unlike Post ──────────────────────────────────────────────

export async function likePost(postId: string): Promise<ActionResult> {
  try {
    const auth = await requireAuth();
    if (!auth.ok) return auth;
    const { user, supabase } = auth;

    const { error } = await supabase
      .from("post_reactions")
      .insert({ post_id: postId, user_id: user.id });

    if (error) {
      // Unique violation = already liked
      if (error.code === "23505") {
        return { success: true }; // already liked, no-op
      }
      return { success: false, error: error.message };
    }

    revalidatePath("/feed");
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to like post.",
    };
  }
}

export async function unlikePost(postId: string): Promise<ActionResult> {
  try {
    const auth = await requireAuth();
    if (!auth.ok) return auth;
    const { user, supabase } = auth;

    const { error } = await supabase
      .from("post_reactions")
      .delete()
      .eq("post_id", postId)
      .eq("user_id", user.id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/feed");
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to unlike post.",
    };
  }
}

// ── Delete Post ──────────────────────────────────────────────────────

export async function deletePost(postId: string): Promise<ActionResult> {
  try {
    const auth = await requireAuth();
    if (!auth.ok) return auth;
    const { user, supabase } = auth;

    const { data: existing } = await supabase
      .from("posts")
      .select("author_id")
      .eq("id", postId)
      .maybeSingle();

    if (!existing || existing.author_id !== user.id) {
      return { success: false, error: "You can only delete your own posts." };
    }

    // Fetch image URLs before deleting rows so we can clean up storage
    const { data: imageRows } = await supabase
      .from("post_images")
      .select("url")
      .eq("post_id", postId);

    // Delete image rows first
    await supabase.from("post_images").delete().eq("post_id", postId);

    // Delete the post itself
    const { error } = await supabase.from("posts").delete().eq("id", postId);

    if (error) {
      return { success: false, error: error.message };
    }

    // Invalidate feed and saved caches
    revalidatePath("/feed");
    revalidatePath("/saved");
    revalidateTag("posts", "default");

    // Clean up storage blobs
    if (imageRows && imageRows.length > 0) {
      const paths = (imageRows as { url: string }[])
        .map((img) => {
          const parts = img.url.split("/post-images/");
          return parts.length === 2 ? parts[1] : null;
        })
        .filter(Boolean) as string[];

      if (paths.length > 0) {
        const { error: storageError } = await supabase.storage
          .from("post-images")
          .remove(paths);
        if (storageError) {
          console.error("Failed to clean up post image storage:", storageError.message);
        }
      }
    }

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to delete post.",
    };
  }
}

// ── Report Post ─────────────────────────────────────────────────────

const REPORT_THRESHOLD = 10;

export async function reportPost(postId: string, reason?: string): Promise<ActionResult> {
  try {
    const auth = await requireAuth();
    if (!auth.ok) return auth;
    const { user, supabase } = auth;

    const parsed = reportPostSchema.safeParse({ post_id: postId, reason });
    if (!parsed.success) {
      return { success: false, error: "Invalid post ID." };
    }

    // Check if post exists
    const { data: existing } = await supabase
      .from("posts")
      .select("id, is_active")
      .eq("id", postId)
      .maybeSingle();

    if (!existing) {
      return { success: false, error: "Post not found." };
    }

    if (!existing.is_active) {
      return { success: false, error: "This post has already been removed." };
    }

    // Insert report (UNIQUE constraint prevents duplicates)
    const { error: insertError } = await supabase
      .from("post_reports")
      .insert({
        post_id: postId,
        reporter_id: user.id,
        reason: reason || null,
      });

    if (insertError) {
      // Unique violation = already reported
      if (insertError.code === "23505") {
        return { success: false, error: "You have already reported this post." };
      }
      return { success: false, error: insertError.message };
    }

    // Count reports for this post
    const { count } = await supabase
      .from("post_reports")
      .select("id", { count: "exact", head: true })
      .eq("post_id", postId);

    // Auto-hide post if threshold reached
    if (count && count >= REPORT_THRESHOLD) {
      await supabase
        .from("posts")
        .update({ is_active: false })
        .eq("id", postId);
    }

    revalidatePath("/feed");
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to report post.",
    };
  }
}

// ── Trending Topics ───────────────────────────────────────────────

export interface TrendingTopic {
  label: string;
  emoji: string;
  value: string;
  count: number;
}

export async function getTrendingTopics(limit = 6): Promise<TrendingTopic[]> {
  const supabase = await createClient();

  // Fetch active posts from the last 30 days
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const { data: posts, error } = await supabase
    .from("posts")
    .select("rice_type, region")
    .eq("is_active", true)
    .gte("created_at", thirtyDaysAgo);

  if (error || !posts || posts.length === 0) {
    return [];
  }

  // Count occurrences of rice_type and region
  const counts = new Map<string, { count: number; type: "rice" | "region" }>();

  for (const post of posts) {
    if (post.rice_type) {
      const key = post.rice_type;
      const existing = counts.get(key);
      if (existing) {
        existing.count++;
      } else {
        counts.set(key, { count: 1, type: "rice" });
      }
    }
    if (post.region) {
      const key = post.region;
      const existing = counts.get(key);
      if (existing) {
        existing.count++;
      } else {
        counts.set(key, { count: 1, type: "region" });
      }
    }
  }

  // Sort by count descending and take top N
  const sorted = Array.from(counts.entries())
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, limit);

  // Map to TrendingTopic with emojis
  return sorted.map(([value, { count, type }]) => ({
    label: value,
    emoji: type === "rice" ? "🌾" : "📍",
    value,
    count,
  }));
}
