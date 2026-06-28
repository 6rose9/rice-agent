# စပါးအောင်သွယ် — Database Schema

## Overview

Thirteen tables on Supabase PostgreSQL plus two storage buckets and one view. Three reference tables (`market_status`, `regions`, `townships`) seeded by migration and read-only at runtime. Ten application tables (`profiles`, `posts`, `post_images`, `saved_posts`, `post_reports`, `post_reactions`, `follows`, `connections`, `connection_requests`, `comments`) with full Row-Level Security. One privacy-enforcing view (`public_profiles`) that masks phone/email based on visibility settings.

`profiles` extends `auth.users` (Supabase-managed identity) via a 1:1 FK relationship. All policies reference `auth.uid()` for row-level access control.

---

## Entity Relationship Diagram

```
┌──────────┐       ┌──────────┐       ┌──────────┐
│  regions  │──1:many─│ townships │──1:many─│ profiles  │
│  (15 rows)│       │ (~200 rows)│       │ (0...*)  │
└──────────┘       └──────────┘       └──────────┘
                                             │
                         ┌───────────────────┼───────────────────┬───────────────────┬───────────────────┐
                   1:many│             1:many│                   │                   │                   │
                    ┌──────────┐       ┌─────────────┐    ┌────────────┐    ┌──────────────┐    ┌─────────────────┐
                    │  posts   │       │market_status │    │saved_posts │    │ post_reports  │    │ post_reactions   │
                    │ (0...*)  │       │  (4 rows)    │    │ (0...*)    │    │   (0...*)     │    │    (0...*)       │
                    └──────────┘       └─────────────┘    └────────────┘    └──────────────┘    └─────────────────┘
                         │
                   1:many│
                    ┌──────────┐
                    │post_images│
                    │ (0...*)  │
                    └──────────┘

auth.users (Supabase) ──1:1── profiles (id REFERENCES auth.users.id)
profiles.market_status_id ──many:1── market_status(id)
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
| Soft deletion | `deleted_at` (profiles), `is_active` (posts) |

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

-- All users (including guests) can read
create policy "Regions viewable by everyone"
    on regions for select
    using (true);
```

---

## Table 2: `townships`

**Purpose:** Reference table of ~200 Myanmar townships prioritized by population, each belonging to a region.
**Access:** Read-only at runtime. Seeded by migration.

### DDL

```sql
create table townships (
    id          smallint generated always as identity primary key,
    name        jsonb     not null,                     -- {"en": "Hlaingthaya", "my": "လှိုင်သာယာ"}
    region_id   smallint  not null references regions(id),
    sort_order  smallint  not null default 0,
    unique(name, region_id)
);
```

### Indexes

| Index | Columns | Type | Rationale |
|---|---|---|---|
| `idx_townships_region_id` | `region_id` | BTREE | Cascading dropdown: "given a region, list its townships" |

### RLS

```sql
alter table townships enable row level security;

-- All users (including guests) can read
create policy "Townships viewable by everyone"
    on townships for select
    using (true);
```

---

## Table 3: `market_status`

**Purpose:** Reference table for the 4 market/availability statuses a user can set on their profile.
**Access:** Read-only at runtime. Seeded by migration.
**Key design:** Bilingual `name` field with `en` and `my` keys. Users reference statuses by `id` via `profiles.market_status_id` FK (nullable — new users have no status).

### DDL

```sql
create table market_status (
    id          smallint generated always as identity primary key,
    name        jsonb     not null,   -- {"en": "Buying Rice", "my": "စပါးဝယ်မည်"}
    sort_order  smallint  not null default 0,
    color       text                  -- Hex color code for UI display
);
```

### Seed Data (4 rows)

| id | name | sort_order | color |
|---|---|---|---|
| 1 | `{"en":"Buying Rice", "my":"စပါးဝယ်မည်"}` | 1 | `#3B82F6` |
| 2 | `{"en":"Selling Rice", "my":"စပါးရောင်းမည်"}` | 2 | `#10B981` |
| 3 | `{"en":"Available as Agent", "my":"အကျိုးဆောင်ရနိုင်သည်"}` | 3 | `#F59E0B` |
| 4 | `{"en":"Open for Partnership", "my":"လုပ်ငန်းဖက်စပ်ရှာနေသည်"}` | 4 | `#8B5CF6` |

