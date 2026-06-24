# Senior Architect Refactor Plan

> Last reviewed: 2026-06-23  
> Source of truth: `supabase/migrations/` (not `docs/database.md`)

---

## Architecture Assessment

### Current State

The codebase follows a standard Next.js App Router pattern with Supabase. Phases 1–2 (data layer + shared helpers) are complete. The remaining work falls into three categories: **data integrity** (mock→real), **code quality** (duplication, types), and **architecture** (server vs client, module boundaries).

### Guiding Principles

1. **Server-first** — Move filtering, pagination, and search to the database. Client-side `useMemo` filtering is a smell.
2. **Single source of truth** — Every piece of data (regions, roles, statuses) must come from ONE canonical location — either DB or a constants file, never both.
3. **Type safety end-to-end** — No `as any` casts. If Zod and Supabase types diverge, fix the schema, not the cast.
4. **Progressive disclosure** — Don't show UI for unimplemented features. "Coming soon" is acceptable; broken buttons are not.
5. **Module boundaries** — `mock-data.ts` must not export anything used by production code. It's a dev/test artifact.

---

## 🔵 Feature Requests

- [ ] **Privacy settings** — Users can control visibility of phone/email from settings page.
- [ ] **Report post** — Users can report posts that are not related to the rice industry.
- [ ] **Check post for feed visibility** — Review post display logic to ensure display data is correct .
- [ ] **Rename "Price" label to "Approximate Price"** — Update label across post creation form and post cards to better reflect that the price is not fixed.
- [ ] **Change `role` from enum to table** — Replace the `user_role` enum with a `roles` lookup table (like `regions`/`market_status`). Enables adding new roles without migrations, bilingual role names, and ordering. Requires migration to alter `profiles.role` from enum column to FK integer column.
- [ ] **Change `rice_type` from constant to table** — Replace the hardcoded `riceTypes` constant with a `rice_types` lookup table (like `regions`). Enables adding new rice varieties without code changes, bilingual names, and ordering. Requires migration to create table and alter `posts.rice_type` from text to FK integer column.

---

## Code Review Findings

### 🔴 Critical Issues (Must Fix)

- ✅ **~~Database column mismatches~~** — Code was actually correct (`author_id`, `url`). `docs/database.md` is wrong. → *Partially done.*
- ✅ **~~Massive code duplication in `posts/actions.ts`~~** — → *Done: extracted shared helpers.*
- ✅ **Mock data used in production search** — `search/page.tsx` imports `mockProfiles`, `mockPosts`. Real users get zero results.
- ✅ **Duplicate utility functions** — `formatPrice`, `formatQuantity`, `timeAgo` in both `lib/utils/format.ts` AND `lib/mock-data.ts`.
- ✅ **Location/region data architecture** — Two parallel systems: DB tables vs hardcoded `regionTownships` in `mock-data.ts`.

### 🟡 Major Issues (Should Fix)

- ✅ **Client-side feed filtering** — `getPosts()` returns everything; `useMemo` filters. "Load More" only works for `filter === "all"`.
- [ ] **Unimplemented features in UI** — Follow button (no `follows` table), follower counts (hardcoded 0), network page (placeholder).
- ✅ **Race condition in registration** — `getUser()` after `signUp` may not return user yet. (`auth/actions.ts:182-190`)
- ✅ **Type safety gaps** — Double `as any` cast on `zodResolver`. `fieldErrors as any` in actions.
- ✅ **`paddy_condition` type mismatch** — Zod: `z.coerce.number()`. DB: `text`. Mock: string `"14"`. Works but fragile.
- ✅ **No error boundaries** — A thrown error in any server component crashes the whole page. No granular error recovery.

### 🟢 Minor Issues (Nice to Fix)

- ✅ **`src/proxy.ts`** — Unused file, never imported.
- ✅ **`generateUsername` uses `Math.random()`** — 4-digit suffix = 9000 collision space. (`auth/actions.ts:31`)
- ✅ **`updateProfile` manually sets `updated_at`** — DB trigger already handles this. Redundant. (`auth/actions.ts:269`)
- ✅ **Missing `not-found.tsx`** for `(main)` route group.
- ✅ **Inconsistent error handling** — Mixed patterns across server actions.
- [ ] **`Comment` type defined but unused** — `types/index.ts:88-95` defines `Comment` interface but no comments table exists yet.
- ✅ **`PostFormData` type unused** — Defined in `types/index.ts:111-126` but forms use Zod-inferred types directly.

