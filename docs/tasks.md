# Development Tasks — စပါးအောင်သွယ်

Granular, checkable tasks for MVP delivery. Each task is a single unit of work.

---

## Phase 1 — Foundation

### 1.1 Project Scaffolding

- ✅ T001: Run `create-next-app` with TypeScript, Tailwind CSS, App Router
- ✅ T002: Install and configure `shadcn/ui` (run `init`, verify `components.json`)
- ✅ T003: Add shadcn primitives: Button, Input, Textarea, Select, Card, Badge, Avatar, Tabs, Skeleton, Sheet, Dialog, DropdownMenu, Toast, Separator
- ✅ T004: Create `src/lib/utils.ts` — `clsx` + `tailwind-merge` helper
- ✅ T005: Create `src/lib/constants.ts` — roles enum, post types enum, rice types list, quantity units, price units
- ✅ T006: Create `src/lib/utils/format.ts` — `formatRelativeTime()`, `formatPrice()`, `formatQuantity()`
- ✅ T007: Set up global CSS variables in `globals.css` (colors, fonts, mobile-first)
- ✅ T008: Configure favicon and `logo.svg` in `public/`

### 1.2 Supabase Setup

- ✅ T009: Create Supabase project, note URL and anon key
- ✅ T010: Create `.env.local` with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- ✅ T011: Create `.env.example` with placeholder values
- ✅ T012: Install `@supabase/supabase-js` and `@supabase/ssr`
- ✅ T013: Create `src/lib/supabase/client.ts` — browser client singleton
- ✅ T014: Create `src/lib/supabase/server.ts` — server client (cookie-based via `createServerClient`)
- ✅ T015: Create `src/lib/supabase/middleware.ts` — `updateSession` for Next.js middleware
- ✅ T016: Create `src/middleware.ts` — call `updateSession`, protect all `/` routes except `/login` and `/register`

### 1.3 Database Migration

- ✅ T017: Write migration `auth_schema.sql` — pgcrypto extension, `update_updated_at_column()` trigger function, `handle_new_user()` trigger, `soft_delete_account()` function
- ✅ T018: Migration: `regions` table — DDL, RLS (public read), seed 15 regions with bilingual JSONB names
- ✅ T019: Migration: `townships` table — DDL, `region_id` FK, index on `region_id`, RLS (public read)
- ✅ T020: Migration: seed ~360 townships with bilingual JSONB names in `seed.sql` (prioritized by population, grouped by region)
- ✅ T021: Migration: `profiles` table — DDL with CHECK constraints (role, username, deleted_at), FKs, triggers (auto-create on signup)
- ✅ T022: Migration: `profiles` RLS — SELECT all (hide deleted), INSERT own, UPDATE own, DELETE own
- ✅ T023: Migration: `posts` table — DDL with CHECK constraints (type, rice_type required for trading), FKs, `is_active` soft delete
- ✅ T024: Migration: `posts` indexes — `idx_posts_created_at`, `idx_posts_author_created`, `idx_posts_type_created`
- ✅ T025: Migration: `posts` RLS — SELECT public (anon read), INSERT author, UPDATE author, DELETE author
- ✅ T026: Migration: `post_images` table — DDL, FK to posts, index on `post_id`
- ✅ T027: Migration: `post_images` RLS — SELECT public, INSERT author, DELETE author
- [ ] T028: Migration: `follows` table — DDL, UNIQUE(follower_id, following_id), CHECK(no self-follow), FKs
- [ ] T029: Migration: `follows` RLS — SELECT all, INSERT as follower, DELETE as follower
- [ ] T030: Create `post_images` count trigger — enforce max 5 images per post at database level
- ✅ T031: Run migrations against Supabase — `auth_schema.sql`, `20260618000000`–`20260619000001`, `user_soft_delete.sql` applied
- ✅ T031a: Migration: `saved_posts` table — composite PK (user_id, post_id), RLS owner-only (`20260619000000_create_saved_posts.sql`)
- ✅ T031b: Migration: `posts` location columns — `latitude`, `longitude` added (`20260619000001_add_post_location.sql`)
- ✅ T031c: Migration: soft delete — `deleted_at` on profiles, `is_active` on posts, RLS policy updates (`user_soft_delete.sql`)
- ✅ T031d: Migration: fix anon read — `20260618000003_fix_anon_posts_access.sql` allows public/guest SELECT on posts & post_images

### 1.4 Type Generation & Validation