### RLS

```sql
alter table market_status enable row level security;

-- All users (including guests) can read
create policy "Market status viewable by everyone"
    on market_status for select
    using (true);
```

---

## Table 4: `profiles`

**Purpose:** Public identity per registered user. Extends `auth.users` 1:1.
**Access:** Active profiles visible to everyone; users can view/update their own (even if soft-deleted).
**Key design decisions:**
- `region_id` and `township_id` are NOT NULL — location is required at profile creation.
- `market_status_id` is nullable — NULL by default at signup. Users set their status later from the `market_status` reference table.
- `phone_verified` defaults to false; set true after verification.
- `deleted_at` for soft deletion; non-null means the account is deactivated.
- `phone_visibility` and `email_visibility` control who can see contact info: `'public'` (everyone), `'followers'` (followers only), `'private'` (owner only). Defaults to `'private'`.
- `connections_visibility` controls who can see the user's connection list: `'public'` (everyone), `'connections'` (connected users only), `'private'` (owner only). Defaults to `'public'`.
- `subscription_tier` controls post permissions: `'free'` (general posts only), `'pro'`/`'pro_plus'` (can create buying/selling posts). Defaults to `'free'`.
- A `public_profiles` view masks phone/email based on visibility settings and the requesting user's relationship (follower vs stranger).

### DDL

```sql
create table profiles (
    id               uuid        primary key references auth.users(id) on delete cascade,
    phone            text        not null unique,
    email            text,
    username         text        not null unique,
    full_name        text        not null,
    role             text        not null default 'general_user'
                       check (role in ('farmer', 'trader', 'agent', 'general_user')),
    avatar_url       text,
    cover_url        text,
    bio              text,
    region_id        smallint    not null references regions(id),
    township_id      smallint    not null references townships(id),
    market_status_id smallint    references market_status(id),
    phone_verified   boolean     not null default false,
    phone_visibility text        not null default 'private'
                   check (phone_visibility in ('public', 'followers', 'private')),
    email_visibility text        not null default 'private'
                   check (email_visibility in ('public', 'followers', 'private')),
    connections_visibility text   not null default 'public'
                   check (connections_visibility in ('public', 'connections', 'private')),
    subscription_tier text        not null default 'free'
                       check (subscription_tier in ('free', 'pro', 'pro_plus')),
    deleted_at       timestamptz,
    created_at       timestamptz not null default now(),
    updated_at       timestamptz not null default now()
);
```

### Constraints

| Constraint | Type | Column | Detail |
|---|---|---|---|
| `profiles_pkey` | PK | `id` | FK → `auth.users(id)` ON DELETE CASCADE |
| `profiles_phone_key` | UNIQUE | `phone` | Myanmar phone format |
| `profiles_username_key` | UNIQUE | `username` | URL-safe, 3–30 chars |
| `profiles_role_check` | CHECK | `role` | `role in ('farmer', 'trader', 'agent', 'general_user')` |
| `profiles_phone_visibility_check` | CHECK | `phone_visibility` | `phone_visibility in ('public', 'followers', 'private')` |
| `profiles_email_visibility_check` | CHECK | `email_visibility` | `email_visibility in ('public', 'followers', 'private')` |
| `profiles_connections_visibility_check` | CHECK | `connections_visibility` | `connections_visibility in ('public', 'connections', 'private')` |
| `profiles_region_id_fkey` | FK | `region_id` | → `regions(id)`. No cascade — reference data |
| `profiles_township_id_fkey` | FK | `township_id` | → `townships(id)`. No cascade — reference data |
| `profiles_market_status_id_fkey` | FK | `market_status_id` | → `market_status(id)`. Nullable — user sets later |
| `profiles_subscription_tier_check` | CHECK | `subscription_tier` | `subscription_tier in ('free', 'pro', 'pro_plus')` |

