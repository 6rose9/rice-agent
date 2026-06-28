-- ============================================================================
-- Security fixes: subscription tier + privacy enforcement
-- ============================================================================

-- 1. Add subscription_tier to profiles (server-side subscription check)
-- ============================================================================
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free'
  CHECK (subscription_tier IN ('free', 'pro', 'pro_plus'));

-- 2. Privacy-enforcing view for public profile access
-- ============================================================================
-- Masks phone/email based on visibility settings and requester relationship
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT
  p.id,
  p.username,
  p.full_name,
  p.role,
  p.avatar_url,
  p.cover_url,
  p.bio,
  p.region_id,
  p.township_id,
  p.market_status_id,
  p.phone_verified,
  p.created_at,
  p.updated_at,
  -- Conditionally expose phone
  CASE
    WHEN p.phone_visibility = 'public' THEN p.phone
    WHEN p.phone_visibility = 'followers' AND EXISTS (
      SELECT 1 FROM follows f
      WHERE f.following_id = p.id AND f.follower_id = auth.uid()
    ) THEN p.phone
    WHEN auth.uid() = p.id THEN p.phone
    ELSE NULL
  END AS phone,
  -- Conditionally expose email
  CASE
    WHEN p.email_visibility = 'public' THEN p.email
    WHEN p.email_visibility = 'followers' AND EXISTS (
      SELECT 1 FROM follows f
      WHERE f.following_id = p.id AND f.follower_id = auth.uid()
    ) THEN p.email
    WHEN auth.uid() = p.id THEN p.email
    ELSE NULL
  END AS email,
  -- Expose visibility settings so UI can show "hidden" state
  p.phone_visibility,
  p.email_visibility
FROM public.profiles p
WHERE p.deleted_at IS NULL;
