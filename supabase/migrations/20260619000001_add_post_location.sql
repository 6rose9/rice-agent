-- ============================================================================
-- Add latitude/longitude columns to posts for map location
-- ============================================================================

ALTER TABLE public.posts
  ADD COLUMN latitude  DOUBLE PRECISION,
  ADD COLUMN longitude DOUBLE PRECISION;