### Indexes

| Index | Columns | Type | Rationale |
|---|---|---|---|
| `idx_profiles_role_region` | `(role, region_id)` | BTREE | Most common search filter combo: "find all farmers in this region" |
| `idx_profiles_township_id` | `township_id` | BTREE | Join performance when resolving profile township |
| `idx_profiles_region_id` | `region_id` | BTREE | Join performance when resolving profile region |

**No username index** — username uniqueness is enforced by the UNIQUE constraint which implicitly creates an index.

### Triggers

```sql
-- Auto-update updated_at on changes
create trigger update_profiles_updated_at
    before update on profiles
    for each row
    execute function update_updated_at_column();

-- Auto-create profile on auth.users insert (SECURITY DEFINER)
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute function handle_new_user();
```

### Functions

#### `handle_new_user()` — Auto-create profile on signup

```sql
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, phone, email, username, full_name, role, region_id, township_id)
  values (
    NEW.id,
    NEW.raw_user_meta_data ->> 'phone',
    NEW.raw_user_meta_data ->> 'email',
    NEW.raw_user_meta_data ->> 'username',
    NEW.raw_user_meta_data ->> 'full_name',
    coalesce(NEW.raw_user_meta_data ->> 'role', 'general_user'),
    (NEW.raw_user_meta_data ->> 'region_id')::smallint,
    (NEW.raw_user_meta_data ->> 'township_id')::smallint
  );
  return NEW;
end;
$$ language plpgsql security definer;
```

#### `lookup_email_by_phone()` — Resolve phone to auth email for login

```sql
create or replace function lookup_email_by_phone(phone_number text)
returns text as $$
declare
  found_email text;
begin
  select u.email into found_email
  from auth.users u
  join profiles p on p.id = u.id
  where p.phone = phone_number;
  return found_email;
end;
$$ language plpgsql security definer;
```

#### `soft_delete_account()` — Soft-delete own profile

```sql
create or replace function soft_delete_account()
returns void as $$
begin
  update profiles
  set deleted_at = now(),
      updated_at = now()
  where id = auth.uid()
    and deleted_at is null;
end;
$$ language plpgsql security definer;
```

### RLS

```sql
alter table profiles enable row level security;

-- Active (non-deleted) profiles are viewable by everyone
create policy "Active profiles viewable by everyone"
    on profiles for select
    using (deleted_at IS NULL);

-- Users can always view their own profile (even if soft-deleted)
create policy "Users can view own profile"
    on profiles for select
    using (auth.uid() = id);

-- Users can only update their own profile
create policy "Users can update own profile"
    on profiles for update
    using (auth.uid() = id);
```

**RLS note:** The two SELECT policies combine with OR semantics — an authenticated user sees a profile if `deleted_at IS NULL` OR `id = auth.uid()`. This means owners always see their own profile, even if soft-deleted.

---

## Table 5: `posts`

**Purpose:** Marketplace listings and general posts — the core content table.
**Key design decisions:**
- `author_id` (not `user_id`) references `profiles(id)`
- `type` includes `'general'` in addition to `'buying'` and `'selling'`
- `content` replaces separate `title` + `description`
- Trading fields (`rice_type`, `rice_name`, `price`, `quantity`, `unit`, `address`, `region`, `township`, `easy_to_carry`, `pound_per_bag`, `paddy_condition`) are nullable — only filled for buying/selling posts
- `badge` for post promotion level (free/pro/pro_plus)
- `reaction_count` and `comment_count` for denormalized counts
- `latitude`/`longitude` for map coordinates
- `is_active` for soft-delete

### DDL

