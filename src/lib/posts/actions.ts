"use server";

import { createClient } from "@/lib/supabase/server";
import { postSchema } from "@/lib/validations/post";
import type { Post, PostImage, Profile } from "@/types";

// ── Types ─────────────────────────────────────────────────────────────

export type PostActionResult = {
  success: boolean;
  error?: string;
  redirect?: string;
};

// ── Helpers ──────────────────────────────────────────────────────────

// ── Create Post ──────────────────────────────────────────────────────

export async function createPost(
  _prevState: PostActionResult | null,
  formData: FormData,
): Promise<PostActionResult> {
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
    location: (formData.get("location") as string) || undefined,
    township: (formData.get("township") as string) || undefined,
    pound_per_bag: formData.get("pound_per_bag") || undefined,
    paddy_condition: (formData.get("paddy_condition") as string) || undefined,
    easy_to_carry: formData.get("easy_to_carry") || undefined,
  };

  // Validate with zod schema
  const parsed = postSchema.safeParse(rawData);
  if (!parsed.success) {
    // discriminated union — cast to access all possible field errors
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const firstError = (parsed.error.flatten().fieldErrors as any);
    const msg =
      firstError.content?.[0] ||
      firstError.rice_type?.[0] ||
      firstError.price?.[0] ||
      firstError.quantity?.[0] ||
      firstError.pound_per_bag?.[0] ||
      firstError.paddy_condition?.[0] ||
      "Invalid input.";
    return { success: false, error: msg };
  }

  const supabase = await createClient();

  // Get authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "Not authenticated." };
  }

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
      payload.location = parsed.data.location || null;
      payload.township = parsed.data.township || null;
      payload.easy_to_carry = parsed.data.easy_to_carry ?? null;
      payload.pound_per_bag = parsed.data.pound_per_bag ?? null;
      payload.paddy_condition = parsed.data.paddy_condition || null;
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

    return { success: true, redirect: "/feed" };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to create post.",
    };
  }
}

// ── Fetch Posts ──────────────────────────────────────────────────────

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
  location: string | null;
  township: string | null;
  easy_to_carry: boolean | null;
  pound_per_bag: number | null;
  paddy_condition: string | null;
  badge: string | null;
  reaction_count: number;
  comment_count: number;
  created_at: string;
  updated_at: string;
}

interface PostImageRow {
  id: string;
  post_id: string;
  url: string;
  sort_order: number;
}

