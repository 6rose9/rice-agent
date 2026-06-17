# စပါးအောင်သွယ် — Database Schema

## Overview

Six tables on Supabase PostgreSQL. Two reference tables (`regions`, `townships`) seeded by migration and read-only at runtime. Four application tables (`profiles`, `posts`, `post_images`, `follows`) with full Row-Level Security.

`profiles` extends `auth.users` (Supabase-managed identity) via a 1:1 FK relationship. All policies reference `auth.uid()` for row-level access control.

---

## Entity Relationship Diagram

```
┌──────────┐       ┌──────────┐       ┌──────────┐
│  regions  │──1:many─│ townships │──1:many─│ profiles  │
│  (15 rows)│       │ (~200 rows)│       │ (0...*)  │
└──────────┘       └──────────┘       └──────────┘
                                             │
                         ┌───────────────────┤
                   1:many│             1:many│
                    ┌──────────┐       ┌──────────┐
                    │  posts   │       │ follows  │
                    │ (0...*)  │       │ (0...*)  │
                    └──────────┘       └──────────┘
                         │
                   1:many│
                    ┌──────────┐
                    │post_images│
                    │ (0...*)  │
                    └──────────┘

auth.users (Supabase) ──1:1── profiles (id REFERENCES auth.users.id)
```

---

## Conventions

| Convention | Value |
|---|---|
| Timestamp type | `timestamptz` (always) |
| UUID generation | `gen_random_uuid()` |
| PK type (reference tables) | `smallint` GENERATED ALWAYS AS IDENTITY |
| PK type (application tables) | `uuid` DEFAULT `gen_random_uuid()` |
| Bilingual text | `jsonb` with keys `"en"` and `"my"` |
| Auto-updating timestamps | Trigger function `update_updated_at_column()` |
| Soft deletion | `is_active` boolean (posts only) |
| Ordering within groups | `sort_order smallint` |

---

## Extensions

```sql
-- Required by Supabase; ensures auth.users is available
-- (Supabase enables this automatically; listed for reference)
create extension if not exists "pgcrypto";
```

`pgcrypto` provides `gen_random_uuid()` which Supabase uses for UUID defaults.

---

## Trigger: `updated_at`

Shared trigger function — attached to any table with an `updated_at` column.

```sql
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;
```

---

## Table 1: `regions`

**Purpose:** Reference table for Myanmar's 15 states, regions, and union territory.  
**Access:** Read-only at runtime. Seeded by migration.  
**Synonym lifecycle:** Inserted once per migration; never updated or deleted by application code.

### DDL

```sql
create table regions (
    id          smallint generated always as identity primary key,
    name        jsonb     not null,                     -- {"en": "Yangon", "my": "ရန်ကုန်"}
    sort_order  smallint  not null default 0
);
```

### Constraints

| Constraint | Type | Column | Detail |
|---|---|---|---|
| `regions_pkey` | PK | `id` | `generated always as identity` |
| `regions_name_check` | CHECK | `name` | `jsonb_typeof(name) = 'object'` (optional; can be enforced at app layer) |

### Indexes

| Index | Columns | Type | Purpose |
|---|---|---|---|
| — (PK only) | — | — | 15 rows; no secondary indexes needed |

### Seed Data (15 rows)

| id | name | sort_order |
|---|---|---|
| 1 | `{"en":"Ayeyarwady", "my":"ဧရာဝတီ"}` | 1 |
| 2 | `{"en":"Bago", "my":"ပဲခူး"}` | 2 |
| 3 | `{"en":"Chin", "my":"ချင်း"}` | 3 |
| 4 | `{"en":"Kachin", "my":"ကချင်"}` | 4 |
| 5 | `{"en":"Kayah", "my":"ကယား"}` | 5 |
| 6 | `{"en":"Kayin", "my":"ကရင်"}` | 6 |
| 7 | `{"en":"Magway", "my":"မကွေး"}` | 7 |
| 8 | `{"en":"Mandalay", "my":"မန္တလေး"}` | 8 |
| 9 | `{"en":"Mon", "my":"မွန်"}` | 9 |
| 10 | `{"en":"Naypyidaw", "my":"နေပြည်တော်"}` | 10 |
| 11 | `{"en":"Rakhine", "my":"ရခိုင်"}` | 11 |
| 12 | `{"en":"Sagaing", "my":"စစ်ကိုင်း"}` | 12 |
| 13 | `{"en":"Shan", "my":"ရှမ်း"}` | 13 |
| 14 | `{"en":"Tanintharyi", "my":"တနင်္သာရီ"}` | 14 |
| 15 | `{"en":"Yangon", "my":"ရန်ကုန်"}` | 15 |

