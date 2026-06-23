# Senior Architect Refactor Tasks

> Code review performed on 2026-06-23.  
> Source: `supabase/migrations/` is the true DB schema (not `docs/database.md`).

---

## Code Review Findings

### 🔴 Critical Issues (Must Fix)

- [x] **~~Database column mismatches~~** — Code was actually correct (`author_id`, `url`). `docs/database.md` is wrong (documents `user_id`, `image_url`). Docs need updating. → *Partially done: code verified correct. `docs/database.md` still needs rewriting.*
- [x] **~~Massive code duplication in `posts/actions.ts`~~** — `getPosts`, `getPostsByAuthor`, `getSavedPosts` all repeated ~100 lines of profile-map + image-map + assembly logic. → *Done: extracted `fetchProfilesMap`, `fetchImagesMap`, `assemblePost`.*
- [ ] **Mock data used in production search** — `search/page.tsx` imports `mockProfiles`, `mockPosts` and filters them. Real users searching will find nothing.
- [ ] **Duplicate utility functions** — `formatPrice`, `formatQuantity`, `timeAgo` exist in both `lib/utils/format.ts` AND `lib/mock-data.ts`.
- [ ] **Location/region data architecture problem** — Two parallel systems: DB tables (`regions`, `townships`) vs hardcoded `regionTownships` object in `mock-data.ts`. Post forms use the hardcoded version.

### 🟡 Major Issues (Should Fix)

- [ ] **Client-side feed filtering** — Feed fetches ALL posts then filters by type in `useMemo`. The "Load More" button only works for `filter === "all"`. Should be server-side.
- [ ] **Unimplemented features shown in UI** — Follow button does nothing (no `follows` table). Follower/following counts hardcoded to 0. Network page is placeholder.
- [ ] **Race condition in registration avatar upload** — After `signUp`, code calls `getUser()` which may not return the user if session isn't established yet. (`auth/actions.ts:182-190`)
- [ ] **Type safety gaps** — `zodResolver(postSchema as any) as any` double-cast in `create-post-form.tsx:41-42`. `(parsed.error.flatten().fieldErrors as any)` cast in `posts/actions.ts`.
- [ ] **`paddy_condition` type mismatch** — Zod schema defines as `z.coerce.number()` but DB stores as `text`. Mock data uses string `"14"`. Slider outputs number. Works but inconsistent.

### 🟢 Minor Issues (Nice to Fix)

- [ ] **`src/proxy.ts`** — Unused file, never imported.
- [ ] **`generateUsername` uses `Math.random()`** — Not cryptographically secure, 4-digit suffix = 9000 collision space. (`auth/actions.ts:31`)
- [ ] **`updateProfile` manually sets `updated_at`** — DB trigger `update_updated_at_column()` already handles this. Redundant. (`auth/actions.ts:269`)
- [ ] **Missing `not-found.tsx`** for `(main)` route group.
- [ ] **Inconsistent error handling** — Some server actions return `{ success: false, error }`, login action conditionally transforms error messages.

---

## Phase 1: Fix Data Layer ✅ DONE

- [x] Verify actual DB columns from `supabase/migrations/` (source of truth)
- [x] Posts migration rewrite — `20260618000001_create_posts.sql` now includes ALL form fields
- [x] Rename `location` → `region` across entire codebase
- [x] Remove `status` field — `is_active` is sufficient
- [x] Delete redundant migration `20260619000001_add_post_location.sql`
- [x] Update `user_soft_delete.sql` — removed `is_active` column addition
- [x] Update `lib/types/database.ts` — Row/Insert/Update types match migration
- [x] Update `types/index.ts` — Post interface, PostFormData types
- [ ] **Update `docs/database.md`** — DDL, constraints, indexes, RLS, query examples all need to match actual migrations. Current docs document `user_id`, `title`, `description`, `township_id`, `variety`, `quantity_unit`, `price_unit` which don't exist in actual migrations.

## Phase 2: Extract Shared Helpers ✅ DONE

- [x] Extract `UNKNOWN_PROFILE` constant (was duplicated 3× inline)
- [x] Extract `fetchProfilesMap(supabase, authorIds)` — profiles → Map
- [x] Extract `fetchImagesMap(supabase, postIds)` — post images → Map
- [x] Extract `assemblePost(row, author, images, extra?)` — PostRow → Post
- [x] Parallel fetch with `Promise.all` in `getPosts` and `getSavedPosts`
- [x] Net result: ~220 lines removed, single source of truth

## Phase 3: Remove Mock Data from Production 🔴 TODO

