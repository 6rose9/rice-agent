# Plan: Public Feed + Auth-Gated Actions for စပါးအောင်သွယ်

## Summary

Build the home page so any visitor (no account required) can browse all posts.
Gate **create post**, **comment**, **react**, and **save post** behind authentication —
unauthenticated users who attempt these actions see a login/register prompt.

---

## Step 0 — Project Scaffold

- `npx create-next-app@latest .` with TypeScript, Tailwind CSS, App Router
- `npx shadcn-ui@latest init` to set up shadcn/ui
- Create Supabase project via CLI / dashboard
- Install `@supabase/supabase-js`, `@supabase/ssr` (server-side auth helpers)
- Create `.env.local` with `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Create `src/lib/supabase/` — client, server, middleware helpers per Supabase SSR docs

**Files to create:**
- `src/lib/supabase/client.ts` — browser client
- `src/lib/supabase/server.ts` — server-only client (cookies from `next/headers`)
- `src/lib/supabase/middleware.ts` — middleware helper to refresh session
- `src/middleware.ts` — Next.js middleware (session refresh only, no route blocking)

---

## Step 1 — Database Schema (Supabase Migration)

Run via Supabase SQL editor or migration file.

### Tables

```sql
-- Profiles extends auth.users
-- Phone is the primary identifier (Myanmar numbers); email is OPTIONAL
CREATE TABLE profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone       text UNIQUE NOT NULL,       -- normalized 09xxxxxxxxx
  email       text,                       -- OPTIONAL, for future notifications
  username    text UNIQUE NOT NULL,
  full_name   text,
  role        text CHECK (role IN ('farmer','trader','agent','general_user')),
  avatar_url  text,
  cover_url   text,
  bio         text,
  location    text,
  website     text,
  market_status text,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

