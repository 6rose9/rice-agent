-- Follows table: social graph junction for follow/unfollow
-- follower_id follows following_id

CREATE TABLE follows (
  follower_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  following_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (follower_id, following_id),
  CHECK (follower_id <> following_id)
);

-- Index for fetching a user's followers
CREATE INDEX idx_follows_following ON follows (following_id);
-- Index for fetching who a user follows
CREATE INDEX idx_follows_follower ON follows (follower_id);

ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

-- Anyone can see follow relationships (public social graph)
CREATE POLICY "follows_select_all"
  ON follows FOR SELECT
  USING (true);

-- Authenticated users can follow others (insert as follower)
CREATE POLICY "follows_insert_own"
  ON follows FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = follower_id);

-- Users can unfollow (delete their own follow)
CREATE POLICY "follows_delete_own"
  ON follows FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = follower_id);
