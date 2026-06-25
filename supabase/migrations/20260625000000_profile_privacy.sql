-- ============================================================================
-- စပါးအောင်သွယ် — Profile Privacy Settings Migration
-- Adds visibility controls for phone and email on user profiles.
-- Visibility levels: 'public' (everyone), 'followers' (followers only),
-- 'private' (owner only). Defaults to 'public'.
-- Run in Supabase Dashboard → SQL Editor (idempotent — safe to re-run)
-- ============================================================================

-- 1. Add phone_visibility column to profiles
-- ============================================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
      AND column_name = 'phone_visibility'
  ) THEN
    ALTER TABLE public.profiles
      ADD COLUMN phone_visibility TEXT NOT NULL DEFAULT 'private'
      CHECK (phone_visibility IN ('public', 'followers', 'private'));
    RAISE NOTICE 'Added profiles.phone_visibility column';
  ELSE
    RAISE NOTICE 'profiles.phone_visibility column already exists';
  END IF;
END $$;

-- 2. Add email_visibility column to profiles
-- ============================================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
      AND column_name = 'email_visibility'
  ) THEN
    ALTER TABLE public.profiles
      ADD COLUMN email_visibility TEXT NOT NULL DEFAULT 'private'
      CHECK (email_visibility IN ('public', 'followers', 'private'));
    RAISE NOTICE 'Added profiles.email_visibility column';
  ELSE
    RAISE NOTICE 'profiles.email_visibility column already exists';
  END IF;
END $$;