```sql
create table posts (
    id              uuid          primary key default gen_random_uuid(),
    author_id       uuid          not null references profiles(id) on delete cascade,
    type            text          not null check (type in ('general', 'buying', 'selling')),
    content         text          not null check (char_length(content) between 1 and 2000),

    -- Trading fields (nullable — only filled for buying/selling posts)
    -- Constraint: trading posts MUST have a rice_type
    constraint posts_rice_type_check check (type = 'general' or rice_type is not null),
    rice_type       text,           -- dropdown: "Soft rice", "Hard rice", "Glutinous rice", "Jasmine rice"
    rice_name       text,           -- free text: e.g. "Special Grade A"
    price           numeric,        -- slider: 500,000–7,500,000 Ks
    quantity        numeric,        -- slider: 100–100,000 baskets
    unit            text,           -- dropdown: "pound" | "tin"
    address         text,           -- free text: e.g. "No. 123, Hlaingthaya, Yangon"
    region          text,           -- region key: "yangon", "mandalay", etc.
    township        text,           -- township name: "Hlaingthaya", "Pathein", etc.
    easy_to_carry   boolean,        -- switch: transport available
    pound_per_bag   numeric,        -- slider: 92–120 lb
    paddy_condition text,           -- slider: 10–16 (moisture %)

    -- Post metadata
    badge           text          default 'free' check (badge in ('free', 'pro', 'pro_plus')),
    reaction_count  integer       not null default 0,
    comment_count   integer       not null default 0,

    -- Soft-delete flag
    is_active       boolean       not null default true,

    -- Map coordinates (from LocationPicker component)
    latitude        double precision,
    longitude       double precision,

    -- Timestamps
    created_at      timestamptz   not null default now(),
    updated_at      timestamptz   not null default now()
);
```

### Constraints

| Constraint | Type | Column | Detail |
|---|---|---|---|
| `posts_pkey` | PK | `id` | UUID v4 |
| `posts_author_id_fkey` | FK | `author_id` | → `profiles(id)` ON DELETE CASCADE |
| `posts_type_check` | CHECK | `type` | `type in ('general', 'buying', 'selling')` |
| `posts_content_check` | CHECK | `content` | `char_length(content) between 1 and 2000` |
| `posts_rice_type_check` | CHECK | — | `type = 'general' or rice_type is not null` (trading posts require rice_type) |
| `posts_badge_check` | CHECK | `badge` | `badge in ('free', 'pro', 'pro_plus')` |

### Indexes

| Index | Columns | Type | Rationale |
|---|---|---|---|
| `idx_posts_created_at` | `created_at DESC` | BTREE | Global feed: `order by created_at desc` |
| `idx_posts_author_created` | `(author_id, created_at DESC)` | BTREE | Profile posts tab: user's own posts |
| `idx_posts_type_created` | `(type, created_at DESC)` | BTREE | Filtered feed by post type |

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

-- All posts (including inactive) are viewable by everyone
create policy "Posts are viewable by everyone"
    on posts for select
    using (true);

-- Authors can insert their own posts
create policy "Users can create posts"
    on posts for insert
    to authenticated
    with check (author_id = auth.uid());

-- Authors can update their own posts
create policy "Users can update their own posts"
    on posts for update
    to authenticated
    using (author_id = auth.uid())
    with check (author_id = auth.uid());

-- Authors can delete their own posts
create policy "Users can delete their own posts"
    on posts for delete
    to authenticated
    using (author_id = auth.uid());
```

---

## Table 6: `post_images`

**Purpose:** Multi-image support per post. Max 5 images per post (enforced at application layer).
**Key design:** Column is `url` (not `image_url`).

### DDL

```sql
create table post_images (
    id          uuid        primary key default gen_random_uuid(),
    post_id     uuid        not null references posts(id) on delete cascade,
    url         text        not null check (char_length(url) > 0),
    sort_order  smallint    not null default 0,
    created_at  timestamptz not null default now()
);
```

### Indexes

| Index | Columns | Type | Rationale |
|---|---|---|---|
| `idx_post_images_post_id` | `(post_id, sort_order)` | BTREE | Fetch all images for a post, ordered |

### RLS

```sql
alter table post_images enable row level security;

-- All post images are viewable by everyone
create policy "Post images are viewable by everyone"
    on post_images for select
    using (true);