- ✅ T032: Run `supabase gen types typescript` → `src/lib/types/database.ts` (currently hand-written in `src/types/index.ts`)
- ✅ T033: Create `src/lib/validations/auth.ts` — Zod schemas for auth (phone, password, login, register steps 1–3, profile update)
- ✅ T034: Create `src/lib/validations/post.ts` — Zod schemas for post create/edit (generalPostSchema, tradingPostSchema, discriminated union)

### 1.5 Auth UI

- ✅ T035: Create `src/app/(auth)/layout.tsx` — centered minimal layout (no header/sidebar, centered card)
- ✅ T036: Create `src/components/auth/login-form.tsx` — phone number input, password input, "Login" button, "No account? Register" link
- ✅ T037: Create `src/app/(auth)/login/page.tsx` — renders LoginForm
- ✅ T038: Create `src/components/auth/register-form.tsx` — email input, password input, confirm password, etc and "Register" button, "Already have account? Login" link
- ✅ T039: Create `src/app/(auth)/register/page.tsx` — renders RegisterForm
- ✅ T040: Create `src/hooks/use-auth.ts` — `signUp()`, `signIn()`, `signOut()`, `user`, `loading` (via Supabase `onAuthStateChange`)
- ✅ T041: Add form validation to login form —  phone number, password min 6 chars, disable button while loading, show inline errors
- ✅ T042: Add form validation to register form — phone number, password min 6 chars, confirm match, disable button while loading, show inline errors
- ✅ T043: Handle auth errors — wrong password, email already exists, network error (show Toast)
- ✅ T044: Redirect after login — proxy.ts redirects authenticated users to `/feed`, unauthenticated away from protected routes (⚠️ file is `src/proxy.ts`, should be `src/middleware.ts` for Next.js to pick it up)
- ✅ T045: Add logout button to sidebar (desktop) and settings menu (mobile) — calls `signOut()`, redirects to `/login`

### 1.6 App Shell & Layout

- ✅ T046: Create `src/app/(main)/layout.tsx` — auth guard (redirect to `/login` if no session), import AppShell
- ✅ T047: Create `src/components/layout/header.tsx` — mobile TopBar: logo, notification bell, messages icon (48px fixed)
- ✅ T048: Create `src/components/layout/sidebar.tsx` — desktop sidebar (240px): logo, NavItems (Home, Search, Profile, Create Post, Network), user footer with avatar + name
- ✅ T049: Create NavItem component — icon, label, active state (highlight when current route matches), href
- ✅ T050: Create `src/components/layout/mobile-nav.tsx` — BottomNav (5 tabs): Home, Search, Create (FAB), Messages, Profile (fixed, 56px)
- ✅ T051: Create `src/components/layout/container.tsx` — responsive max-width wrapper
- ✅ T052: Create `src/app/layout.tsx` — root layout: load fonts, apply global CSS, wrap children in Supabase provider
- ✅ T053: Create `src/app/page.tsx` — landing page: redirect authenticated users to `/feed`, unauthenticated to `/login`
- [ ] T054: Create OfflineBanner component — "You are offline" banner, check `navigator.onLine`
- ✅ T055: Create Skeleton component — reusable pulsing gray block for loading states
- ✅ T056: Create EmptyCard component — illustration placeholder, title, description, optional CTA button

---

## Phase 2 — Professional Identity

### 2.1 Profile Onboarding

- ✅ T057: Create `src/components/profile/profile-form.tsx` — full form: full_name, username, role (4-tab toggle), township select (cascading region → township), status dropdown, about textarea
- ✅ T058: Create cascading region → township select component — fetches regions, on select fetches townships for that region
- ✅ T059: Add client-side Zod validation to profile form — username 3-30 chars alphanumeric+underscore, full_name required, role required, township required, about max 500
- ✅ T060: Add server-side validation — check username uniqueness before insert (query profiles table)
- ✅ T063: Handle username collision error — inline error "Username already taken"

### 2.2 Profile Edit

- ✅ T064: Create `src/app/(main)/profile/edit/page.tsx` — edit page: pre-fill ProfileForm with current data, PATCH on submit
- ✅ T065: Add "Edit Profile" link/button — visible only on own profile, navigates to `/profile/edit`
- ✅ T066: Handle 404 — if `/profile/[username]` not found, show "Profile not found" empty state

### 2.3 Public Profile Page