-- Posts
CREATE TABLE posts (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id   uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type        text NOT NULL CHECK (type IN ('selling','buying')),
  content     text NOT NULL,
  rice_type   text,
  price       numeric,
  quantity    numeric,
  location    text,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

-- Post images
CREATE TABLE post_images (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id   uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  url       text NOT NULL,
  sort_order int DEFAULT 0
);

-- Comments
CREATE TABLE comments (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id   uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content   text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Reactions (likes)
CREATE TABLE reactions (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id   uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id   uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type      text DEFAULT 'like', -- V1: just 'like'; future: 'love','insightful',etc.
  created_at timestamptz DEFAULT now(),
  UNIQUE(post_id, user_id)  -- one reaction per user per post
);

-- Saved posts
CREATE TABLE saved_posts (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id   uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id   uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- Follows
CREATE TABLE follows (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  followed_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at  timestamptz DEFAULT now(),
  UNIQUE(follower_id, followed_id)
);
```

### RLS Policies (critical for public read)

```sql
-- Posts: anyone can SELECT, only author can INSERT/UPDATE/DELETE
CREATE POLICY "Posts are viewable by everyone" ON posts FOR SELECT USING (true);
CREATE POLICY "Only author can insert posts" ON posts FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Only author can update posts" ON posts FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Only author can delete posts" ON posts FOR DELETE USING (auth.uid() = author_id);

-- Same pattern for comments, reactions, saved_posts
```

### Supabase Storage Buckets

- `avatars/` — profile photos (public read)
- `covers/` — cover photos (public read)
- `post-images/` — post images (public read)

---

## Step 2 — shadcn/ui Components to Install

```
npx shadcn-ui@latest add button input textarea badge card skeleton
  separator dialog sheet dropdown-menu avatar
  tabs navigation-menu
```

Also install `lucide-react` (already a shadcn dependency) for icons.

---

## Step 3 — Auth System (Phone-First)

### Phone Validation (Myanmar)
- Format regex: `/^(09\d{7,9}|\+?959\d{7,8})$/`
- Accepts: `0912345678`, `09-123-456-789`, `+95912345678`
- Normalize on save: strip non-digits, ensure `09` prefix for local numbers
- Supabase: Disable "Confirm email" in Auth settings — no email confirmation needed

### Auth pages
- `src/app/(auth)/login/page.tsx` — login form (phone + password)
- `src/app/(auth)/register/page.tsx` — registration form (phone + password + name + optional email)
- `src/app/auth/callback/route.ts` — Supabase OAuth callback handler

### Auth provider
- `src/components/auth/auth-provider.tsx` — context provider wrapping the app
- Tracks `session`, `user`, `profile` state
- Provides `signUp(phone, password, metadata)`, `signIn(phone, password)`, `signOut()` methods
- On signUp: creates profile row with phone (and optional email), auto-logs in

### AuthModal component
- `src/components/auth/auth-modal.tsx` — reusable modal for unauthenticated-action interception
- Props: `open`, `onOpenChange`, `action` (e.g. "like this post")
- Shows brief message: "Sign in to {action}" with Login / Register tabs inside
- Login tab: phone + password
- Register tab: phone + password + full name + optional email
- Phone input with automatic Myanmar format validation
- On success: fires `onSuccess` callback so the original action can proceed

### useRequireAuth hook
- `src/hooks/use-require-auth.ts`
- Returns a function: `requireAuth(action: () => void, actionName: string)`
- If authenticated → calls `action()` immediately
- If not → opens `AuthModal`, stores the pending action, fires on success

### Middleware
- `src/middleware.ts`: only refreshes the Supabase session cookie (no route-guard blocking)
- Feed is fully public — middleware does NOT redirect unauthenticated users

---

## Step 4 — Layout & Navigation

### Root Layout
- `src/app/layout.tsx` — wrap with AuthProvider, Toaster, apply font

### Main Layout (feed-adjacent pages)
- `src/components/layout/top-bar.tsx` — logo "🍚 စပါးအောင်သွယ်", notification bell, messages icon
- `src/components/layout/bottom-nav.tsx` — mobile: Home, Search, Create(+), Messages, Profile
- `src/components/layout/sidebar.tsx` — desktop: same nav items, 240px left rail
- `src/components/layout/right-rail.tsx` — desktop: suggestions, trending, footer; 300px sticky

### Feed Page Layout
```
Mobile:  TopBar (fixed) → FeedFilter → PostCards (scroll) → BottomNav (fixed)
Desktop: Sidebar (left) → Feed (center, 640px) → RightRail (right, 300px)
```

---

## Step 5 — Feed Page (Public)

### Route: `/` (home/feed)

#### Data Fetching
- `src/lib/posts/queries.ts` — Supabase queries
  - `getPosts({ filter, cursor, limit })` — paginated feed query
  - Joins `profiles`, `post_images` for display
  - Filter by type: `'all' | 'buying' | 'selling' | 'following'`
  - `following` filter returns empty for unauthenticated users (graceful fallback)
- Use React Server Component for initial load → pass to client for infinite scroll

#### Components
| Component | Path | Notes |
|-----------|------|-------|
| `FeedFilter` | `src/components/feed/feed-filter.tsx` | Horizontal pill tabs: All, Buying, Selling, Following |
| `PostCard` | `src/components/feed/post-card.tsx` | Full card with avatar, content, images, badges, actions |
| `PostActions` | `src/components/feed/post-actions.tsx` | Like ❤️, Comment 💬, Share 🔗, Save 📌 |
| `SkeletonCard` | `src/components/feed/skeleton-card.tsx` | Pulsing gray blocks for loading state |
| `EmptyCard` | `src/components/feed/empty-card.tsx` | "No posts yet" illustration |
| `ErrorCard` | `src/components/feed/error-card.tsx` | Error + retry button |

#### PostCard Action Behavior (auth gating)
Each button in `PostActions` calls `requireAuth` before executing:

```
❤️ Like  → requireAuth(() => toggleReaction(postId), "like posts")
💬 Comment → requireAuth(() => openCommentSheet(postId), "comment on posts")
📌 Save  → requireAuth(() => toggleSave(postId), "save posts")
🔗 Share → native share API (no auth needed)
```

If user is not authenticated → AuthModal opens → after login, action executes.

#### PostCard detail (from wireframes)
- Author avatar + name + relative time
- Post type badge: 🏷️ SELLING (orange) or BUYING (blue)
- Content text (Myanmar-friendly, expandable)
- Image grid: 2-col mobile, 3-col desktop, max 4 images
- Meta row: 🌾 Rice Type · 💰 Price · 📦 Quantity · 📍 Location
- Action bar: ❤️ count · 💬 count · 🔗 Share · 📌 Save

#### States
| State | Implementation |
|-------|---------------|
| Loading | 3–5 SkeletonCards |
| Empty | EmptyCard with illustration + suggestion to follow traders |
| Error | ErrorCard + [Retry] button |
| Offline | OfflineBanner pinned below TopBar |

#### Infinite Scroll
- Use IntersectionObserver → fetch next page when sentinel enters viewport
- Cursor-based pagination via `created_at` timestamp

---

## Step 6 — Post Creation (Protected)

### Route: `/create` or a modal/sheet
- Mobile: full-page bottom sheet (per wireframes)
- Desktop: centered modal (560px)
- Both routes check auth — server-side redirect if unauthenticated

### Component: `CreatePostForm`
- Post type toggle: Selling 🛒 / Buying 💰
- Textarea (min 4 lines, auto-grow)
- Image upload (max 4, drag or pick)
- Optional detail fields: Rice Type dropdown, Price, Quantity, Location
- Validation: content required, inline error if empty
- [Post] button disabled until valid

### Image Upload Flow
- Upload to Supabase Storage `post-images/` bucket
- Generate public URL
- Insert `post_images` rows after post creation

---

## Step 7 — Comments (Protected)

- `CommentSection` component shown below PostCard (or expandable inline)
- List comments with author avatar, content, time
- Comment input box — calls `requireAuth` to gate writing
- Server action or API route to insert comment

---

## Step 8 — Auth Modal Polish

- Smooth open/close animation (shadcn Dialog)
- Tab switcher: Login ↔ Register
- Login: phone + password (Myanmar format validation)
- Register: phone + password + full name + optional email
- Phone input auto-formats: accepts `09xxxxxxxxx`, `+959xxxxxxxx`, strips spaces/dashes
- Profile auto-created via DB trigger on signup
- Error states: invalid phone format, wrong password, phone already registered
- After successful auth: fire pending action callback, auto-close modal

---

## Implementation Order

1. **Project scaffold** — Next.js + shadcn/ui + Supabase setup
2. **Database schema** — SQL migrations + RLS policies
3. **Supabase lib** — client/server/middleware helpers
4. **Auth system** — AuthProvider, login/register pages, AuthModal, callback route
5. **Layout shell** — TopBar, BottomNav, Sidebar, RightRail
6. **Feed page** — Server component for initial data, PostCard, FeedFilter, infinite scroll
7. **Post actions** — useRequireAuth hook wired to Like, Comment, Save buttons
8. **Create post** — CreatePostModal/Sheet with image upload
9. **Comments** — CommentSection with auth gate
10. **Polish** — Skeletons, EmptyCard, ErrorCard, OfflineBanner, responsive tweaks

---

## Key Design Decisions

1. **Public feed by default**: RLS `SELECT USING (true)` on posts, comments, profiles — no auth needed to read.
2. **Auth gate at point of action**: Instead of hiding action buttons, show them but intercept click with `requireAuth`. This signals "these features exist" to drive signups while keeping the feed fully browsable.
3. **"Following" filter for guests**: Returns empty or shows "Sign in to see posts from people you follow" card — a soft upsell.
4. **Cursor-based pagination** not offset: stable under new insertions, better UX for real-time feeds.
5. **Auth modal over redirect**: Keeps user context (scroll position, feed state) intact. Modal → login → action fires → modal closes. No page navigation.
