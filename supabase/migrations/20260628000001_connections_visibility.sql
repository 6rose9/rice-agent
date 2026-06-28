-- ============================================================================
-- စပါးအောင်သွယ် — Connection List Visibility Migration
-- Adds visibility control for connection lists on user profiles.
-- Visibility levels: 'public' (everyone), 'connections' (connected users only),
-- 'private' (owner only). Defaults to 'public'.
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
      AND column_name = 'connections_visibility'
  ) THEN
    ALTER TABLE public.profiles
      ADD COLUMN connections_visibility TEXT NOT NULL DEFAULT 'public'
      CHECK (connections_visibility IN ('public', 'connections', 'private'));
    RAISE NOTICE 'Added profiles.connections_visibility column';
  ELSE
    RAISE NOTICE 'profiles.connections_visibility column already exists';
  END IF;
END $$;
