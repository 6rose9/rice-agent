-- ============================================================================
-- စပါးအောင်သွယ် — Saved Posts (Bookmarks)
-- ============================================================================

CREATE TABLE public.saved_posts (
  user_id     UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  post_id     UUID        NOT NULL REFERENCES public.posts(id)    ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, post_id)
);

-- Indexes
CREATE INDEX idx_saved_posts_user_created ON public.saved_posts(user_id, created_at DESC);
CREATE INDEX idx_saved_posts_post_id       ON public.saved_posts(post_id);

-- RLS
ALTER TABLE public.saved_posts ENABLE ROW LEVEL SECURITY;

-- Users can see their own saved posts
CREATE POLICY "Users can view their own saved posts"
  ON public.saved_posts FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users can save (insert) posts for themselves
CREATE POLICY "Users can save posts"
  ON public.saved_posts FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can unsave (delete) their own saved posts
CREATE POLICY "Users can unsave posts"
  ON public.saved_posts FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());