---

## Phase 1: Fix Data Layer ✅ DONE

- ✅ Verify actual DB columns from `supabase/migrations/`
- ✅ Posts migration rewrite
- ✅ Rename `location` → `region` across codebase
- ✅ Remove `status` field
- ✅ Delete redundant migration
- ✅ Update `user_soft_delete.sql`
- ✅ Update `lib/types/database.ts`
- ✅ Update `types/index.ts`
- ✅ **Update `docs/database.md`** — DDL, constraints, indexes, RLS all need to match actual migrations.

## Phase 2: Extract Shared Helpers ✅ DONE

- ✅ Extract `UNKNOWN_PROFILE`, `fetchProfilesMap`, `fetchImagesMap`, `assemblePost`
- ✅ Parallel fetch with `Promise.all`
- ✅ ~220 lines removed

---

## Phase 3: Remove Mock Data from Production 🔴 IN PROGRESS

**Goal:** `mock-data.ts` becomes a dev/test-only file. Zero production imports.

### 3a. Audit all mock-data imports

```
src/app/(main)/search/page.tsx         → mockProfiles, mockPosts
src/components/feed/post-card.tsx      → formatPrice, formatQuantity, timeAgo, roleLabels, marketStatusLabels, regionTownships
src/components/post/trading-form-fields.tsx → regionTownships, regionKeys
src/components/post/create-post-form.tsx → regionTownships, regionKeys
src/app/(main)/profile/[username]/page.tsx → marketStatusLabels, roleLabels, getLocationLabel
```

### 3b. Migration steps

- ✅ Move `formatPrice`, `formatQuantity`, `timeAgo` → `lib/utils/format.ts` (canonical)
- ✅ Move `roleLabels` → use `ROLE_LABELS` from `lib/constants.ts`
- ✅ Move `marketStatusLabels`, `marketStatusShort`, `marketStatusColors` → market_statues 
- ✅ Replace `regionTownships` / `regionKeys` usage with `useRegions` hook
- ✅ Replace `getLocationLabel` with a version that takes region/township data as params
- ✅ Replace `search/page.tsx` mock data with real Supabase queries
- [ ] Verify zero imports from `mock-data.ts` in production code (grep check)

### 3c. Files to update

| File                          | Current mock imports                                                                              | Replace with                               |
| ----------------------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| `post-card.tsx`               | `formatPrice`, `formatQuantity`, `timeAgo`, `roleLabels`, `marketStatusLabels`, `regionTownships` | `@/lib/utils/format`, `@/lib/constants`    |
| `trading-form-fields.tsx`     | `regionTownships`, `regionKeys`                                                                   | `useRegions` hook or server component data |
| `create-post-form.tsx`        | `regionTownships`, `regionKeys`                                                                   | `useRegions` hook or server component data |
| `profile/[username]/page.tsx` | `marketStatusLabels`, `roleLabels`, `getLocationLabel`                                            | `@/lib/constants` + DB data                |
| `search/page.tsx`             | `mockProfiles`, `mockPosts`                                                                       | Supabase queries                           |

---

## Phase 4: Consolidate Duplicate Utilities 🔴 TODO

- ✅ Keep `lib/utils/format.ts` as single source for formatters
- ✅ Unify `timeAgo` (mock-data) vs `formatRelativeTime` (format.ts) — pick one name
- [ ] Remove all duplicate exports from `mock-data.ts`
- [ ] Update every import across the codebase

---

## Phase 5: Centralize Region/Township Data 🔴 TODO

**Goal:** One data source for regions/townships — the database.

- ✅ Remove `regionTownships` hardcoded object from `mock-data.ts`
- ✅ Remove `regionKeys`, `regionKeyToId`, `townshipKeyToId` mappings
- ✅ Post forms: use `useRegions` hook (client) or pass data as props from server component
- ✅ Decision: `posts.region` stores text string ("yangon") — keep as-is or change to FK?
  - **Recommendation:** Keep as text for V1 (simpler). FK migration in V2 if needed.
- ✅ Update `getLocationLabel` to accept region/township data from DB, not mocks

---

## Phase 6: Server-Side Feed Filtering 🔴 TODO

**Problem:** `getPosts()` returns all posts. Client filters with `useMemo`. "Load More" only works for `filter === "all"`.

- [ ] Add `type` param to `getPosts(type?: PostType)`:
  ```ts
  export async function getPosts(
    cursor?: string,
    pageSize = 20,
    type?: PostType,
  ): Promise<{ posts: Post[]; nextCursor: string | null }>
  ```
