-- Connection requests: sender sends to receiver, status tracks lifecycle
-- When accepted, a row is created in the connections table

CREATE TABLE connection_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CHECK (sender_id <> receiver_id),
  UNIQUE (sender_id, receiver_id)
);

CREATE INDEX idx_connection_requests_receiver ON connection_requests (receiver_id, status);
CREATE INDEX idx_connection_requests_sender ON connection_requests (sender_id, status);

ALTER TABLE connection_requests ENABLE ROW LEVEL SECURITY;

-- Users can see requests they sent or received
CREATE POLICY "connection_requests_select_own"
  ON connection_requests FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = sender_id OR (select auth.uid()) = receiver_id);

-- Authenticated users can send requests
CREATE POLICY "connection_requests_insert_own"
  ON connection_requests FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = sender_id);

-- Receiver can update status (accept/decline), sender can cancel
CREATE POLICY "connection_requests_update_own"
  ON connection_requests FOR UPDATE
  TO authenticated
  USING (
    (select auth.uid()) = receiver_id OR (select auth.uid()) = sender_id
  )
  WITH CHECK (
    (select auth.uid()) = receiver_id OR (select auth.uid()) = sender_id
  );

-- Sender can delete (cancel), receiver can delete (decline/remove)
CREATE POLICY "connection_requests_delete_own"
  ON connection_requests FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = sender_id OR (select auth.uid()) = receiver_id);
