-- ============================================================================
-- Fix: Allow unauthenticated users (guests) to view posts and post images
-- Run this if the original policies with "TO authenticated" were already applied.
-- ============================================================================

-- Drop the old authenticated-only SELECT policies
DROP POLICY IF EXISTS "Posts are viewable by authenticated users" ON public.posts;
DROP POLICY IF EXISTS "Post images are viewable by authenticated users" ON public.post_images;

-- Re-create with no TO clause — applies to all roles including anon
CREATE POLICY "Posts are viewable by everyone"
  ON public.posts FOR SELECT
  USING (true);

CREATE POLICY "Post images are viewable by everyone"
  ON public.post_images FOR SELECT
  USING (true);

-- Add rice_type CHECK constraint if it doesn't exist (defense-in-depth for trading posts)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'posts_rice_type_check' AND conrelid = 'public.posts'::regclass
  ) THEN
    ALTER TABLE public.posts
    ADD CONSTRAINT posts_rice_type_check CHECK (type = 'general' OR rice_type IS NOT NULL);
  END IF;
END $$;
