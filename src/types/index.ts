// Import generated database types
import { Tables, TablesInsert, TablesUpdate } from '@/lib/types/database'

// ── Re-export database types for convenience ─────────────────────────────

/** Raw database row types */
export type ProfileRow = Tables<'profiles'>
export type PostRow = Tables<'posts'>
export type PostImageRow = Tables<'post_images'>
export type SavedPostRow = Tables<'saved_posts'>

/** Bilingual name type for reference tables */
export type BilingualName = { en: string; my: string }

/** Region with typed name */
export interface RegionRow extends Omit<Tables<'regions'>, 'name'> {
  name: BilingualName
}

/** Township with typed name */
export interface TownshipRow extends Omit<Tables<'townships'>, 'name'> {
  name: BilingualName
}

/** Market status with typed name */
export interface MarketStatusRow extends Omit<Tables<'market_status'>, 'name'> {
  name: BilingualName
}

/** Insert types */
export type ProfileInsert = TablesInsert<'profiles'>
export type PostInsert = TablesInsert<'posts'>
export type PostImageInsert = TablesInsert<'post_images'>

/** Update types */
export type ProfileUpdate = TablesUpdate<'profiles'>
export type PostUpdate = TablesUpdate<'posts'>

// ── Application-specific types ────────────────────────────────────────────

// User roles in the rice industry
export type UserRole = "farmer" | "trader" | "agent" | "general_user";

// Post types
export type PostType = "general" | "selling" | "buying";

// Subscription badge tiers for premium posts
export type SubscriptionBadge = "free" | "pro" | "pro_plus";

// Feed filter
export type FeedFilter = "all" | "buying" | "selling" | "following";

// ── Extended types with relations ─────────────────────────────────────────

/** Profile with convenience fields */
export interface Profile extends ProfileRow {
  // Add any computed/extended fields here if needed
}

/** Post with joined relations and computed fields */
export interface Post extends Omit<PostRow, 'type' | 'address' | 'badge' | 'easy_to_carry' | 'region' | 'paddy_condition' | 'pound_per_bag' | 'price' | 'quantity' | 'rice_name' | 'rice_type' | 'township' | 'unit' | 'is_active' | 'latitude' | 'longitude'> {
  type: PostType;
  author: Profile;
  images: PostImageRow[];
  address?: string | null;
  badge?: SubscriptionBadge | null;
  easy_to_carry?: boolean | null;
  region?: string | null;
  paddy_condition?: string | null;
  pound_per_bag?: number | null;
  price?: number | null;
  quantity?: number | null;
  rice_name?: string | null;
  rice_type?: string | null;
  township?: string | null;
  unit?: string | null;
  is_active?: boolean;
  latitude?: number | null;
  longitude?: number | null;
  is_liked?: boolean;
  is_saved?: boolean;
}

/** Post image (same as database row) */
export type PostImage = PostImageRow;

/** Comment (not in database yet - for future use) */
export interface Comment {
  id: string;
  post_id: string;
  author_id: string;
  author: Profile;
  content: string;
  created_at: string;
}

// ── Form types ────────────────────────────────────────────────────────────

/** Profile form data (for create/edit) */
export interface ProfileFormData {
  full_name: string;
  username: string;
  role: UserRole;
  region_id: number;
  township_id: number;
  market_status_id?: number | null;
  bio?: string;
}

/** Post form data (for create/edit) */
export interface PostFormData {
  type: PostType;
  content: string;
  rice_type?: string;
  rice_name?: string;
  price?: number | null;
  quantity?: number | null;
  unit?: string;
  address?: string;
  region?: string;
  township?: string | null;
  easy_to_carry?: boolean;
  pound_per_bag?: number | null;
  paddy_condition?: string | null;
  badge?: SubscriptionBadge;
}