interface ProfileRow {
  id: string;
  phone: string;
  email: string | null;
  username: string;
  full_name: string;
  role: string;
  avatar_url: string | null;
  cover_url: string | null;
  bio: string | null;
  region_id: number;
  township_id: number;
  market_status_id: number | null;
  phone_verified: boolean;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export async function getPosts(
  cursor?: string,
  pageSize = 20,
): Promise<{ posts: Post[]; nextCursor: string | null }> {
  const supabase = await createClient();

  // Fetch posts ordered by newest first, with cursor-based pagination
  let query = supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(pageSize + 1); // fetch one extra to detect if there are more

  if (cursor) {
    query = query.lt("created_at", cursor);
  }

  const { data: postRows, error: postError } = await query;

  if (postError || !postRows) {
    console.error("Failed to fetch posts:", postError?.message);
    return { posts: [], nextCursor: null };
  }

  const hasMore = postRows.length > pageSize;
  const rows = hasMore ? postRows.slice(0, pageSize) : postRows;
  const nextCursor = hasMore ? rows[rows.length - 1].created_at : null;

  const posts = rows as unknown as PostRow[];

  // Collect unique author IDs
  const authorIds = [...new Set(posts.map((p) => p.author_id))];

  // Fetch profiles for all authors
  const { data: profileRows } = await supabase
    .from("profiles")
    .select("*")
    .in("id", authorIds);

  const profiles = (profileRows ?? []) as unknown as ProfileRow[];
  const profileMap = new Map(profiles.map((p) => [p.id, p as unknown as Profile]));

  // Fix #9: provide a fallback profile for missing authors
  function getAuthor(id: string): Profile {
    return profileMap.get(id) ?? {
      id,
      phone: "",
      username: "unknown",
      full_name: "Unknown User",
      role: "general_user",
      region_id: 0,
      township_id: 0,
      phone_verified: false,
      created_at: "",
      updated_at: "",
    };
  }

  // Collect all post IDs
  const postIds = posts.map((p) => p.id);

  // Fetch images for all posts
  const { data: imageRows } = await supabase
    .from("post_images")
    .select("*")
    .in("post_id", postIds)
    .order("sort_order");

  const images = (imageRows ?? []) as unknown as PostImageRow[];
  const imagesMap = new Map<string, PostImage[]>();
  for (const img of images) {
    const list = imagesMap.get(img.post_id) ?? [];
    list.push({
      id: img.id,
      post_id: img.post_id,
      url: img.url,
      sort_order: img.sort_order,
    });
    imagesMap.set(img.post_id, list);
  }

  // Assemble Post objects
  return {
    posts: posts.map((row) => ({
      id: row.id,
      author_id: row.author_id,
      author: getAuthor(row.author_id),
      type: row.type as Post["type"],
      content: row.content,
      rice_type: row.rice_type ?? undefined,
      rice_name: row.rice_name ?? undefined,
      price: row.price ?? null,
      quantity: row.quantity ?? null,
      unit: row.unit ?? undefined,
      address: row.address ?? undefined,
      location: row.location ?? undefined,
      township: row.township ?? null,
      easy_to_carry: row.easy_to_carry ?? undefined,
      pound_per_bag: row.pound_per_bag ?? null,
      paddy_condition: (row.paddy_condition as Post["paddy_condition"]) ?? undefined,
      badge: (row.badge as Post["badge"]) ?? undefined,
      images: imagesMap.get(row.id) ?? [],
      reaction_count: row.reaction_count,
      comment_count: row.comment_count,
      created_at: row.created_at,
      updated_at: row.updated_at,
    })),
    nextCursor,
  };
}

// ── Fetch Posts by Author ────────────────────────────────────────────

export async function getPostsByAuthor(authorId: string): Promise<Post[]> {
  const supabase = await createClient();

  const { data: postRows, error: postError } = await supabase
    .from("posts")
    .select("*")
    .eq("author_id", authorId)
    .order("created_at", { ascending: false });

  if (postError || !postRows) {
    console.error("Failed to fetch author posts:", postError?.message);
    return [];
  }

  const posts = postRows as unknown as PostRow[];

  // Fetch author profile
  const { data: profileRows } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", authorId)
    .maybeSingle();

  const authorProfile: Profile = profileRows
    ? (profileRows as unknown as Profile)
    : {
        id: authorId,
        phone: "",
        username: "unknown",
        full_name: "Unknown User",
        role: "general_user",
        region_id: 0,
        township_id: 0,
        phone_verified: false,
        created_at: "",
        updated_at: "",
      };

  // Fetch images for all posts
  const postIds = posts.map((p) => p.id);
  const { data: imageRows } = await supabase
    .from("post_images")
    .select("*")
    .in("post_id", postIds)
    .order("sort_order");

  const images = (imageRows ?? []) as unknown as PostImageRow[];
  const imagesMap = new Map<string, PostImage[]>();
  for (const img of images) {
    const list = imagesMap.get(img.post_id) ?? [];
    list.push({
      id: img.id,
      post_id: img.post_id,
      url: img.url,
      sort_order: img.sort_order,
    });
    imagesMap.set(img.post_id, list);
  }

  return posts.map((row) => ({
    id: row.id,
    author_id: row.author_id,
    author: authorProfile,
    type: row.type as Post["type"],
    content: row.content,
    rice_type: row.rice_type ?? undefined,
    rice_name: row.rice_name ?? undefined,
    price: row.price ?? null,
    quantity: row.quantity ?? null,
    unit: row.unit ?? undefined,
    address: row.address ?? undefined,
    location: row.location ?? undefined,
    township: row.township ?? null,
    easy_to_carry: row.easy_to_carry ?? undefined,
    pound_per_bag: row.pound_per_bag ?? null,
    paddy_condition: (row.paddy_condition as Post["paddy_condition"]) ?? undefined,
    badge: (row.badge as Post["badge"]) ?? undefined,
    images: imagesMap.get(row.id) ?? [],
    reaction_count: row.reaction_count,
    comment_count: row.comment_count,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }));
}

// ── Update Post ──────────────────────────────────────────────────────

export async function updatePost(
  postId: string,
  _prevState: PostActionResult | null,
  formData: FormData,
): Promise<PostActionResult> {
  const rawData: Record<string, unknown> = {
    type: formData.get("type") as string,
    content: formData.get("content") as string,
    rice_type: (formData.get("rice_type") as string) || undefined,
    rice_name: (formData.get("rice_name") as string) || undefined,
    price: formData.get("price") || undefined,
    quantity: formData.get("quantity") || undefined,
    unit: (formData.get("unit") as string) || undefined,
    address: (formData.get("address") as string) || undefined,
    location: (formData.get("location") as string) || undefined,
    township: (formData.get("township") as string) || undefined,
    pound_per_bag: formData.get("pound_per_bag") || undefined,
    paddy_condition: (formData.get("paddy_condition") as string) || undefined,
    easy_to_carry: formData.get("easy_to_carry") || undefined,
  };

  const parsed = postSchema.safeParse(rawData);
  if (!parsed.success) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const firstError = (parsed.error.flatten().fieldErrors as any);
    const msg =
      firstError.content?.[0] ||
      firstError.rice_type?.[0] ||
      firstError.price?.[0] ||
      firstError.quantity?.[0] ||
      firstError.pound_per_bag?.[0] ||
      firstError.paddy_condition?.[0] ||
      "Invalid input.";
    return { success: false, error: msg };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "Not authenticated." };
  }

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
      payload.location = parsed.data.location || null;
      payload.township = parsed.data.township || null;
      payload.easy_to_carry = parsed.data.easy_to_carry ?? null;
      payload.pound_per_bag = parsed.data.pound_per_bag ?? null;
      payload.paddy_condition = parsed.data.paddy_condition || null;
    }

    const { error: updateError } = await supabase
      .from("posts")
      .update(payload)
      .eq("id", postId);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

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

// ── Delete Post ──────────────────────────────────────────────────────

export async function deletePost(postId: string): Promise<PostActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "Not authenticated." };
  }

  const { data: existing } = await supabase
    .from("posts")
    .select("author_id")
    .eq("id", postId)
    .maybeSingle();

  if (!existing || existing.author_id !== user.id) {
    return { success: false, error: "You can only delete your own posts." };
  }

  // Fix #3: fetch image URLs before deleting rows so we can clean up storage
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
}
