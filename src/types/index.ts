// User roles in the rice industry
export type UserRole = "farmer" | "trader" | "agent" | "general_user";

// Market status options
export type MarketStatus =
  | "looking_for_buyers"
  | "looking_for_suppliers"
  | "buying_rice"
  | "selling_rice"
  | "available_as_agent"
  | "open_for_partnership";

// Post types
export type PostType = "selling" | "buying";

// Profile
export interface Profile {
  id: string;
  phone: string;
  email?: string;
  username: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
  cover_url?: string;
  bio?: string;
  location?: string;
  website?: string;
  market_status?: MarketStatus;
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
