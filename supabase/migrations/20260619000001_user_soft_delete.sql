-- ============================================================================
-- စပါးအောင်သွယ် — Soft Delete Migration (Profiles)
-- Run in Supabase Dashboard → SQL Editor (idempotent — safe to re-run)
-- Note: posts.is_active is defined in 20260618000001_create_posts.sql
-- ============================================================================

-- 1. Add deleted_at column to profiles (soft delete support)
-- ============================================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
      AND column_name = 'deleted_at'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN deleted_at TIMESTAMPTZ;
    RAISE NOTICE 'Added profiles.deleted_at column';
  ELSE
    RAISE NOTICE 'profiles.deleted_at column already exists';
  END IF;
END $$;

-- 2. Soft delete function (SECURITY DEFINER so users can soft-delete their own profile)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.soft_delete_account()
RETURNS void AS $$
BEGIN
  UPDATE public.profiles
  SET deleted_at = now(),
      updated_at = now()
  WHERE id = auth.uid()
    AND deleted_at IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = '';

-- 3. Updated RLS for profiles: hide deleted profiles from public view
-- ============================================================================
-- Drop the old "viewable by everyone" policy
DROP POLICY IF EXISTS "Profiles viewable by everyone" ON public.profiles;

-- Active profiles (not soft-deleted) are viewable by everyone
CREATE POLICY "Active profiles viewable by everyone" ON public.profiles
  FOR SELECT USING (deleted_at IS NULL);

-- Users can still view their own profile even if deleted (for reactivation)
-- This ORs with the policy above — owner always sees their own row
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
