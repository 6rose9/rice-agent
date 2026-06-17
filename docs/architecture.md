# စပါးအောင်သွယ် — Architecture

## Project Overview

A professional networking and marketplace platform for Myanmar's rice industry. Connects farmers, traders, agents, and general users through structured profiles, discovery-focused search, and buying/selling posts — combining the networking model of LinkedIn with the intent-driven marketplace model of a trading platform.

**Core value loop:** A farmer creates a profile, posts rice for sale with location and price, and a trader discovers them through search filters. Trust is built through profile identity and follow relationships.

---

## Tech Stack

| Layer | Technology | Rationale |
|---|---|---|---|
| Frontend Framework | Next.js (App Router) | Server components for SEO/performance, client components for interactivity |
| Language | TypeScript (strict) | End-to-end type safety from database to UI |
| Styling | Tailwind CSS | Utility-first, mobile-first responsive design |
| Component Library | shadcn/ui | Unstyled accessible primitives, tree-shakeable, themeable |
| Auth | Supabase Auth (email/password) | Managed auth with built-in RLS integration |
| Database | Supabase PostgreSQL | Row-Level Security, JSONB for bilingual fields, real-time support |
| File Storage | Supabase Storage | Image hosting for avatars and post images |
| State Management | TanStack Query | Server-state caching, paginated feed, optimistic mutations; app has minimal client state so Redux/Zustand not needed |
| Deployment | Vercel (frontend) + Supabase (backend) | Edge deployment, free-tier viable for MVP |

---

## Database Schema

### Entity Relationship Diagram

```
regions ──1:many── townships ──1:many── profiles
                      │
                      └──1:many── posts ──1:many── post_images

auth.users ──1:1── profiles ──1:many── posts
                      │
                      ├──1:many── follows (as follower)
                      └──1:many── follows (as following)
```

Six tables total: two reference tables seeded by migration (`regions`, `townships`), and four application tables (`profiles`, `posts`, `post_images`, `follows`).

---

### Table: `regions`

Reference table — 15 Myanmar states, regions, and the union territory. Seeded by migration, read-only at runtime.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `serial` | PK | Auto-incrementing integer |
| `name` | `jsonb` | NOT NULL | Bilingual: `{"en": "Yangon", "my": "ရန်ကုန်"}` |
| `sort_order` | `smallint` | NOT NULL, DEFAULT 0 | Controls display order in dropdowns |

**Seed data (15 rows):**

| id | name (en) | name (my) |
|---|---|---|
| 1 | Ayeyarwady | ဧရာဝတီ |
| 2 | Bago | ပဲခူး |
| 3 | Chin | ချင်း |
| 4 | Kachin | ကချင် |
| 5 | Kayah | ကယား |
| 6 | Kayin | ကရင် |
| 7 | Magway | မကွေး |
| 8 | Mandalay | မန္တလေး |
| 9 | Mon | မွန် |
| 10 | Naypyidaw | နေပြည်တော် |
| 11 | Rakhine | ရခိုင် |
| 12 | Sagaing | စစ်ကိုင်း |
| 13 | Shan | ရှမ်း |
| 14 | Tanintharyi | တနင်္သာရီ |
| 15 | Yangon | ရန်ကုန် |

**RLS:** Authenticated read. No insert/update/delete by application users.

---

### Table: `townships`

Reference table — approximately 200 Myanmar townships prioritized by population, each under a parent region. Seeded by migration, read-only at runtime.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `serial` | PK | Auto-incrementing integer |
| `region_id` | `int` | FK → `regions.id`, NOT NULL | Parent region/state |
| `name` | `jsonb` | NOT NULL | Bilingual: `{"en": "Hlaingthaya", "my": "လှိုင်သာယာ"}` |
| `sort_order` | `smallint` | NOT NULL, DEFAULT 0 | Display ordering within region |

**Indexes:**
- `(region_id)` — for cascading dropdown: pick region → fetch townships

**RLS:** Authenticated read. No insert/update/delete by application users.

---

### Table: `profiles`