- ✅ T067: Create `src/app/(main)/profile/[username]/page.tsx` — fetch profile by username, render ProfileHeader + Posts tab (default)
- ✅ T068: Create ProfileHeader component — cover photo area (solid color/gradient placeholder), avatar (initial-based), full_name, role badge, status badge, location (township + region), follow stats (posts/followers/following counts)
- ✅ T069: Create StatusBadge component — renders profile status (colored chip: green=looking, orange=buying, blue=selling, etc.)
- ✅ T070: Create ProfileTabs component — Posts | About tabs (Network tab deferred to Phase 5)
- ✅ T071: Profile "Posts" tab — fetch user's active posts with cursor pagination, render PostCard list
- ✅ T072: Profile "Posts" tab — empty state: "No posts yet" (if own profile, show "Create your first post" CTA)
- ✅ T073: Profile "About" tab — render bio, location with region+township, role, status, join date, activity summary (post count this month, top category)
- ✅ T074: Profile "About" tab — if own profile, show "Edit" pencil icon that links to `/profile/edit`

### 2.4 Profile Edge Cases

- ✅ T075: Profile not found — 404 UI ("This profile doesn't exist")
- ✅ T076: Profile loading state — skeleton: cover + avatar + name + stats + tab bar + post skeletons
- ✅ T077: Profile fetch error — "Couldn't load profile" + [Retry] button
- ✅ T078: Own profile vs other profile — hide "Edit Profile" button from other profiles; show FollowButton on other profiles
- ✅ T079: Back navigation — mobile "← Back" in TopBar navigates to previous page

---

## Phase 3 — Marketplace

### 3.1 Create Post

- ✅ T080: Create `src/components/posts/post-form.tsx` — type toggle (Buying / Selling), title input, description textarea, rice_type dropdown, variety input, quantity + quantity_unit, price + price_unit, township select (cascading), address input
- ✅ T081: Add client-side Zod validation to post form — type required, title 1-200 chars required, address 1-300 chars required, quantity > 0 if provided, price >= 0 if provided
- ✅ T082: Create `src/app/(main)/posts/create/page.tsx` — full-page form on mobile (sheet from bottom), render PostForm
- ✅ T083: Wrap create post page in Modal on desktop (560px, dimmed overlay) — responsive: full page on mobile, modal on >=768px (not needed, using page instead)
- ✅ T084: Server Actions with useActionState in components (create-post-form.tsx,edit-post-modal.tsx)
- ✅ T085: Handle create post loading state — disable submit button, show spinner
- ✅ T086: Handle create post error — show Toast "Failed to create post", keep form data intact
- ✅ T087: After successful create — redirect to `/feed`, show Toast "Post created"
- [ ] T088: Cancel button — confirm dialog if form is dirty ("Discard post?" / "You have unsaved changes")

### 3.2 Edit & Delete Post

- ✅ T089: Create `src/app/(main)/posts/[id]/edit/page.tsx` — pre-fill PostForm with current post data
- ✅ T090: Add "Edit" option to PostMenu (three-dot menu on own posts only)
- ✅ T091: Add "Delete" option to PostMenu — ConfirmDialog: "Delete this post?", on confirm call `deletePost()` (sets `is_active = false`)
- ✅ T092: Handle edit post — owner only guard (if not owner, redirect to feed with Toast "Not authorized")
- ✅ T093: Handle delete post — remove from feed optimistically, rollback on error with Toast

### 3.3 Post Card

- ✅ T094: Create `src/components/posts/post-card.tsx` — author avatar (initial-based), full_name, role badge, relative time, post type badge (Buying/Selling), title, description (truncated to 3 lines), rice_type, quantity, price, location (township + region)
- ✅ T095: Create PostMeta component — rice_type chip, quantity + unit, price + unit, location, address
- ✅ T096: Create PostMenu component — three-dot menu (Edit, Delete if owner; Report placeholder)
- ✅ T097: PostCard mobile — full width, stacked layout, 2-line description preview
- ✅ T098: PostCard desktop — wider card (640px), 3-line description, more metadata visible
- ✅ T099: PostCard — long description: show "Show more" / "Show less" toggle
- ✅ T100: PostCard — missing optional fields: don't render empty chips (no rice_type → skip chip, no price → skip price)

### 3.4 Global Feed