-- Post author can insert images
create policy "Post author can add images"
    on post_images for insert
    to authenticated
    with check (
        exists (
            select 1 from posts
            where posts.id = post_images.post_id
            and posts.author_id = auth.uid()
        )
    );

-- Post author can delete images
create policy "Post author can delete images"
    on post_images for delete
    to authenticated
    using (
        exists (
            select 1 from posts
            where posts.id = post_images.post_id
            and posts.author_id = auth.uid()
        )
    );
```

No UPDATE policy — images are immutable after insert.

---

## Table 7: `saved_posts`

**Purpose:** Bookmarks — user saves a post for later reference.
**Key design:** Composite PK `(user_id, post_id)`. No separate `id` column.

### DDL

```sql
create table saved_posts (
    user_id     uuid        not null references profiles(id) on delete cascade,
    post_id     uuid        not null references posts(id)    on delete cascade,
    created_at  timestamptz not null default now(),
    primary key (user_id, post_id)
);
```

### Indexes

| Index | Columns | Type | Rationale |
|---|---|---|---|
| `idx_saved_posts_user_created` | `(user_id, created_at DESC)` | BTREE | User's saved posts feed |
| `idx_saved_posts_post_id` | `post_id` | BTREE | "How many users saved this post?" |

### RLS

```sql
alter table saved_posts enable row level security;

-- Users can see their own saved posts
create policy "Users can view their own saved posts"
    on saved_posts for select
    to authenticated
    using (user_id = auth.uid());

-- Users can save (insert) posts for themselves
create policy "Users can save posts"
    on saved_posts for insert
    to authenticated
    with check (user_id = auth.uid());

-- Users can unsave (delete) their own saved posts
create policy "Users can unsave posts"
    on saved_posts for delete
    to authenticated
    using (user_id = auth.uid());
```

---

## Table 8: `post_reports`

**Purpose:** Community moderation — users report posts that are not related to the rice industry.
**Key design:** One report per user per post (enforced by UNIQUE constraint). When a post reaches 5 reports, it is automatically hidden (`is_active = false`).

### DDL

```sql
create table post_reports (
    id          uuid        primary key default gen_random_uuid(),
    post_id     uuid        not null references posts(id) on delete cascade,
    reporter_id uuid        not null references profiles(id) on delete cascade,
    reason      text,           -- optional: user explains why
    created_at  timestamptz not null default now(),
    unique (post_id, reporter_id)
);
```

### Constraints

| Constraint | Type | Column | Detail |
|---|---|---|---|
| `post_reports_pkey` | PK | `id` | UUID v4 |
| `post_reports_post_id_fkey` | FK | `post_id` | → `posts(id)` ON DELETE CASCADE |
| `post_reports_reporter_id_fkey` | FK | `reporter_id` | → `profiles(id)` ON DELETE CASCADE |
| `post_reports_post_id_reporter_id_key` | UNIQUE | `(post_id, reporter_id)` | One report per user per post |

### Indexes

| Index | Columns | Type | Rationale |
|---|---|---|---|
| `idx_post_reports_post_id` | `post_id` | BTREE | Count reports per post |

### RLS

```sql
alter table post_reports enable row level security;

-- Users can see reports they created
create policy "post_reports_select_own"
    on post_reports for select
    to authenticated
    using ((select auth.uid()) = reporter_id);

-- Authenticated users can report posts
create policy "post_reports_insert_own"
    on post_reports for insert
    to authenticated
    with check ((select auth.uid()) = reporter_id);

-- Users can delete their own reports (undo)
create policy "post_reports_delete_own"
    on post_reports for delete
    to authenticated
    using ((select auth.uid()) = reporter_id);