One row per registered user. Extends `auth.users` (Supabase-managed credentials table) with the public-facing identity.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `uuid` | PK, FK → `auth.users.id` ON DELETE CASCADE | Mirrors the Supabase Auth user identity |
| `username` | `text` | UNIQUE, NOT NULL, 3–30 chars, regex `^[a-z0-9_]+$` | URL-safe handle for `/profile/[username]` routes |
| `full_name` | `text` | NOT NULL | Display name |
| `role` | `text` | NOT NULL, CHECK IN (`'farmer'`, `'trader'`, `'agent'`, `'general'`) | One of four user roles |
| `about` | `text` | nullable, max 500 chars | Bio or business description |
| `township_id` | `int` | FK → `townships.id`, NOT NULL | User's base township |
| `avatar_url` | `text` | nullable | Supabase Storage public URL for profile photo |
| `status` | `text` | nullable, CHECK IN (`'Looking for Buyers'`, `'Looking for Suppliers'`, `'Buying Rice'`, `'Selling Rice'`, `'Available as Agent'`, `'Open for Partnership'`) | Current market-status badge |
| `created_at` | `timestamptz` | NOT NULL, DEFAULT `now()` | |
| `updated_at` | `timestamptz` | NOT NULL, DEFAULT `now()` | |

**Indexes:**
- `username` (unique lookup for route resolution)
- `(role, township_id)` (search filters)
- `township_id` (join performance)

**RLS:**
- **SELECT:** All authenticated users can read all profiles
- **INSERT:** Authenticated user can create their own profile (`id = auth.uid()`)
- **UPDATE:** Owner can update their own profile
- **DELETE:** Owner can delete their own profile

---

### Table: `posts`

Buying and selling listings created by users. Core marketplace content.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `uuid` | PK, DEFAULT `gen_random_uuid()` | |
| `user_id` | `uuid` | FK → `profiles.id` ON DELETE CASCADE, NOT NULL | Post author |
| `type` | `text` | NOT NULL, CHECK IN (`'buying'`, `'selling'`) | Intent direction |
| `title` | `text` | NOT NULL, max 200 chars | Short summary of the listing |
| `description` | `text` | nullable, max 2000 chars | Details: quantity available/needed, variety, terms, contact preference |
| `rice_type` | `text` | nullable | Free-text in V1; e.g. ဧည့်မထ, ရက်စော, ဧကရီ, ရွှေဝါ |
| `variety` | `text` | nullable | Sub-type or grade |
| `quantity` | `numeric` | nullable | |
| `quantity_unit` | `text` | nullable, DEFAULT `'တင်း'` | e.g. တင်း, အိတ်, တန် |
| `price` | `numeric` | nullable | Deliberately nullable — not all listings quote price |
| `price_unit` | `text` | nullable, DEFAULT `'ကျပ်'` | Per-unit; defaults to MMK |
| `township_id` | `int` | FK → `townships.id`, NOT NULL | Township-level location of the rice / buyer |
| `address` | `text` | NOT NULL, max 300 chars | Granular detail: village, ward, market name, landmark |
| `is_active` | `boolean` | NOT NULL, DEFAULT `true` | Soft-delete / mark-as-resolved toggle |
| `created_at` | `timestamptz` | NOT NULL, DEFAULT `now()` | |
| `updated_at` | `timestamptz` | NOT NULL, DEFAULT `now()` | |

**Indexes:**
- `(user_id, created_at DESC)` — user's own posts on their profile
- `(type, township_id, created_at DESC)` — filtered feed/search by type and location
- `(created_at DESC)` — global feed (latest-first)
- `township_id` — join performance

**RLS:**
- **SELECT:** All authenticated users can read active posts; inactive only visible to owner
- **INSERT:** Authenticated user can create posts with themselves as author
- **UPDATE:** Owner can update their own posts
- **DELETE:** Owner can delete their own posts (soft: set `is_active = false`)

---

### Table: `post_images`

Multi-image support per post. One post can have zero or more images.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `uuid` | PK, DEFAULT `gen_random_uuid()` | |
| `post_id` | `uuid` | FK → `posts.id` ON DELETE CASCADE, NOT NULL | Parent post |
| `image_url` | `text` | NOT NULL | Supabase Storage public URL |
| `sort_order` | `smallint` | NOT NULL, DEFAULT 0 | Display ordering (first image = 0) |
| `created_at` | `timestamptz` | NOT NULL, DEFAULT `now()` | |

**Constraints:** Maximum 5 images per post (enforced at application layer; database allows enforcing via trigger if needed).

**Indexes:** `(post_id)`.

**RLS:**
- **SELECT:** All authenticated users can read images for posts they can see
- **INSERT:** Post owner can add images to their own posts
- **DELETE:** Post owner can remove images from their own posts

---

### Table: `follows`

Junction table for the follow/unfollow social-graph feature. A user follows another user to see their posts and build their network.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `uuid` | PK, DEFAULT `gen_random_uuid()` | |
| `follower_id` | `uuid` | FK → `profiles.id` ON DELETE CASCADE, NOT NULL | Who clicked "Follow" |
| `following_id` | `uuid` | FK → `profiles.id` ON DELETE CASCADE, NOT NULL | Who is being followed |
| `created_at` | `timestamptz` | NOT NULL, DEFAULT `now()` | |