- ✅ T101: Create `src/components/posts/post-feed.tsx` — renders list of PostCards with cursor-based infinite scroll
- ✅ T102: Create `src/app/(main)/feed/page.tsx` — global feed: latest active posts, paginated (20 per page)
- ✅ T103: Create `src/hooks/use-feed.ts` — `fetchFeed(cursor?)`, supabase query with joins (profiles, townships, regions), ordered by `created_at DESC`
- ✅ T104: Feed infinite scroll — `IntersectionObserver` on sentinel div at bottom, fetch next page when visible
- ✅ T105: Feed loading — 3 skeleton cards on first load (Skeleton variant of PostCard)
- ✅ T106: Feed loading more — 1 skeleton card at bottom while fetching next page
- ✅ T107: Feed empty — EmptyCard: "No posts yet" + "Be the first to post" + CTA to `/posts/create`
- ✅ T108: Feed error — inline error card: "Couldn't load feed" + [Retry] button
- ✅ T109: Feed — handle deleted posts: if post is_active=false, remove from feed optimistically (already filtered by query)
- [ ] T110: Feed — real-time: subscribe to `posts` INSERT to show "N new posts" banner at top (optimistic, debounced)

### 3.5 Feed Filters

- ✅ T111: Create FeedFilter component — horizontal scrollable tabs: All | Buying | Selling
- ✅ T112: Implement filter logic — "Buying" filters `posts.type = 'buying'`, "Selling" filters `posts.type = 'selling'`, "All" no filter
- ✅ T113: Filter active state — highlight selected tab, animate underline
- ✅ T114: Filter loading — when switching filter, show skeleton cards (not stale data)
- ✅ T115: Filter empty — per-filter empty state: "No buying posts" / "No selling posts" with different messaging

---

## Phase 4 — Discovery

### 4.1 Search UI

- ✅ T116: Create `src/components/search/search-bar.tsx` — search input with magnifying glass icon, clear button, debounced (300ms)
- ✅ T117: Create `src/app/(main)/search/page.tsx` — search page: SearchInput, filter chips, results list
- ✅ T118: Create filter chips row — horizontal scroll: role filters (All, Farmer, Trader, Agent), location filters (region chips)
- ✅ T119: Filter chip — toggle on/off, active state with filled background, show count in results header
- ✅ T120: Create search results list — mixed: users (ProfileCard compact) and posts (PostCard compact)
- ✅ T121: Create user result row — avatar, full_name, role badge, location (township + region), status badge, FollowButton
- ✅ T122: Create post result row — compact: title, type badge, author name, location, price (if present)
- ✅ T123: Create `src/hooks/use-search.ts` — `search(query, filters)`, debounced, fetches profiles (ILIKE name) + posts (ILIKE title/description)

### 4.2 Search States