### RLS

```sql
alter table regions enable row level security;

-- All authenticated users can read
create policy "Regions are viewable by authenticated users"
    on regions for select
    to authenticated
    using (true);
```

No INSERT/UPDATE/DELETE policies — regions are immutable to application code. Seed data is loaded by migration under the `postgres` role.

---

## Table 2: `townships`

**Purpose:** Reference table of ~200 Myanmar townships prioritized by population, each belonging to a region.  
**Access:** Read-only at runtime. Seeded by migration.  

### DDL

```sql
create table townships (
    id          smallint generated always as identity primary key,
    region_id   smallint  not null references regions(id),
    name        jsonb     not null,                     -- {"en": "Hlaingthaya", "my": "လှိုင်သာယာ"}
    sort_order  smallint  not null default 0
);
```

### Constraints

| Constraint | Type | Column | Detail |
|---|---|---|---|
| `townships_pkey` | PK | `id` | `generated always as identity` |
| `townships_region_id_fkey` | FK | `region_id` | → `regions(id)`. No cascade — reference data is never deleted |

### Indexes

| Index | Columns | Type | Rationale |
|---|---|---|---|
| `idx_townships_region_id` | `region_id` | BTREE | Cascading dropdown: "given a region, list its townships." Query: `select * from townships where region_id = $1 order by sort_order, name` |

No additional indexes at ~200 rows. If V2 adds free-text township search on `name->>'en'` and `name->>'my'`, a GIN index on `name` with `jsonb_path_ops` becomes appropriate.

### Seed Data Strategy

~200 rows total, distributed across 15 regions, sorted by population within each region. High-population townships first. Sample:

| region | Township count (approx) | Key examples |
|---|---|---|
| Yangon | ~30 | Hlaingthaya, Shwepyitha, Insein, Mingaladon, North Okkalapa |
| Mandalay | ~20 | Chanayethazan, Chanmyathazi, Mahaaungmye, Amarapura, Pyigyidagun |
| Shan | ~25 | Taunggyi, Lashio, Muse, Kengtung, Tachileik |
| Ayeyarwady | ~20 | Pathein, Hinthada, Myaungmya, Maubin, Labutta |
| Bago | ~18 | Bago, Pyay, Taungoo, Tharyarwady, Nyaunglebin |
| Sagaing | ~15 | Sagaing, Monywa, Shwebo, Kale, Tamu |
| Magway | ~12 | Magway, Pakokku, Minbu, Thayet, Yenangyaung |
| Mon | ~8 | Mawlamyine, Thaton, Kyaikto, Ye, Mudon |
| Rakhine | ~10 | Sittwe, Kyaukphyu, Thandwe, Maungdaw, Mrauk-U |
| Kayin | ~8 | Hpa-an, Myawaddy, Kawkareik |
| Kachin | ~8 | Myitkyina, Bhamo, Mohnyin, Putao |
| Tanintharyi | ~8 | Dawei, Myeik, Kawthaung |
| Chin | ~6 | Hakha, Falam, Tedim |
| Kayah | ~5 | Loikaw, Demoso |
| Naypyidaw | ~5 | Zabuthiri, Pyinmana, Tatkon |

### RLS

```sql
alter table townships enable row level security;

-- All authenticated users can read
create policy "Townships are viewable by authenticated users"
    on townships for select
    to authenticated
    using (true);
```