**Constraints:**
- `UNIQUE(follower_id, following_id)` — prevent duplicate follows
- `CHECK(follower_id != following_id)` — cannot follow yourself

**Indexes:**
- `(follower_id)` — "who am I following?" queries
- `(following_id)` — "who follows me?" queries

**RLS:**
- **SELECT:** All authenticated users can read all follow relationships
- **INSERT:** Authenticated user can create follows where they are the follower
- **DELETE:** Authenticated user can delete their own follows (`follower_id = auth.uid()`)
- **UPDATE:** Not applicable — no mutable fields beyond insert/delete

---

### Auth Model

Supabase Auth manages user identity via `auth.users`. Registration creates an `auth.users` row; the application creates a corresponding `profiles` row on first login or via an onboarding flow.

**Flow:**
1. User registers with email + password → Supabase creates `auth.users` row
2. User is redirected to onboarding → creates `profiles` row with role, name, township, status
3. On subsequent logins, Supabase Auth validates credentials → `profiles` row is available via `auth.uid()`
4. RLS policies in all tables reference `auth.uid()` and join to `profiles` to enforce per-row access

**Session:** Supabase cookie-based session for Next.js App Router, managed via middleware (`src/lib/supabase/middleware.ts` — updateSession pattern).

---

## Folder Structure

```
rice-agent/
├── .env.local                          # Supabase URL, anon key
├── .env.example
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── components.json                     # shadcn/ui config
├── postcss.config.mjs
├── supabase/
│   ├── config.toml
│   └── migrations/
│       └── 00001_initial_schema.sql    # All 6 tables + indexes + RLS + seed data
│
├── public/
│   ├── favicon.ico
│   └── og-image.png
│
└── src/
    ├── app/
    │   ├── layout.tsx                  # Root layout (providers, fonts)
    │   ├── page.tsx                    # Landing → redirect to /feed
    │   ├── globals.css
    │   │
    │   ├── (auth)/                     # Auth route group (minimal layout)
    │   │   ├── layout.tsx              # Centered, no sidebar/header chrome
    │   │   ├── login/page.tsx
    │   │   └── register/page.tsx
    │   │
    │   ├── (main)/                     # Protected route group (full chrome)
    │   │   ├── layout.tsx              # Header + sidebar + auth guard
    │   │   ├── feed/page.tsx           # Latest posts feed
    │   │   ├── profile/
    │   │   │   ├── [username]/page.tsx # Public profile view
    │   │   │   ├── create/page.tsx     # First-time profile onboarding
    │   │   │   └── edit/page.tsx       # Edit own profile
    │   │   ├── posts/
    │   │   │   ├── create/page.tsx     # New buying or selling post
    │   │   │   ├── [id]/page.tsx       # Single post detail
    │   │   │   └── [id]/edit/page.tsx  # Edit post
    │   │   ├── search/
    │   │   │   └── page.tsx            # Search users + filters
    │   │   └── network/
    │   │       ├── page.tsx            # My network overview
    │   │       ├── followers/page.tsx
    │   │       └── following/page.tsx
    │   │
    │   └── api/                        # Route handlers (if needed)
    │
    ├── components/
    │   ├── ui/                         # shadcn/ui primitives
    │   ├── layout/
    │   │   ├── header.tsx
    │   │   ├── sidebar.tsx             # Desktop navigation
    │   │   └── mobile-nav.tsx          # Bottom nav on mobile
    │   ├── auth/
    │   │   ├── login-form.tsx
    │   │   └── register-form.tsx
    │   ├── profile/
    │   │   ├── profile-card.tsx
    │   │   ├── profile-form.tsx
    │   │   ├── avatar-upload.tsx
    │   │   └── status-badge.tsx
    │   ├── posts/
    │   │   ├── post-card.tsx
    │   │   ├── post-form.tsx
    │   │   ├── post-feed.tsx
    │   │   └── image-upload.tsx
    │   ├── search/
    │   │   ├── search-bar.tsx
    │   │   └── user-search-results.tsx
    │   └── network/
    │       ├── follow-button.tsx
    │       └── user-list.tsx
    │
    ├── lib/
    │   ├── supabase/
    │   │   ├── client.ts               # Browser client (singleton)
    │   │   ├── server.ts               # Server client (cookie-based)
    │   │   └── middleware.ts           # updateSession for Next.js middleware
    │   ├── types/
    │   │   └── database.ts             # Generated: `supabase gen types`
    │   ├── validators/
    │   │   ├── profile.ts              # Zod schemas for profile form
    │   │   └── post.ts                 # Zod schemas for post form
    │   └── utils/
    │       ├── cn.ts                   # clsx + tailwind-merge helper
    │       ├── constants.ts            # Roles, statuses, rice types
    │       └── format.ts              # Date, price, quantity formatters
    │
    └── hooks/
        ├── use-auth.ts                 # Auth state, login, logout, register
        ├── use-profile.ts              # Profile CRUD
        ├── use-posts.ts                # Post CRUD + list queries
        ├── use-feed.ts                 # Paginated feed
        ├── use-search.ts              # Debounced search with filters
        └── use-follow.ts             # Follow/unfollow + counts
```

