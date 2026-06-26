-- Post reports: users can report posts that are not related to the rice industry
-- When a post reaches 5 reports, it is automatically hidden (is_active = false)

CREATE TABLE post_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (post_id, reporter_id)
);

CREATE INDEX idx_post_reports_post_id ON post_reports (post_id);

ALTER TABLE post_reports ENABLE ROW LEVEL SECURITY;

-- Users can see reports they created
CREATE POLICY "post_reports_select_own"
  ON post_reports FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = reporter_id);

-- Authenticated users can report posts
CREATE POLICY "post_reports_insert_own"
  ON post_reports FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = reporter_id);

-- Users can delete their own reports (undo)
CREATE POLICY "post_reports_delete_own"
  ON post_reports FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = reporter_id);