No INSERT/UPDATE/DELETE policies. Seed data loaded by migration.

---

## Table 3: `profiles`

**Purpose:** Public identity per registered user. Extends `auth.users` 1:1.  
**Access:** Users can read all profiles; can only write their own.  
**Key design decision:** `township_id` is NOT NULL — location is required at profile creation. Region is resolved via join (`townships.region_id`).

### DDL

```sql
create table profiles (
    id          uuid        primary key references auth.users(id) on delete cascade,
    username    text        not null unique,
    full_name   text        not null,
    role        text        not null,
    about       text,
    township_id smallint    not null references townships(id),
    avatar_url  text,
    status      text,
    created_at  timestamptz not null default now(),
    updated_at  timestamptz not null default now()
);
```

### Constraints

| Constraint | Type | Column | Detail |
|---|---|---|---|
| `profiles_pkey` | PK | `id` | FK → `auth.users(id)` ON DELETE CASCADE |
| `profiles_username_key` | UNIQUE | `username` | URL-safe, 3–30 chars, `^[a-z0-9_]+$` (enforced at app + CHECK) |
| `profiles_username_check` | CHECK | `username` | `username ~ '^[a-z0-9_]{3,30}$'` |
| `profiles_role_check` | CHECK | `role` | `role in ('farmer', 'trader', 'agent', 'general')` |
| `profiles_status_check` | CHECK | `status` | `status in ('Looking for Buyers', 'Looking for Suppliers', 'Buying Rice', 'Selling Rice', 'Available as Agent', 'Open for Partnership')` |
| `profiles_about_check` | CHECK | `about` | `char_length(about) <= 500` |
| `profiles_township_id_fkey` | FK | `township_id` | → `townships(id)`. No cascade — township is required, and reference data is never deleted |

### Indexes

| Index | Columns | Type | Rationale |
|---|---|---|---|
| `idx_profiles_username` | `username` | BTREE UNIQUE | Profile route resolution: `/profile/[username]` → `select * from profiles where username = $1` |
| `idx_profiles_role_township` | `(role, township_id)` | BTREE | Most common search filter combo: "find all farmers in this township" |
| `idx_profiles_township_id` | `township_id` | BTREE | Join performance when resolving profile location |

**No full-text index on `full_name` in V1.** User search by name uses `ilike` with a leading-wildcard pattern (`%query%`), which BTREE cannot accelerate. This is acceptable at MVP scale. V2 adds a `pg_trgm` GIN index for fast `ilike` search.

### Trigger

```sql
create trigger update_profiles_updated_at
    before update on profiles
    for each row
    execute function update_updated_at_column();
```

### RLS

```sql
alter table profiles enable row level security;

-- Anyone authenticated can view all profiles
create policy "Profiles are viewable by authenticated users"
    on profiles for select
    to authenticated
    using (true);

-- Users can only insert their own profile
create policy "Users can create their own profile"
    on profiles for insert
    to authenticated
    with check (id = auth.uid());

-- Users can only update their own profile
create policy "Users can update their own profile"
    on profiles for update
    to authenticated
    using (id = auth.uid())
    with check (id = auth.uid());

-- Users can delete their own profile (cascades to posts, follows, post_images)
create policy "Users can delete their own profile"
    on profiles for delete
    to authenticated
    using (id = auth.uid());
```

### Profile Handling After Registration

Supabase Auth creates the `auth.users` row on registration. The application inserts the `profiles` row during onboarding.

**Option A (recommended for V1): Application-layer.** After Supabase sign-up returns successfully, the client redirects to `/profile/create`. The onboarding form collects `username`, `full_name`, `role`, `township_id`, and `status`, then inserts into `profiles`.

**Option B (V2 alternative): Database trigger.** A function on `auth.users` insert auto-creates a stub `profiles` row, which the user completes later. This eliminates the "registered but no profile" gap but adds trigger complexity.

V1 uses Option A.

---

## Table 4: `posts`