- ✅ T124: Search idle — show recent searches (stored in localStorage) and trending keywords (hardcoded V1 seeds)
- ✅ T125: Recent searches — click to re-search, "Clear All" button, individual "✕" to remove one
- ✅ T126: Search typing — show skeleton rows immediately (don't wait for debounce)
- ✅ T127: Search loading — skeleton rows in results area while fetching
- ✅ T128: Search results — header: `"{{query}}" — {{count}} results`, filter summary chips
- ✅ T129: Search no results — EmptyCard: "No results for '{{query}}'" + "Try different keywords or filters" + [Clear Filters] button
- [ ] T130: Search error — inline error: "Search failed" + [Retry] button

### 4.3 Search Filters

- ✅ T131: Implement role filter — add `role` param to query: `profiles.role = $1`
- ✅ T132: Implement location filter — add `township_id` param to query (derived from township/region select)
- ✅ T133: Combine filters — role AND location, combine with OR for name ILIKE across both profiles and posts
- [ ] T134: Active filter count badge — show "3 filters active" chip, "Clear All" link next to results header

---

## Phase 5 — Network

### 5.1 Follow / Unfollow

- [ ] T135: Create `src/components/network/follow-button.tsx` — FollowButton: "Follow" (outline) / "Following" (filled), toggles on click
- [ ] T136: Create `src/hooks/use-follow.ts` — `follow(userId)`, `unfollow(userId)`, `isFollowing(userId)`, `fetchFollowerCount(userId)`, `fetchFollowingCount(userId)`
- [ ] T137: Add FollowButton to ProfileHeader — visible only when viewing other user's profile; hidden on own profile
- [ ] T138: Add FollowButton to user search results — visible on each user row
- [ ] T139: Follow optimistic update — button changes to "Following" immediately; revert on error with Toast
- [ ] T140: Unfollow — ConfirmDialog guard (or just toggle with optimistic update)
- [ ] T141: Handle follow/unfollow error — if not authenticated, redirect to login; if already following, ignore; if not following, ignore

### 5.2 Profile Stats

- [ ] T142: Add follower/following counts to ProfileHeader — `fetchFollowerCount()` + `fetchFollowingCount()`, display in stats row
- [ ] T143: Stats click — tap follower count opens modal/list showing followers; tap following count shows following (deferred full pages to V2, but inline modal is MVP)
- [ ] T144: "Following" indicator on profile — when viewing another profile, show "Following" badge if current user follows them (in addition to FollowButton state)

### 5.3 Network Pages (V2 — deferred)

- [ ] T145: (V2) Create `/network` page — my network overview, follower/following counts
- [ ] T146: (V2) Create `/network/followers` page — list of followers with FollowButton
- [ ] T147: (V2) Create `/network/following` page — list of who I follow with FollowButton

---

## Phase 6 — Polish & Cross-Cutting

### 6.1 Responsive Design

- [ ] T148: Audit all pages at 360px viewport — ensure no horizontal scroll, readable text, touchable buttons (min 44px tap target)
- [ ] T149: Audit all pages at 768px+ — sidebar visible, right rail on feed, modal for create post
- [ ] T150: Audit all pages at 1440px+ — max-width containment, centered feed, right rail not stretched
- [ ] T151: Mobile keyboard handling — create post textarea pushes form up, doesn't hide submit button
- [ ] T152: Touch optimization — PostCard actions (Like, Comment, Share) have min 44px tap targets, adequate spacing
- [ ] T153: Safe areas — BottomNav respects `env(safe-area-inset-bottom)` on iOS

### 6.2 Accessibility

- [ ] T154: All interactive elements have focus styles (keyboard navigation visible ring)
- [ ] T155: Form inputs have associated `<label>` elements
- [ ] T156: Buttons have accessible names (aria-label on icon-only buttons)
- [ ] T157: Color contrast — text meets WCAG AA (4.5:1 for body, 3:1 for large text)
- [ ] T158: Skip-to-content link as first focusable element

### 6.3 Error & Edge Cases

- [ ] T159: Create ErrorBoundary component — catches render errors, shows fallback UI with [Reload] button
- [ ] T160: Create global error page — `src/app/error.tsx`: "Something went wrong" + [Try Again]
- [ ] T161: Create global not-found page — `src/app/not-found.tsx`: "Page not found" + [Go to Feed]
- [ ] T162: Network offline — OfflineBanner visible, disable form submits, queue actions (optimistic)
- [ ] T163: Rate limiting UI — if Supabase returns 429, show Toast "Too many requests. Please wait."
- [ ] T164: Session expiry — if API returns 401, redirect to `/login` with Toast "Session expired"
- [ ] T165: Create ConfirmDialog component — title, description, confirm/cancel buttons, used by post delete, unfollow

### 6.4 Loading States

- [ ] T166: Page transitions — loading skeleton matches page layout shape (not a full-page spinner)
- [ ] T167: Feed skeleton — 3 PostCard skeletons with avatar circle + 2 text lines + 1 wide text line
- [ ] T168: Profile skeleton — cover rectangle + avatar circle + 2 text lines + stats row + tab bar + 3 post skeletons
- [ ] T169: Search skeleton — input + 5 flat result row skeletons
- [ ] T170: Button loading — spinner inside button, disabled state, text changes to "Loading..."

### 6.5 Deployment

- [ ] T171: Push code to GitHub repository
- [ ] T172: Connect Vercel to GitHub, configure build settings (Next.js preset)
- [ ] T173: Set environment variables in Vercel: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] T174: Deploy to Vercel, verify production URL loads
- [ ] T175: Run database migration on production Supabase
- [ ] T176: Smoke test production: register → create profile → create post → view feed → search → follow
- [ ] T177: Verify RLS in production — attempt to access data as unauthenticated user (should fail)

---

## Task Summary

| Phase                           | Tasks                          | Description                                                    |
| ------------------------------- | ------------------------------ | -------------------------------------------------------------- |
| Phase 1 — Foundation            | T001–T056 + T031a–d (60 tasks) | Project setup, Supabase, DB migration, auth, app shell         |
| Phase 2 — Professional Identity | T057–T079 (21 tasks)           | Profile onboarding, edit, public profile, about                |
| Phase 3 — Marketplace           | T080–T115 (36 tasks)           | Create/edit/delete posts, post card, global feed, feed filters |
| Phase 4 — Discovery             | T116–T134 (19 tasks)           | Search UI, search states, search filters                       |
| Phase 5 — Network               | T135–T147 (13 tasks)           | Follow/unfollow, profile stats, network pages                  |
| Phase 6 — Polish                | T148–T177 (30 tasks)           | Responsive, a11y, error handling, loading states, deployment   |
| **Total**                       | **179 tasks**                  |                                                                |