- [ ] **`src/app/(main)/search/page.tsx`** — imports `mockProfiles`, `mockPosts` for search results. Replace with Supabase queries.
- [ ] **`src/components/feed/post-card.tsx`** — imports `formatPrice`, `formatQuantity`, `timeAgo`, `roleLabels`, `marketStatusLabels`, `regionTownships` from `mock-data.ts`. Move to proper modules.
- [ ] **`src/components/post/trading-form-fields.tsx`** — imports `regionTownships`, `regionKeys` from `mock-data.ts`. Should use `useRegions` hook or DB data.
- [ ] **`src/components/post/create-post-form.tsx`** — imports `regionTownships`, `regionKeys` from `mock-data.ts`.
- [ ] **`src/app/(main)/profile/[username]/page.tsx`** — imports `marketStatusLabels`, `roleLabels`, `getLocationLabel` from `mock-data.ts`.

## Phase 4: Consolidate Duplicate Utilities 🔴 TODO

- [ ] **`formatPrice`** — exists in `lib/utils/format.ts` AND `lib/mock-data.ts`. Keep `lib/utils/format.ts` as canonical.
- [ ] **`formatQuantity`** — same duplication.
- [ ] **`timeAgo` / `formatRelativeTime`** — `mock-data.ts` has `timeAgo`, `format.ts` has `formatRelativeTime`. Unify.
- [ ] **`roleLabels`** — in `mock-data.ts`, should use `ROLE_LABELS` from `lib/constants.ts`.
- [ ] **`marketStatusLabels`** — in `mock-data.ts`, should be in `lib/constants.ts`.
- [ ] **`getLocationLabel`** — in `mock-data.ts`, depends on mock townships. Needs to work with real DB data.
- [ ] Update all imports across components to point to canonical locations.

## Phase 5: Centralize Region/Township Data 🔴 TODO

- [ ] **`regionTownships` object** in `mock-data.ts` — hardcoded region/township string map used by post forms. Should use DB-driven `useRegions` hook.
- [ ] **`regionKeys`** — derived from hardcoded `regionTownships`. Should come from DB.
- [ ] **`regionKeyToId` / `townshipKeyToId`** — hardcoded ID mappings. Should derive from DB.
- [ ] **Post creation form** — stores region key string (e.g. "yangon") in `posts.region`. Consider whether this should stay as text or become an FK.

## Phase 6: Architecture Improvements 🔴 TODO

- [ ] **Server-side feed filtering** — `getPosts()` should accept a `type` filter param instead of client-side `useMemo` filtering.
- [ ] **Hide unimplemented features** — Follow button, follower/following counts, network page. Add "Coming Soon" or hide.
- [ ] **Fix type safety** — `zodResolver(postSchema as any) as any` in `create-post-form.tsx`. Resolve discriminated union typing properly.
- [ ] **Remove `src/proxy.ts`** — unused file.
- [ ] **Add `not-found.tsx`** for `(main)` route group.
- [ ] **Fix `generateUsername`** — replace `Math.random()` with UUID or timestamp-based approach.
- [ ] **Remove redundant `updated_at` manual set** in `updateProfile` — DB trigger handles it.
- [ ] **Fix registration avatar race condition** — `getUser()` after `signUp` may not return user yet.

---

## Key Files Reference

| File | Purpose |
|---|---|
| `supabase/migrations/auth_schema.sql` | profiles, regions, townships, market_status, auth functions |
| `supabase/migrations/20260618000001_create_posts.sql` | posts + post_images (canonical) |
| `supabase/migrations/user_soft_delete.sql` | profiles.deleted_at, RLS updates |
| `supabase/migrations/20260619000000_create_saved_posts.sql` | saved_posts junction table |
| `src/lib/posts/actions.ts` | All post server actions (refactored ✅) |
| `src/lib/auth/actions.ts` | Auth server actions (login, register, etc.) |
| `src/lib/validations/post.ts` | Zod schemas for post forms |
| `src/lib/validations/auth.ts` | Zod schemas for auth forms |
| `src/lib/types/database.ts` | Supabase types (updated ✅) |
| `src/types/index.ts` | App-level types (updated ✅) |
| `src/lib/mock-data.ts` | Mock data + display helpers (TO BE REMOVED from production) |
| `src/lib/constants.ts` | App constants (roles, post types, rice types) |
| `src/lib/utils/format.ts` | Formatting utilities (canonical) |
| `src/hooks/use-regions.ts` | Client hook for regions + townships from DB |
| `docs/database.md` | DB documentation (NEEDS REWRITE to match migrations) |
