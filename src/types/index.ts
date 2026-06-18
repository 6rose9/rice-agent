// User roles in the rice industry
export type UserRole = "farmer" | "trader" | "agent" | "general_user";

// ── Reference Table Types ─────────────────────────────────────────────

/** Row from public.market_status */
export interface MarketStatusRow {
  id: number;
  name: { en: string; my: string };
  sort_order: number;
}

/** Row from public.regions */
export interface RegionRow {
  id: number;
  name: { en: string; my: string };
  sort_order: number;
}

/** Row from public.townships */
export interface TownshipRow {
  id: number;
  name: { en: string; my: string };
  region_id: number;
  sort_order: number;
}

// Post types
export type PostType = "selling" | "buying";

// Profile (matches public.profiles table)
export interface Profile {
  id: string;
  phone: string;
  email?: string | null;
  username: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string | null;
  cover_url?: string | null;
  bio?: string | null;
  region_id: number;
  township_id: number;
  market_status_id?: number | null;
  phone_verified: boolean;
  deleted_at?: string | null;
  created_at: string;
  updated_at: string;
}

// Post
export interface Post {
  id: string;
  author_id: string;
  author: Profile;
  type: PostType;
  content: string;
  rice_type?: string;
  price?: number | null;
  quantity?: number | null;
  location?: string;
  images: PostImage[];
  reaction_count: number;
  comment_count: number;
  is_liked?: boolean;
  is_saved?: boolean;
  created_at: string;
  updated_at: string;
}

// Post image
export interface PostImage {
  id: string;
  post_id: string;
  url: string;
  sort_order: number;
}

// Comment
export interface Comment {
  id: string;
  post_id: string;
  author_id: string;
  author: Profile;
  content: string;
  created_at: string;
}

// Feed filter
export type FeedFilter = "all" | "buying" | "selling" | "following";
