-- ============================================================================
-- စပါးအောင်သွယ် — Posts & Post Images Tables
-- ============================================================================

-- 0. updated_at trigger function (shared across tables)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach to profiles table (already exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_profiles_updated_at'
  ) THEN
    CREATE TRIGGER update_profiles_updated_at
      BEFORE UPDATE ON public.profiles
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- 1. Posts table
-- ============================================================================
CREATE TABLE public.posts (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id       UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type            TEXT        NOT NULL CHECK (type IN ('general', 'buying', 'selling')),
  content         TEXT        NOT NULL CHECK (char_length(content) BETWEEN 1 AND 2000),
  -- Fix #11: trading posts must have a rice_type; general posts leave it null
  CONSTRAINT posts_rice_type_check CHECK (type = 'general' OR rice_type IS NOT NULL),
  -- Trading fields (nullable — only filled for buying/selling)
  rice_type       TEXT,
  rice_name       TEXT,
  price           NUMERIC    CHECK (price IS NULL OR price >= 0),
  quantity        NUMERIC    CHECK (quantity IS NULL OR quantity > 0),
  unit            TEXT,
  address         TEXT,
  location        TEXT,
  township        TEXT,
  easy_to_carry   BOOLEAN,
  pound_per_bag   NUMERIC,
  paddy_condition TEXT,
  badge           TEXT        DEFAULT 'free' CHECK (badge IN ('free', 'pro', 'pro_plus')),
  -- Counters (updated by triggers or app logic later)
  reaction_count  INTEGER     NOT NULL DEFAULT 0,
  comment_count   INTEGER     NOT NULL DEFAULT 0,
  -- Timestamps
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_posts_created_at ON public.posts(created_at DESC);
CREATE INDEX idx_posts_author_created ON public.posts(author_id, created_at DESC);
CREATE INDEX idx_posts_type_created ON public.posts(type, created_at DESC);

-- Trigger: auto-update updated_at
CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- RLS
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Anyone (including guests) can view all posts
CREATE POLICY "Posts are viewable by everyone"
  ON public.posts FOR SELECT
  USING (true);

-- Authors can insert their own posts
CREATE POLICY "Users can create posts"
  ON public.posts FOR INSERT
  TO authenticated
  WITH CHECK (author_id = auth.uid());

-- Authors can update their own posts
CREATE POLICY "Users can update their own posts"
  ON public.posts FOR UPDATE
  TO authenticated
  USING (author_id = auth.uid())
  WITH CHECK (author_id = auth.uid());

-- Authors can delete their own posts
CREATE POLICY "Users can delete their own posts"
  ON public.posts FOR DELETE
  TO authenticated
  USING (author_id = auth.uid());

-- 2. Post Images table
-- ============================================================================
CREATE TABLE public.post_images (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id     UUID        NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  url         TEXT        NOT NULL CHECK (char_length(url) > 0),
  sort_order  SMALLINT    NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index
CREATE INDEX idx_post_images_post_id ON public.post_images(post_id, sort_order);

-- RLS
ALTER TABLE public.post_images ENABLE ROW LEVEL SECURITY;

-- Images on posts are visible to everyone (including guests)
CREATE POLICY "Post images are viewable by everyone"
  ON public.post_images FOR SELECT
  USING (true);

-- Post author can insert images
CREATE POLICY "Post author can add images"
  ON public.post_images FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.posts
      WHERE posts.id = post_images.post_id
        AND posts.author_id = auth.uid()
    )
  );

-- Post author can delete images
CREATE POLICY "Post author can delete images"
  ON public.post_images FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.posts
      WHERE posts.id = post_images.post_id
        AND posts.author_id = auth.uid()
    )
  );