```

---

## Table 9: `post_reactions`

**Purpose:** Likes on posts — one like per user per post.
**Key design:** Trigger auto-updates `posts.reaction_count` on insert/delete.

### DDL

```sql
create table post_reactions (
    id          uuid        primary key default gen_random_uuid(),
    post_id     uuid        not null references posts(id) on delete cascade,
    user_id     uuid        not null references profiles(id) on delete cascade,
    created_at  timestamptz not null default now(),
    unique (post_id, user_id)
);
```

### Constraints

| Constraint | Type | Column | Detail |
|---|---|---|---|
| `post_reactions_pkey` | PK | `id` | UUID v4 |
| `post_reactions_post_id_fkey` | FK | `post_id` | → `posts(id)` ON DELETE CASCADE |
| `post_reactions_user_id_fkey` | FK | `user_id` | → `profiles(id)` ON DELETE CASCADE |
| `post_reactions_post_id_user_id_key` | UNIQUE | `(post_id, user_id)` | One like per user per post |

### Indexes

| Index | Columns | Type | Rationale |
|---|---|---|---|
| `idx_post_reactions_post_id` | `post_id` | BTREE | Count reactions per post |

### Trigger

```sql
-- Auto-update reaction_count on posts
create or replace function public.update_post_reaction_count()
returns trigger as $$
begin
  if (TG_OP = 'INSERT') then
    update public.posts set reaction_count = reaction_count + 1 where id = NEW.post_id;
    return NEW;
  elsif (TG_OP = 'DELETE') then
    update public.posts set reaction_count = reaction_count - 1 where id = OLD.post_id;
    return OLD;
  end if;
end;
$$ language plpgsql security definer;

create trigger on_reaction_change
  after insert or delete on public.post_reactions
  for each row
  execute function public.update_post_reaction_count();
```

### RLS

```sql
alter table post_reactions enable row level security;

-- Anyone authenticated can read reactions
create policy "post_reactions_select_all"
    on post_reactions for select
    to authenticated
    using (true);

-- Users can insert their own reactions
create policy "post_reactions_insert_own"
    on post_reactions for insert
    to authenticated
    with check ((select auth.uid()) = user_id);

-- Users can delete their own reactions
create policy "post_reactions_delete_own"
    on post_reactions for delete
    to authenticated
    using ((select auth.uid()) = user_id);
```

---

## Storage Buckets (Supabase)

### `profiles` bucket

Stores avatar and cover images for user profiles. Public read access.

```
profiles/
├── avatars/
│   └── {user_id}/
│       └── avatar.jpg
└── covers/
    └── {user_id}/
        └── cover.jpg
```

**Policies:**
- Authenticated users can upload to their own `avatars/` and `covers/` folders
- Everyone can view (public bucket)
- Users can update/delete their own images

### `post-images` bucket

Stores images attached to posts. Public read access.

```
post-images/
└── {user_id}/
    └── {image_id}.jpg
```

**Policies:**
- Authenticated users can upload to their own folder
- Everyone can view (public bucket)
- Users can delete their own images

---

## Index Summary

| Table | Index | Columns | Purpose |
|---|---|---|---|
| `townships` | `idx_townships_region_id` | `region_id` | Cascading region → township dropdown |
| `profiles` | `idx_profiles_role_region` | `(role, region_id)` | Search: filter by role + region |
| `profiles` | `idx_profiles_township_id` | `township_id` | Join: resolve profile township |
| `profiles` | `idx_profiles_region_id` | `region_id` | Join: resolve profile region |
| `posts` | `idx_posts_created_at` | `created_at DESC` | Global feed |
| `posts` | `idx_posts_author_created` | `(author_id, created_at DESC)` | User's own posts on profile |
| `posts` | `idx_posts_type_created` | `(type, created_at DESC)` | Filtered feed by type |
| `post_images` | `idx_post_images_post_id` | `(post_id, sort_order)` | Load images for a post |
| `saved_posts` | `idx_saved_posts_user_created` | `(user_id, created_at DESC)` | User's saved posts feed |
| `saved_posts` | `idx_saved_posts_post_id` | `post_id` | Count saves per post |
| `post_reports` | `idx_post_reports_post_id` | `post_id` | Count reports per post |
| `post_reactions` | `idx_post_reactions_post_id` | `post_id` | Count reactions per post |

**Total: 12 indexes on 9 tables.**

---

## Enumeration Values

### `profiles.role`
```
farmer
trader
agent
general_user
```

### `posts.type`
```
general
buying
selling
```

### `posts.badge`
```
free
pro
pro_plus
```

### `posts.unit`
```
pound
tin
```

### `market_status` (reference table)

| id | en | my | color |
|---|---|---|---|
| 1 | Buying Rice | စပါးဝယ်မည် | `#3B82F6` |
| 2 | Selling Rice | စပါးရောင်းမည် | `#10B981` |
| 3 | Available as Agent | အကျိုးဆောင်ရနိုင်သည် | `#F59E0B` |
| 4 | Open for Partnership | လုပ်ငန်းဖက်စပ်ရှာနေသည် | `#8B5CF6` |

