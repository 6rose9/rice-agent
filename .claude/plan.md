# Plan: Supabase Integration — Replace Mock Data with Real Queries

## Summary

The previous plan (auth forms migration to react-hook-form + zod) is complete. The project now has working auth (register, login, logout, profile CRUD) with Supabase, but **all content pages still use hardcoded mock data**. This plan moves every data-fetching page to real Supabase queries and fixes structural issues in the types and database schema.

---

## Phase 1: Fix Type & Schema Mismatches (Foundation)

### 1.1 Fix `Post` type to match `posts` DB table

**Problem:** `src/types/index.ts` defines `Post` with fields that don't exist in the DB (`content`, `author_id`, `author: Profile`, `reaction_count`, `comment_count`, `is_liked`, `is_saved`, `images: PostImage[]`, `location: string`). The actual DB `posts` table has `user_id`, `title`, `description`, `rice_type`, `variety`, `quantity`, `quantity_unit`, `price`, `price_unit`, `township_id`, `address`, `is_active`.

**Fix:** Rewrite `Post` and add `PostRow` (raw DB row) + `PostWithRelations` (joined with profile/township/region) types.

### 1.2 Add missing DB tables to schema.sql

**Problem:** `supabase/schema.sql` only creates `market_status`, `regions`, `townships`, and `profiles`. Missing `posts`, `post_images`, and `follows` tables (documented in `docs/database.md`).

**Fix:** Append the DDL for all three tables with indexes and RLS policies per `docs/database.md`. Create a new migration file.

### 1.3 Add `updated_at` trigger function

**Problem:** The `update_updated_at_column()` trigger function is referenced in `docs/database.md` but not created in `schema.sql`.

**Fix:** Add the trigger function to the new migration file and attach it to `profiles` and `posts`.

---

## Phase 2: Real Data Fetching — Content Pages

### 2.1 Feed Page (`src/app/(main)/feed/page.tsx`)

Replace `mockPosts` with a Supabase query:
- Fetch posts from `posts` table joined with `profiles`, `townships`, `regions`
- Filter by `is_active = true`, `order by created_at desc`, `limit 20`
- Support filter tabs: "all" (no filter), "buying" (`type = 'buying'`), "selling" (`type = 'selling'`), "following" (join `follows` table)
- Add loading skeleton (already have `SkeletonCard`), empty state (already have `EmptyCard`), error state (already have `ErrorCard`)
- Pagination: "Load more" button (cursor-based with `created_at`)

### 2.2 Profile Page (`src/app/(main)/profile/[username]/page.tsx`)

Already fetches profile from Supabase ✓. Still needs:
- Fetch user's posts from `posts` table (replace `mockPosts.filter`)
- Fetch real follower/following counts from `follows` table
- Implement Follow/Unfollow button with real DB mutations
- Add follow/unfollow server actions

### 2.3 Search Page (`src/app/(main)/search/page.tsx`)

Replace `mockProfiles` and `mockPosts` with real queries:
- User search: `profiles` table with `ilike` on `full_name`, filter by `role`, `region_id`
- Post search: `posts` table with `ilike` on `title`/`description`
- Add debounced search input (300ms delay)
- Add empty state, error state

### 2.4 MyNetwork Page (`src/app/(main)/mynetwork/page.tsx`)

Replace `mockInvitations`, `mockSuggestions`, `networkStats`:
- Fetch "People you may know" from `profiles` (users not followed, same region, limit 6)
- Fetch pending follow relationships or show "no invitations" state
- Fetch connection/follower/following counts from `follows`
- Connect "Accept"/"Ignore" buttons to real follow/unfollow mutations

### 2.5 Post Creation (`src/components/post/create-post-form.tsx`)

Replace mock `setTimeout` with real Supabase insert:
- Add react-hook-form + zod validation for the post form
- Insert into `posts` table with all fields (`user_id`, `type`, `title`, `description`, `rice_type`, `price`, `quantity`, `township_id`, `address`)
- On success: redirect to feed or the new post
- Add loading/error states