- ✅ Apply `.eq("type", type)` in query when type is provided
- ✅ Update `FeedContent` to pass filter to server action
- ✅ Client-side `useMemo` filtering
- [ ] Enable "Load More" for all filter types

---

## Phase 7: Type Safety Fixes 🟡 TODO

### 7a. Zod discriminated union + zodResolver

```ts
// Current (BAD):
const form = useForm<z.infer<typeof postSchema>>({
  resolver: zodResolver(postSchema as any) as any,
});

// Fix: Create a union resolver or use a flat schema for the form
// Option A: Use a flat schema that doesn't discriminate at form level
// Option B: Custom resolver that handles discriminated unions
```

- [ ] Research: does `@hookform/resolvers/zod` support discriminated unions natively?
- [ ] If not, create a flat form schema and validate discrimination server-side

### 7b. Remove `as any` casts in server actions

```ts
// Current (BAD):
const firstError = (parsed.error.flatten().fieldErrors as any);

// Fix: Type the error shape explicitly or use a generic helper
```

- [ ] Create `getFirstZodError(error: ZodError): string` helper
- [ ] Replace all manual error extraction with the helper

### 7c. `paddy_condition` type alignment

- [ ] Zod: `z.coerce.number()` → slider outputs number
- [ ] DB: `text` column
- [ ] Decision: Change DB column to `numeric` or keep `text` and convert in `assemblePost`?
  - **Recommendation:** Keep DB as `text` (migration stability). Add explicit `String()` in `assemblePost`.

---

## Phase 8: Hide Unimplemented Features 🟡 TODO

### 8a. Follow/Network features

- [ ] Follow button: add "Coming Soon" tooltip or disable with message
- [ ] Follower/following counts: hide or show "—" instead of hardcoded 0
- [ ] Network page (`/mynetwork`): add "Coming Soon" banner or redirect to `/feed`
- [ ] Following feed filter: show "Coming Soon" or disable tab

### 8b. Messages page

- [ ] `/messages` route exists but has no implementation
- [ ] Add "Coming Soon" placeholder or remove from nav

---

## Phase 9: Code Cleanup 🟢 TODO

- [ ] Delete `src/components/post/comment-section.tsx` if no comments table exists
- [ ] Remove unused `Comment` type from `types/index.ts` (or keep with a TODO)
- ✅ Remove unused `PostFormData` type from `types/index.ts`
- ✅ Remove redundant `updated_at` manual set in `updateProfile`
- ✅ Fix registration avatar race condition — move avatar update to a separate action called after profile creation

---

## Phase 10: Error Handling & Resilience 🟡 TODO

### 10a. Error boundaries

- ✅ Add `error.tsx` to `(main)` route group
- ✅ Add `error.tsx` to `(main)/feed/` for feed-specific errors
- ✅ Add `error.tsx` to `(main)/search/` for search errors

### 10b. Consistent error pattern

- ✅ Standardize server action return type:
  ```ts
  type ActionResult<T = void> =
    | { success: true; data?: T; redirect?: string }
    | { success: false; error: string, redirect?: string };
  ```
- ✅ Apply to all server actions (`auth/actions.ts`, `posts/actions.ts`)

### 10c. Not-found pages

- ✅ Add `not-found.tsx` to `(main)` route group
- ✅ Add `not-found.tsx` to `(main)/profile/[username]/` for missing profiles
- ✅ Add `not-found.tsx` to `(main)/posts/[id]/` for missing posts

---

## Phase 11: Performance 🟢 TODO

- ✅ Add `revalidate` tags to feed queries
- ✅ Implement cursor-based pagination properly in feed (currently fetches `pageSize + 1`)
- ✅ Profile page: deduplicate profile fetch (layout + page both fetch)
- ✅ Search: add debounce on client before calling server action

---

## Phase 12: docs/database.md Rewrite 🔴 TODO

Current docs are stale — they document columns (`user_id`, `title`, `description`, `variety`, `quantity_unit`, `price_unit`) that don't exist in actual migrations.

- [ ] Rewrite to match actual `supabase/migrations/` DDL
- [ ] Include all 7 tables: regions, townships, market_status, profiles, posts, post_images, saved_posts
- [ ] Include all indexes, constraints, RLS policies, triggers, functions
- [ ] Include storage bucket docs
- [ ] Verify against running Supabase instance

---