---

### `follows`

Social graph junction table. Each row means "follower_id follows following_id".

| Column | Type | Notes |
|---|---|---|
| `follower_id` | `UUID` | PK, FK → `profiles.id` ON DELETE CASCADE |
| `following_id` | `UUID` | PK, FK → `profiles.id` ON DELETE CASCADE |
| `created_at` | `TIMESTAMPTZ` | DEFAULT `now()` |

**Constraints:**
- Composite primary key `(follower_id, following_id)`
- `CHECK (follower_id <> following_id)` — no self-follow
- Unique by design (composite PK)

**Indexes:**
- `idx_follows_following` on `following_id` — fast "who follows this user" queries
- `idx_follows_follower` on `follower_id` — fast "who does this user follow" queries

**RLS Policies:**
| Policy | Operation | Rule |
|---|---|---|
| `follows_select_all` | SELECT | Public — anyone can see follow relationships |
| `follows_insert_own` | INSERT | Authenticated user can only insert as `follower_id = auth.uid()` |
| `follows_delete_own` | DELETE | Authenticated user can only delete their own follows |

---

### `connection_requests`

Connection request lifecycle. Sender sends, receiver accepts/declines. When accepted, a row is created in `connections`.

| Column | Type | Notes |
|---|---|---|
| `id` | `UUID` | PK, default `gen_random_uuid()` |
| `sender_id` | `UUID` | FK → `profiles.id` ON DELETE CASCADE |
| `receiver_id` | `UUID` | FK → `profiles.id` ON DELETE CASCADE |
| `status` | `TEXT` | DEFAULT `'pending'`, CHECK IN ('pending', 'accepted', 'declined') |
| `created_at` | `TIMESTAMPTZ` | DEFAULT `now()` |
| `updated_at` | `TIMESTAMPTZ` | DEFAULT `now()` |

**Constraints:**
- `CHECK (sender_id <> receiver_id)` — no self-requests
- `UNIQUE (sender_id, receiver_id)` — one request per pair

**Indexes:**
- `idx_connection_requests_receiver` on `(receiver_id, status)` — fast "my pending requests" queries
- `idx_connection_requests_sender` on `(sender_id, status)` — fast "my sent requests" queries

**RLS Policies:**
| Policy | Operation | Rule |
|---|---|---|
| `connection_requests_select_own` | SELECT | Authenticated user sees requests they sent or received |
| `connection_requests_insert_own` | INSERT | Authenticated user can only send as `sender_id = auth.uid()` |
| `connection_requests_update_own` | UPDATE | Sender or receiver can update (accept/decline/cancel) |
| `connection_requests_delete_own` | DELETE | Sender or receiver can delete |

---

### `connections`

Mutual/accepted connections. Created when a connection request is accepted. Uses canonical ordering (`user1_id < user2_id`) to prevent duplicates.

| Column | Type | Notes |
|---|---|---|
| `user1_id` | `UUID` | PK, FK → `profiles.id` ON DELETE CASCADE |
| `user2_id` | `UUID` | PK, FK → `profiles.id` ON DELETE CASCADE |
| `created_at` | `TIMESTAMPTZ` | DEFAULT `now()` |

**Constraints:**
- Composite primary key `(user1_id, user2_id)`
- `CHECK (user1_id < user2_id)` — canonical ordering

**Indexes:**
- `idx_connections_user1` on `user1_id`
- `idx_connections_user2` on `user2_id`