**Purpose:** Buying and selling listings — the marketplace core.  
**Key design decisions:**
- `township_id` is NOT NULL (location required)
- `address` is NOT NULL (granular detail)
- `price` is nullable (not all posts quote price)
- `is_active` for soft-delete (posts are never hard-deleted via normal flow)
- `quantity` is `numeric` to support fractional units (e.g., 2.5 တင်း)

### DDL

```sql
create table posts (
    id            uuid        primary key default gen_random_uuid(),
    user_id       uuid        not null references profiles(id) on delete cascade,
    type          text        not null,
    title         text        not null,
    description   text,
    rice_type     text,
    variety       text,
    quantity      numeric,
    quantity_unit text        default 'တင်း',
    price         numeric,
    price_unit    text        default 'ကျပ်',
    township_id   smallint    not null references townships(id),
    address       text        not null,
    is_active     boolean     not null default true,
    created_at    timestamptz not null default now(),
    updated_at    timestamptz not null default now()
);
```

### Constraints

| Constraint | Type | Column | Detail |
|---|---|---|---|
| `posts_pkey` | PK | `id` | UUID v4 |
| `posts_user_id_fkey` | FK | `user_id` | → `profiles(id)` ON DELETE CASCADE |
| `posts_township_id_fkey` | FK | `township_id` | → `townships(id)`. No cascade — reference data |
| `posts_type_check` | CHECK | `type` | `type in ('buying', 'selling')` |
| `posts_title_check` | CHECK | `title` | `char_length(title) between 1 and 200` |
| `posts_description_check` | CHECK | `description` | `char_length(description) <= 2000` |
| `posts_address_check` | CHECK | `address` | `char_length(address) between 1 and 300` |
| `posts_quantity_check` | CHECK | `quantity` | `quantity > 0` (if provided) |
| `posts_price_check` | CHECK | `price` | `price >= 0` (if provided) |

### Indexes

| Index | Columns | Type | Rationale |
|---|---|---|---|
| `idx_posts_created_at` | `created_at DESC` | BTREE | **Global feed.** Query: `select * from posts where is_active = true order by created_at desc limit 20` |
| `idx_posts_user_created` | `(user_id, created_at DESC)` | BTREE | **Profile posts tab.** Query: `select * from posts where user_id = $1 and is_active = true order by created_at desc` |
| `idx_posts_type_township` | `(type, township_id, created_at DESC)` | BTREE | **Filtered feed/search.** Query: `select * from posts where type = 'selling' and township_id = $1 and is_active = true order by created_at desc` |
| `idx_posts_township_id` | `township_id` | BTREE | Join performance when resolving post location |
| `idx_posts_is_active` | `is_active` | BTREE (partial) | **Partial index** on active posts only: `where is_active = true`. Makes the primary feed query hit only active rows. |

**Partial index detail (recommended for V1, essential for V2):**

```sql
create index idx_posts_active_feed
    on posts (created_at desc)
    where is_active = true;
```

This replaces the role of `idx_posts_created_at` for feed queries — the partial index is smaller and faster. Keep the full-column index only if needed for admin/debug queries on inactive posts.

### Trigger

```sql
create trigger update_posts_updated_at
    before update on posts
    for each row
    execute function update_updated_at_column();
```

### RLS

```sql
alter table posts enable row level security;

-- Active posts are visible to all authenticated users
create policy "Active posts are viewable by authenticated users"
    on posts for select
    to authenticated
    using (is_active = true);

-- Owners can view their own inactive posts
-- (This OR-policy approach: the broader policy above + owner override below.
--  PostgreSQL evaluates all policies with OR semantics for the same command.)
-- Actually, Supabase RLS for SELECT ORs policies together. So we define:
create policy "Owners can view their own inactive posts"
    on posts for select
    to authenticated
    using (user_id = auth.uid());

-- Users can insert their own posts
create policy "Users can create posts"
    on posts for insert
    to authenticated
    with check (user_id = auth.uid());

-- Users can update their own posts
create policy "Users can update their own posts"
    on posts for update
    to authenticated
    using (user_id = auth.uid())
    with check (user_id = auth.uid());

-- Users can delete their own posts (hard-delete; soft-delete uses UPDATE)
create policy "Users can delete their own posts"
    on posts for delete
    to authenticated
    using (user_id = auth.uid());
```

