-- Post reactions (likes) — one like per user per post
-- Automatically updates posts.reaction_count via trigger

CREATE TABLE post_reactions (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id     UUID        NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id     UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (post_id, user_id)
);

CREATE INDEX idx_post_reactions_post_id ON post_reactions (post_id);

ALTER TABLE post_reactions ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read reactions
CREATE POLICY "post_reactions_select_all"
  ON post_reactions FOR SELECT
  TO authenticated
  USING (true);

-- Users can insert their own reactions
CREATE POLICY "post_reactions_insert_own"
  ON post_reactions FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

-- Users can delete their own reactions
CREATE POLICY "post_reactions_delete_own"
  ON post_reactions FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- Auto-update reaction_count on posts
CREATE OR REPLACE FUNCTION public.update_post_reaction_count()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE public.posts SET reaction_count = reaction_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE public.posts SET reaction_count = reaction_count - 1 WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_reaction_change
  AFTER INSERT OR DELETE ON public.post_reactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_post_reaction_count();