### Route Design

| Route Group | Purpose | Auth |
|---|---|---|
| `(auth)/` | Minimal layout for login/register pages | Public (redirect if logged in) |
| `(main)/` | Full app chrome: header, sidebar, mobile nav | Protected (redirect to login if not) |

**Route paths:**

| Path | Page | Notes |
|---|---|---|
| `/login` | Login | Supabase Auth email/password |
| `/register` | Register | → redirects to profile create |
| `/feed` | Global post feed | Latest posts, paginated |
| `/profile/[username]` | Public profile view | Read-only; Follow button if not self |
| `/profile/create` | Onboarding | First-time profile setup after register |
| `/profile/edit` | Edit own profile | Form pre-filled with current data |
| `/posts/create` | New post | Type selector: buying or selling |
| `/posts/[id]` | Post detail | Full post with images |
| `/posts/[id]/edit` | Edit post | Owner only |
| `/search` | Search users | Name, role, township, status filters |
| `/network` | My network | Follower/following counts |
| `/network/followers` | Followers list | |
| `/network/following` | Following list | |

---

## Feature Roadmap

### Phase 1 — Foundation
| Deliverable | Priority |
|---|---|
| Next.js + TypeScript + Tailwind + shadcn/ui project scaffolding | P0 |
| Supabase project: database, migrations, RLS, seed data | P0 |
| Supabase client (browser, server, middleware) | P0 |
| Auth UI: register, login, logout | P0 |
| Auth middleware protecting `(main)/` routes | P0 |

### Phase 2 — Professional Identity
| Deliverable | Priority |
|---|---|
| Profile onboarding (create after first register) | P0 |
| Role selection: farmer / trader / agent / general | P0 |
| Cascading region → township select | P0 |
| Profile edit: name, about, township, status | P0 |
| Public profile page: `/profile/[username]` | P0 |
| Status badge component | P1 |
| Avatar upload to Supabase Storage | P2 (deferred to post-MVP) |

### Phase 3 — Marketplace
| Deliverable | Priority |
|---|---|
| Create buying post form | P0 |
| Create selling post form | P0 |
| Global feed: latest posts, paginated | P0 |
| Edit / delete own posts | P0 |
| Post detail page | P1 |
| Post image upload (multi-image, max 5) | P2 (deferred to post-MVP) |

### Phase 4 — Discovery
| Deliverable | Priority |
|---|---|
| Search users by name | P0 |
| Filter users by role | P0 |
| Filter users by township/region | P0 |
| Filter users by status | P1 |
| Search posts by keyword | P2 (V2) |

### Phase 5 — Network
| Deliverable | Priority |
|---|---|
| Follow / unfollow button on profile and search results | P0 |
| Followers list page | P1 |
| Following list page | P1 |
| Following feed (posts from followed users) | P2 (V2 — needs network density) |

### Phase 6 — V2 (Post-MVP)
- Direct messaging between users
- User verification badges (trust system)
- Ratings and reviews
- Post image support
- Following feed
- Post search & filter
- Myanmar-language UI (my-MM localization)
- PWA for mobile install
- Advanced text search with trigram GIN indexes
- Password reset flow (self-service)

### Phase 7 — V3 (Platform)
- Market price insights dashboard
- Trade-history tracking
- Aggregated supply/demand analytics
- In-app and email notifications
- Role-specific dashboards
- Promoted / boosted posts
- Premium verified profiles

---

## Risks

### Technical

