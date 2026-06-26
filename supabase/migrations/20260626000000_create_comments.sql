-- ============================================================================
-- စပါးအောင်သွယ် — Comments Table
-- Enables commenting on posts with automatic comment_count maintenance.
-- ============================================================================

-- 1. Comments table
-- ============================================================================
CREATE TABLE public.comments (
  id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id     UUID          NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  author_id   UUID          NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content     TEXT          NOT NULL CHECK (char_length(content) BETWEEN 1 AND 1000),
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- 2. Indexes
-- ============================================================================
CREATE INDEX idx_comments_post_id ON public.comments(post_id, created_at);
CREATE INDEX idx_comments_author_id ON public.comments(author_id);

-- 3. RLS policies
-- ============================================================================
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read comments
CREATE POLICY "Comments are readable by authenticated users"
  ON public.comments FOR SELECT TO authenticated USING (true);

-- Users can insert their own comments
CREATE POLICY "Users can create their own comments"
  ON public.comments FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = author_id);

-- Users can update their own comments
CREATE POLICY "Users can update their own comments"
  ON public.comments FOR UPDATE TO authenticated
  USING (auth.uid() = author_id);

-- Users can delete their own comments
CREATE POLICY "Users can delete their own comments"
  ON public.comments FOR DELETE TO authenticated
  USING (auth.uid() = author_id);

-- 4. Triggers
-- ============================================================================

-- Auto-update updated_at on edit
CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Increment/decrement comment_count on posts
CREATE OR REPLACE FUNCTION public.update_post_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE public.posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE public.posts SET comment_count = comment_count - 1 WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_comment_change
  AFTER INSERT OR DELETE ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_post_comment_count();