**RLS note:** The two SELECT policies combine with OR semantics — an authenticated user sees a post if `is_active = true` OR `user_id = auth.uid()`. This is the correct behavior: everyone sees active posts, and owners additionally see their own inactive posts.

---

## Table 5: `post_images`

**Purpose:** Multi-image support per post. V2 feature — table defined now in schema but unused until image upload ships post-MVP.  
**Key design:** Max 5 images per post (enforced at application layer; trigger enforcement optional in V2).

### DDL

```sql
create table post_images (
    id          uuid        primary key default gen_random_uuid(),
    post_id     uuid        not null references posts(id) on delete cascade,
    image_url   text        not null,
    sort_order  smallint    not null default 0,
    created_at  timestamptz not null default now()
);
```

### Constraints

| Constraint | Type | Column | Detail |
|---|---|---|---|
| `post_images_pkey` | PK | `id` | UUID v4 |
| `post_images_post_id_fkey` | FK | `post_id` | → `posts(id)` ON DELETE CASCADE |
| `post_images_url_check` | CHECK | `image_url` | `char_length(image_url) > 0` |

### Indexes

| Index | Columns | Type | Rationale |
|---|---|---|---|
| `idx_post_images_post_id` | `(post_id, sort_order)` | BTREE | Fetch all images for a post, ordered. Query: `select * from post_images where post_id = $1 order by sort_order` |

### RLS

```sql
alter table post_images enable row level security;

-- Images on active posts are visible to all authenticated users
create policy "Images on active posts are viewable"
    on post_images for select
    to authenticated
    using (
        exists (
            select 1 from posts
            where posts.id = post_images.post_id
            and (posts.is_active = true or posts.user_id = auth.uid())
        )
    );

-- Post owner can insert images
create policy "Post owner can add images"
    on post_images for insert
    to authenticated
    with check (
        exists (
            select 1 from posts
            where posts.id = post_images.post_id
            and posts.user_id = auth.uid()
        )
    );

-- Post owner can delete images
create policy "Post owner can delete images"
    on post_images for delete
    to authenticated
    using (
        exists (
            select 1 from posts
            where posts.id = post_images.post_id
            and posts.user_id = auth.uid()
        )
    );
```

No UPDATE policy — images are immutable after insert (only URL and sort_order are set once; if reordering is needed in V2, add an UPDATE policy).

---

## Table 6: `follows`

**Purpose:** Social-graph junction table. User A follows User B.  
**Key design:** UNIQUE(follower, following) + CHECK(self-follow prevention).

### DDL

```sql
create table follows (
    id           uuid        primary key default gen_random_uuid(),
    follower_id  uuid        not null references profiles(id) on delete cascade,
    following_id uuid        not null references profiles(id) on delete cascade,
    created_at   timestamptz not null default now(),

    constraint follows_unique unique (follower_id, following_id),
    constraint follows_no_self check (follower_id != following_id)
);
```

### Constraints

| Constraint | Type | Column | Detail |
|---|---|---|---|
| `follows_pkey` | PK | `id` | UUID v4 |
| `follows_follower_id_fkey` | FK | `follower_id` | → `profiles(id)` ON DELETE CASCADE |
| `follows_following_id_fkey` | FK | `following_id` | → `profiles(id)` ON DELETE CASCADE |
| `follows_unique` | UNIQUE | `(follower_id, following_id)` | No duplicate follows |
| `follows_no_self` | CHECK | — | `follower_id != following_id` |

When either profile is deleted, the follow row is removed by CASCADE. Both directions covered.

### Indexes

| Index | Columns | Type | Rationale |
|---|---|---|---|
| `idx_follows_follower` | `follower_id` | BTREE | "Who am I following?" — `select * from follows where follower_id = $1` |
| `idx_follows_following` | `following_id` | BTREE | "Who follows me?" — `select * from follows where following_id = $1` |
| (Unique constraint) | `(follower_id, following_id)` | BTREE UNIQUE | "Am I following this user?" single-row lookup. Also serves as the `follower_id` index for that query |