**RLS Policies:**
| Policy | Operation | Rule |
|---|---|---|
| `connections_select_all` | SELECT | Public — anyone can see connections |
| `connections_insert_auth` | INSERT | Authenticated users can insert only where they are one of the two parties |
| `connections_delete_own` | DELETE | Either user in the connection can delete |

---

## Table: `comments`

**Purpose:** User comments on posts. Supports threaded discussions on any post type.
**Key design:** `comment_count` on `posts` is maintained automatically via trigger.

### DDL

```sql
create table comments (
    id          uuid        primary key default gen_random_uuid(),
    post_id     uuid        not null references posts(id) on delete cascade,
    author_id   uuid        not null references profiles(id) on delete cascade,
    content     text        not null check (char_length(content) between 1 and 1000),
    created_at  timestamptz not null default now(),
    updated_at  timestamptz not null default now()
);
```

### Indexes

| Index | Columns | Type | Rationale |
|---|---|---|---|
| `idx_comments_post_id` | `(post_id, created_at)` | BTREE | Fetch comments for a post in chronological order |
| `idx_comments_author_id` | `author_id` | BTREE | Fetch comments by a specific user |

### Triggers

```sql
-- Auto-update updated_at on edit
create trigger update_comments_updated_at
    before update on comments
    for each row
    execute function update_updated_at_column();

-- Increment/decrement comment_count on posts
create or replace function update_post_comment_count()
returns trigger as $$
begin
    if (tg_op = 'INSERT') then
        update posts set comment_count = comment_count + 1 where id = new.post_id;
        return new;
    elsif (tg_op = 'DELETE') then
        update posts set comment_count = comment_count - 1 where id = old.post_id;
        return old;
    end if;
end;
$$ language plpgsql security definer;

create trigger on_comment_change
    after insert or delete on comments
    for each row
    execute function update_post_comment_count();
```

### RLS

| Policy | Operation | Rule |
|---|---|---|
| `Comments are readable by authenticated users` | SELECT | Authenticated users can read all comments |
| `Users can create their own comments` | INSERT | `auth.uid() = author_id` |
| `Users can update their own comments` | UPDATE | `auth.uid() = author_id` |
| `Users can delete their own comments` | DELETE | `auth.uid() = author_id` |

---

## Schema Migration Structure

```
supabase/
└── migrations/
    ├── 20260618000000_auth_schema.sql          — Extension, reference tables (market_status, regions, townships), profiles, handle_new_user trigger, lookup_email_by_phone, soft_delete_account
    ├── 20260618000001_create_profiles_storage.sql — Storage bucket "profiles" with RLS policies
    ├── 20260618000002_create_posts.sql          — update_updated_at_column function, posts, post_images
    ├── 20260618000003_create_post_images_storage.sql — Storage bucket "post-images" with RLS policies
    ├── 20260619000000_create_saved_posts.sql    — saved_posts table
    ├── 20260619000001_user_soft_delete.sql      — idempotent soft-delete migration (deleted_at column, soft_delete_account function, updated RLS)
    ├── 20260625000000_create_follows.sql        — follows table (social graph junction)
    ├── 20260625000001_create_connection_requests.sql — connection_requests table (request lifecycle)
    ├── 20260625000002_create_connections.sql    — connections table (accepted mutual connections)
    ├── 20260626000000_create_post_reports.sql   — post_reports table (community moderation)
    ├── 20260626000001_create_post_reactions.sql — post_reactions table (likes) + reaction_count trigger
    └── 20260626000000_create_comments.sql       — comments table + comment_count trigger
```

---

## V2 Schema Extensions (Noted for Forward Compatibility)

| Enhancement | Detail |
|---|---|
| `conversations` table | Direct messaging between users |
| `messages` table | Individual messages within a conversation |
| `reviews` table | Ratings and reviews between users |
| `verifications` table | User verification requests and badges |
| `notifications` table | In-app notification system |
| `pg_trgm` extension | GIN indexes on `profiles.full_name` and `posts.content` for fast `ILIKE` search |

None of these are created in the V1 migration.