### MVP Definition

MVP is **Phases 1–5, P0 tasks only** (skip T145–T147 which are V2). The target user story:

> A farmer registers, creates a profile, posts rice for sale with location and details. A trader searches for farmers by role and region, discovers the profile, and follows them.

### Deferred to V2

- T145–T147: Network follower/following list pages
- Post image upload (TBD)
- Avatar upload (TBD)
- Following feed tab
- Post search / post filters
- Password reset flow
- Localization (my-MM)
- Direct messaging

---

## Progress Report — 2026-06-22

### Completion by Phase

| Phase                           | Done    | Total   | %       | Status        |
| ------------------------------- | ------- | ------- | ------- | ------------- |
| Phase 1 — Foundation            | 56      | 60      | 93%     | 🟡 In Progress |
| Phase 2 — Professional Identity | 21      | 21      | 100%    | ✅ Done        |
| Phase 3 — Marketplace           | 32      | 36      | 89%     | 🟡 In Progress |
| Phase 4 — Discovery             | 0       | 19      | 0%      | 🔴 Not Started |
| Phase 5 — Network               | 0       | 13      | 0%      | 🔴 Not Started |
| Phase 6 — Polish                | 0       | 30      | 0%      | 🔴 Not Started |
| **Total**                       | **109** | **179** | **61%** |               |

### Key Gaps Remaining

| Area                | Missing Tasks                                                       | Impact                                                                                      |
| ------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| **1.1 Scaffolding** | —                                                                   | All done                                                                                    |
| **1.2 Supabase**    | —                                                                   | All done                                                                                    |
| **1.3 Migrations**  | T028–T030 (follows table, image trigger)                            | 🔴 **High** — `follows` table is a blocker for Phase 5                                       |
| **1.4 Types**       | T032 generated types                                                | Medium — hand-written types work but drift from schema over time                            |
| **1.6 App Shell**   | T054 OfflineBanner                                                  | Low — nice-to-have for rural connectivity                                                   |
| **3.1 Create Post** | T083 desktop modal, T084 `use-posts` hook, T088 cancel confirmation | Medium — desktop UX and code organization                                                   |
| **3.4 Feed**        | T110 real-time new posts banner                                     | Medium — users must manually refresh to see new posts                                       |
| **4.x Search**      | T116–T134 (all 19 tasks)                                            | 🔴 **High** — search page uses mock data only, no real Supabase queries                      |
| **5.x Network**     | T135–T144 (all 10 MVP tasks)                                        | 🔴 **High** — follow/unfollow entirely unimplemented, needs `follows` migration + UI + hooks |
| **6.x Polish**      | T148–T177 (all 30 tasks)                                            | 🟡 Medium — error boundaries, a11y, deployment all pending                                   |

### Blockers for MVP

1. **`follows` table migration** (T028–T029) — must exist before any follow/unfollow work
2. **Real search queries** (T116–T134) — search is entirely mock data
3. **Follow/unfollow system** (T135–T144) — core MVP user story requires this
4. **⚠️ Middleware filename** — `src/proxy.ts` must be renamed to `src/middleware.ts` for Next.js to use it as middleware

### Audit Notes (2026-06-22)

- Migrations actually exist in repo: `auth_schema.sql`, `20260618000000`–`20260619000001`, `user_soft_delete.sql`
- Seed files: `seed.sql` (361 townships), `seed-posts.sql` (5 dev users + posts)
- `.env.local` has 4 vars (`URL`, `PUBLISHABLE_KEY`, `SERVICE_ROLE_KEY`, `ANON_KEY`) but `.env.example` only lists 2
- `SERVICE_ROLE_KEY` is exposed as `NEXT_PUBLIC_` — security concern (visible in client bundle)
- Auth validators at `src/lib/validations/auth.ts` (not `validators/`)
- Post validators at `src/lib/validations/post.ts` (not `validators/`)
- Middleware logic in `src/proxy.ts` — needs rename to `src/middleware.ts`