**Note:** The UNIQUE constraint on `(follower_id, following_id)` creates a composite index that covers `follower_id` queries. A separate `idx_follows_follower` on `follower_id` alone may be redundant in practice, but is listed here for clarity — the query planner can use the unique index's leading column `follower_id` for "who am I following?" queries. We keep `idx_follows_following` as the extra index since the unique index does not cover `following_id`-led queries.

### RLS

```sql
alter table follows enable row level security;

-- All follows are publicly visible to authenticated users
create policy "Follows are viewable by authenticated users"
    on follows for select
    to authenticated
    using (true);

-- Users can follow others (as themselves)
create policy "Users can follow others"
    on follows for insert
    to authenticated
    with check (follower_id = auth.uid());

-- Users can unfollow (delete their own follows)
create policy "Users can unfollow"
    on follows for delete
    to authenticated
    using (follower_id = auth.uid());
```

No UPDATE policy — a follow row has no mutable state beyond insert/delete.

---

## Index Summary

| Table | Index | Columns | Purpose |
|---|---|---|---|
| `townships` | `idx_townships_region_id` | `region_id` | Cascading region → township dropdown |
| `profiles` | `idx_profiles_username` | `username` (unique) | Route lookup: `/profile/[username]` |
| `profiles` | `idx_profiles_role_township` | `(role, township_id)` | Search: filter by role + location |
| `profiles` | `idx_profiles_township_id` | `township_id` | Join: resolve profile location |
| `posts` | `idx_posts_active_feed` | `created_at DESC` WHERE `is_active = true` | Global feed (partial index) |
| `posts` | `idx_posts_user_created` | `(user_id, created_at DESC)` | User's own posts on profile |
| `posts` | `idx_posts_type_township` | `(type, township_id, created_at DESC)` | Filtered feed by type + location |
| `posts` | `idx_posts_township_id` | `township_id` | Join: resolve post location |
| `post_images` | `idx_post_images_post_id` | `(post_id, sort_order)` | Load images for a post |
| `follows` | (unique constraint) | `(follower_id, following_id)` | Uniqueness + "am I following?" lookup |
| `follows` | `idx_follows_following` | `following_id` | "Who follows me?" lookup |

**Total: 10 indexes on 6 tables.**

---

## Query Patterns & Index Coverage

### Profile Resolution
```sql
select p.*, t.name as township_name, r.name as region_name
from profiles p
join townships t on t.id = p.township_id
join regions r on r.id = t.region_id
where p.username = $1;
```
**Indexes hit:** `idx_profiles_username`, `townships_pkey`, `regions_pkey`. Single-row lookup. ✓

### User Search (by name, role, township)
```sql
select p.*, t.name as township_name, r.name as region_name
from profiles p
join townships t on t.id = p.township_id
join regions r on r.id = t.region_id
where p.full_name ilike '%' || $1 || '%'
  and p.role = $2
  and p.township_id = $3
limit 20;
```
**Indexes hit:** `idx_profiles_role_township` for the role+township filter; name `ilike` does a sequential scan over the filtered set — acceptable at MVP scale. V2 adds `pg_trgm` GIN on `full_name`. ✓

### Global Feed
```sql
select p.*, pr.full_name, pr.role, pr.username, pr.avatar_url,
       t.name as township_name, r.name as region_name
from posts p
join profiles pr on pr.id = p.user_id
join townships t on t.id = p.township_id
join regions r on r.id = t.region_id
where p.is_active = true
order by p.created_at desc
limit 20;
```
**Indexes hit:** `idx_posts_active_feed` (partial index — fast), plus PK joins. ✓

