-- Connections: mutual/accepted connections between two users
-- user1_id < user1_id to enforce canonical ordering and prevent duplicates

CREATE TABLE connections (
  user1_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  user2_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user1_id, user2_id),
  CHECK (user1_id < user2_id)
);

CREATE INDEX idx_connections_user1 ON connections (user1_id);
CREATE INDEX idx_connections_user2 ON connections (user2_id);

ALTER TABLE connections ENABLE ROW LEVEL SECURITY;

-- Anyone can see connections (public social graph)
CREATE POLICY "connections_select_all"
  ON connections FOR SELECT
  USING (true);

-- System inserts on accept (via server action with auth check)
CREATE POLICY "connections_insert_auth"
  ON connections FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Users can delete connections (unconnect)
CREATE POLICY "connections_delete_own"
  ON connections FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user1_id OR (select auth.uid()) = user2_id);