| Risk | Severity | Mitigation |
|---|---|---|
| **RLS complexity** — Fine-grained row-level security across public/private boundaries; a misconfigured policy leaks data or blocks legitimate access | Medium | Write RLS policies before application code; test every query path with policy tester; use Supabase's `auth.uid()` consistently |
| **Image storage cost** — Unmoderated uploads could exhaust Supabase Storage free tier | Medium | 5 MB/file cap, max 5 images/post; image upload deferred to post-MVP |
| **Feed performance** — Paginated global feed with profile + township + region joins as data grows | Low (V1) | Index on `posts(created_at DESC)`; cursor-based pagination; image count capped; V2: materialized views if needed |
| **Unicode encoding** — Myanmar users mix Zawgyi and Unicode encodings; mixed-encoding text breaks search | High | Accept both in V1 free-text fields; server-side Unicode normalization planned for V2; document the limitation |
| **Cold start** — Empty database produces empty feed; zero retention | High | Seed demo profiles + posts in dev/staging; onboarding wizard prompts first post immediately after profile creation |

### Product

| Risk | Severity | Mitigation |
|---|---|---|
| **Chicken-and-egg** — No users → no posts → no reason to join | High | Onboarding flow creates first post immediately after profile; design post-creation as the natural next step |
| **Trust deficit** — No verification; anyone can claim any role or identity | Medium | Prominent "Unverified" label in V1; verification system in V2 roadmap |
| **Mobile-first mismatch** — Target users primarily access via mobile; web-first dev risks poor mobile UX | Medium | Tailwind mobile-first responsive design from day one; test on low-end Android devices; PWA in V2 |
| **Facebook incumbency** — Existing Facebook groups have network effect, zero friction, and Myanmar-language UI | High | Target pain points FB cannot solve: structured search by role/location, persistent searchable profiles, role filtering; do not compete on chat or general content |

### Business

| Risk | Severity | Mitigation |
|---|---|---|
| **No monetization path in V1** | Low | Freemium in V2 (verified profiles, promoted posts, market analytics); V1 is adoption-only |
| **Low digital literacy** — Farmers may struggle with email/password signup | Medium | Myanmar-language onboarding in V2; SMS-based auth or social login in V2 |
| **Single platform dependency** — Vercel + Supabase | Low | Both well-established; Supabase supports self-hosting as escape hatch; schema is portable PostgreSQL |

---

## MVP Scope

MVP is **Phases 1–5, P0 items only**. The target user story:

> A farmer registers, creates a profile, posts rice for sale with location and details. A trader searches for farmers by role and region, discovers the profile, and follows them.

### MVP Deliverables

**Authentication**
- [ ] Register with email + password (Supabase Auth)
- [ ] Login / logout
- [ ] Route protection: all `(main)/` pages behind auth

**Profiles**
- [ ] Profile creation on first login: full name, username, role, township (cascading select), status
- [ ] Edit profile
- [ ] Public profile page at `/profile/[username]` with role badge and status badge
- [ ] Profiles display: full name, username, role, status, about, township + region, join date

**Posts**
- [ ] Create buying post: title, description, rice type, quantity, price, township + address
- [ ] Create selling post: same fields
- [ ] View own posts on profile page
- [ ] Edit own posts
- [ ] Delete own posts (soft: `is_active = false`)

**Feed**
- [ ] Global feed: latest posts from all users, paginated (cursor-based)
- [ ] Post cards show: title, description, rice type, quantity, price, township + region, author name + role, relative time
- [ ] Feed is responsive: mobile-first, single-column on mobile, wider on desktop

**Search**
- [ ] Search users by name (free-text)
- [ ] Filter users by role
- [ ] Filter users by region → township

**Network**
- [ ] Follow button on profile pages and search results
- [ ] Unfollow button (toggle)
- [ ] "Following" indicator visible on profiles (is the current user following this profile?)

**Non-functional**
- [ ] Mobile-responsive: all pages usable at 360px viewport width
- [ ] Consistent shadcn/ui design system
- [ ] RLS enforced on all tables — no data leaks
- [ ] Deployed and live: Vercel (frontend) + Supabase (database, storage)

### Explicitly Deferred

| Item | Rationale |
|---|---|
| Post image upload | Adds storage cost + upload UX complexity; text-only posts validate the concept first |
| Avatar upload | Deferred; use initial-based avatars or Gravatar fallback |
| Following feed tab | Requires network density to be useful; global feed sufficient for MVP |
| Post search / post filters | User discovery is the MVP unlock; content search is V2 |
| Followers/following list pages | Follow button alone proves the network concept |
| Password reset flow | Can be handled manually for MVP; Supabase supports self-service reset, enable in V2 |
| Localization (my-MM) | English-first for faster development; bilingual UI in V2 |
| Direct messaging | Requires real-time infrastructure; significant scope; V2 |