### Followed Feed (V2)
```sql
select p.*, pr.full_name, pr.role, pr.username,
       t.name as township_name, r.name as region_name
from posts p
join profiles pr on pr.id = p.user_id
join townships t on t.id = p.township_id
join regions r on r.id = t.region_id
join follows f on f.following_id = p.user_id
where f.follower_id = $1
  and p.is_active = true
order by p.created_at desc
limit 20;
```
**Indexes hit:** `(follower_id, following_id)` unique index + `idx_posts_active_feed`. V2 query; listed for completeness. ✓

### Follow Status Check
```sql
select 1 from follows
where follower_id = $1 and following_id = $2;
```
**Indexes hit:** Unique constraint `(follower_id, following_id)` — single-row index lookup. ✓

### Follower/Following Counts
```sql
select count(*) from follows where follower_id = $1;   -- following count
select count(*) from follows where following_id = $1;  -- follower count
```
**Indexes hit:** `(follower_id, following_id)` unique for the first; `idx_follows_following` for the second. Both are index-only scans. ✓

### Active Posts Filtered by Type + Township
```sql
select p.*, pr.full_name, pr.role, pr.username,
       t.name as township_name, r.name as region_name
from posts p
join profiles pr on pr.id = p.user_id
join townships t on t.id = p.township_id
join regions r on r.id = t.region_id
where p.is_active = true
  and p.type = 'selling'
  and p.township_id = $1
order by p.created_at desc
limit 20;
```
**Indexes hit:** `idx_posts_type_township` for the type+township filter with `created_at DESC`. ✓

---

## Storage Buckets (Supabase)

| Bucket | Purpose | Max File Size | Max Files/Post | Public |
|---|---|---|---|---|
| `avatars` | Profile photos (V2) | 2 MB | 1 per profile | Yes (read) |
| `post-images` | Post listing images (V2) | 5 MB | 5 per post | Yes (read) |

Both buckets are deferred to post-MVP. Columns `avatar_url` and `image_url` are nullable; the application uses initial-based fallback avatars and text-only posts in V1.

---

## Enumeration Values

### `profiles.role`
```
farmer
trader
agent
general
```

### `profiles.status`
```
Looking for Buyers
Looking for Suppliers
Buying Rice
Selling Rice
Available as Agent
Open for Partnership
```
Nullable — a user may not set a status. Default UI: no badge shown.

### `posts.type`
```
buying
selling
```

### `posts.quantity_unit`
```
တင်း      (basket — traditional volumetric unit, ~20-25 kg depending on rice type)
အိတ်      (bag — typically 50 kg)
တန်       (ton — 1000 kg)
```
Default: `'တင်း'`. Free-form in V1 (no CHECK constraint beyond being text).

### `posts.price_unit`
```
ကျပ်      (MMK — Myanmar Kyat)
```
Default: `'ကျပ်'`. Free-form in V1 to allow per-unit specification (e.g., "ကျပ်/တင်း").

---

## Schema Migration Structure

```
supabase/
└── migrations/
    └── 20250615000000_initial_schema.sql
```

Single migration file containing, in order:

1. `create extension if not exists "pgcrypto"`
2. `create or replace function update_updated_at_column()`
3. `create table regions` + seed data + RLS
4. `create table townships` + seed data + RLS + index
5. `create table profiles` + constraints + RLS + indexes + trigger
6. `create table posts` + constraints + RLS + indexes + trigger
7. `create table post_images` + constraints + RLS + index
8. `create table follows` + constraints + RLS

---

## V2 Schema Extensions (Noted for Forward Compatibility)

| Enhancement | Detail |
|---|---|
| `pg_trgm` extension | GIN indexes on `profiles.full_name` and `posts.title` for fast `ILIKE` search |
| `conversations` table | Direct messaging between users |
| `messages` table | Individual messages within a conversation |
| `reviews` table | Ratings and reviews between users |
| `verifications` table | User verification requests and badges |
| `notifications` table | In-app notification system |
| `profiles` → `search_vector` | Generated `tsvector` column with Myanmar tokenizer consideration |
| Trigger: enforce max 5 images per post | Database-level enforcement for `post_images` |

None of these are created in the V1 migration.
