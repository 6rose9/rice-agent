# Plan: Create Post with Supabase

## Goal

Wire the existing `CreatePostForm` UI to Supabase so users can create real, persistent posts with image upload support.

## What Exists

- `CreatePostForm` — full UI, Zod validation, all field states. `handleSubmit` is a `setTimeout` mock.
- `src/lib/validations/post.ts` — `postSchema` (discriminated union: general | buying | selling)
- `src/types/index.ts` — `Post`, `PostImage` types
- `src/lib/auth/actions.ts` — server action pattern to follow
- `/posts/create` page — mounts the form with auth gating
- Feed page — currently uses `mockPosts`

## What's Missing

- No `posts` or `post_images` tables in the DB
- No `post-images` storage bucket
- No server action to create posts
- No file upload logic in the form
- No real data fetching in feed

## Implementation Steps

### Step 1: Create `posts` + `post_images` DB Migration
**File: `supabase/migrations/20260618000001_create_posts.sql`**

Create tables matching the existing TypeScript types:
- `posts`: id, author_id (FK→profiles), type (general/buying/selling), content, rice_type, rice_name, price, quantity, unit, address, location, township, easy_to_carry, pound_per_bag, paddy_condition, badge, reaction_count, comment_count, created_at, updated_at
- `post_images`: id, post_id (FK→posts CASCADE), url, sort_order
- RLS policies (everyone can view active posts, authors can manage their own)
- Indexes for feed queries

### Step 2: Create `post-images` Storage Migration
**File: `supabase/migrations/20260618000002_create_post_images_storage.sql`**

- Public bucket `post-images`
- Auth users upload to `post-images/<user_id>/<filename>`
- Public read access
- Owner-only delete policy

### Step 3: Create Server Actions
**File: `src/lib/posts/actions.ts`**

- `createPost(formData)` — server action following `auth/actions.ts` pattern
  - Parse `PostInput` from FormData, validate with existing `postSchema`
  - Get auth user, insert into `posts` table
  - Parse comma-separated image URLs, insert into `post_images`
  - Return `{ success, error, redirect }`
- `getPosts(filter?, pageSize?)` — fetch posts with author profile + images for feed

### Step 4: Refactor CreatePostForm to react-hook-form + zod
**Modify: `src/components/post/create-post-form.tsx`**

**Pattern to follow:** `src/app/(main)/profile/edit/page.tsx`

**Replace all manual `useState`-based form state with `useForm<PostInput>`:**
- `useForm<PostInput>({ resolver: zodResolver(postSchema), defaultValues: { type: "general", content: "" } })`
- `watch("type")` replaces `postType` state — conditional trading fields render based on this
- `register("content")` for textarea
- `setValue` + `onValueChange` for Select inputs (rice_type, unit, location, township, paddy_condition)
- `setValue` for range inputs (price, quantity, pound_per_bag)
- `setValue` for Switch (easy_to_carry)
- `formState: { errors, isSubmitting }` replaces manual `errors` state + `submitting` state
- Remove manual `validate()` — zod schema validates via resolver
- `handleSubmit(onSubmit)` wraps the form

**Image upload (remains as local state, not in zod schema):**
- Keep `images: string[]` as local state (passed separately to server action)
- Add hidden `<input type="file" multiple accept="image/*">`
- On file select: upload to Supabase Storage via browser client, get public URLs
- Store URLs in `images` state for preview

**onSubmit:**
- Build `FormData` from the validated `PostInput` data + `images` array
- Call `createPost(formData)` server action
- Handle `serverError`, navigate on success

### Step 5: Update Feed to Fetch Real Data
**Modify: `src/app/(main)/feed/page.tsx`**

- Replace `mockPosts` with `getPosts()` server action via `useEffect`
- Add loading/error state handling (already have skeleton/error/empty cards)

## Files Changed

| File | Action |
|------|--------|
| `supabase/migrations/20260618000001_create_posts.sql` | CREATE |
| `supabase/migrations/20260618000002_create_post_images_storage.sql` | CREATE |
| `src/lib/posts/actions.ts` | CREATE |
| `src/components/post/create-post-form.tsx` | MODIFY |
| `src/app/(main)/feed/page.tsx` | MODIFY |