---

## Phase 3: Follow System

### 3.1 Follow/Unfollow Server Actions

Create new server actions in `src/lib/actions.ts` (or a new file `src/lib/follow/actions.ts`):
- `followUser(targetUserId: string)` — insert into `follows`
- `unfollowUser(targetUserId: string)` — delete from `follows`
- `isFollowing(targetUserId: string)` — check follow status
- Handle self-follow prevention, duplicate prevention

### 3.2 Follow Button Component

Replace inline buttons in profile page and mynetwork page with a reusable `FollowButton` client component:
- Shows "Follow" / "Following" / "Unfollow" states
- Handles auth gate (redirect to login if not authenticated)
- Optimistic UI updates
- Loading/error states

---

## Phase 4: Fetch Reference Data from Supabase

### 4.1 Regions & Townships

Currently all forms use `mockRegions`/`mockTownships` from `mock-data.ts` (only 10 townships vs ~200 in seed.sql).

**Fix:** Create a data-fetching layer:
- `src/lib/data/regions.ts` — `getRegions()`, `getTownshipsByRegion(regionId)`
- Use in: register page, auth modal, profile edit page, post create form
- Cache with React `cache()` for server components; fetch in client components with `useEffect`

### 4.2 Market Status

Already in mock data as `mockMarketStatuses` — fetch from Supabase `market_status` table.

---

## Phase 5: Cleanup

### 5.1 Remove unused mock data

After all pages use real Supabase queries, remove dead mock data from `mock-data.ts`. Keep helpers like `timeAgo`, `getLocationLabel`, `formatPrice`, `roleLabels` that are still useful for display.

### 5.2 Update PostCard component

`PostCard` currently uses `post.content`, `post.author`, `post.images`, `post.reaction_count`, `post.comment_count`, `post.is_liked`. After the type change, update to use `post.title`, `post.description`, joined profile data, etc.

---

## Files to Modify

| File | Change |
|---|---|
| `src/types/index.ts` | Rewrite `Post` to match DB schema; add `PostWithRelations` |
| `supabase/migration_002_posts_follows.sql` | **NEW** — DDL for `posts`, `post_images`, `follows` tables |
| `src/app/(main)/feed/page.tsx` | Replace mockPosts with Supabase query |
| `src/app/(main)/profile/[username]/page.tsx` | Fetch real posts + follow counts + follow button |
| `src/app/(main)/search/page.tsx` | Replace mock data with Supabase search queries |
| `src/app/(main)/mynetwork/page.tsx` | Replace mock data with Supabase queries |
| `src/components/post/create-post-form.tsx` | Real Supabase insert + react-hook-form validation |
| `src/components/feed/post-card.tsx` | Update to match new Post type |
| `src/lib/auth/actions.ts` | Add follow/unfollow server actions |
| `src/components/follow-button.tsx` | **NEW** — Reusable follow/unfollow button |
| `src/lib/data/regions.ts` | **NEW** — Fetch regions/townships from Supabase |
| `src/app/(auth)/register/page.tsx` | Use real regions/townships from Supabase |
| `src/components/auth/auth-modal.tsx` | Use real regions/townships from Supabase |
| `src/app/(main)/profile/edit/page.tsx` | Use real regions/townships from Supabase |
| `src/lib/mock-data.ts` | Remove unused mock arrays; keep helpers |

## Files NOT Touched

- `src/lib/validations/auth.ts` — works correctly
- `src/components/auth/auth-provider.tsx` — works correctly
- `src/middleware.ts` — works correctly
- `src/app/layout.tsx` — works correctly
- `src/app/(main)/layout.tsx` — works correctly
- `src/lib/supabase/*` — clients are set up correctly
- `supabase/schema.sql` — reference tables + profiles already correct
- `supabase/seed.sql` — township seed data is complete
- `supabase/migration_soft_delete.sql` — soft delete already applied
