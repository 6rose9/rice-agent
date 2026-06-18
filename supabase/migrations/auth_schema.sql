-- ============================================================================
-- စပါးအောင်သွယ် — Auth Database Schema
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================================

-- 0. Extension
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Market Status reference table
-- ============================================================================
CREATE TABLE public.market_status (
  id SMALLINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name JSONB NOT NULL,                     -- {"en": "Looking for Buyers", "my": "ဝယ်သူရှာနေသည်"}
  sort_order SMALLINT NOT NULL DEFAULT 0
);

ALTER TABLE public.market_status ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Market status viewable by everyone" ON public.market_status
  FOR SELECT USING (true);

-- Seed market status values
INSERT INTO public.market_status (name, sort_order) VALUES
  ('{"en": "Looking for Buyers",   "my": "ဝယ်သူရှာနေသည်"}',       1),
  ('{"en": "Looking for Suppliers","my": "ရောင်းသူရှာနေသည်"}',     2),
  ('{"en": "Buying Rice",          "my": "စပါးဝယ်မည်"}',           3),
  ('{"en": "Selling Rice",         "my": "စပါးရောင်းမည်"}',         4),
  ('{"en": "Available as Agent",   "my": "အကျိုးဆောင်ရနိုင်သည်"}',   5),
  ('{"en": "Open for Partnership",  "my": "လုပ်ငန်းဖက်စပ်ရှာနေသည်"}', 6);

-- 2. Regions reference table (bilingual names, JSONB)
-- ============================================================================
CREATE TABLE public.regions (
  id SMALLINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name JSONB NOT NULL,                     -- {"en": "Yangon", "my": "ရန်ကုန်"}
  sort_order SMALLINT NOT NULL DEFAULT 0
);

ALTER TABLE public.regions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Regions viewable by everyone" ON public.regions
  FOR SELECT USING (true);

-- Seed regions
INSERT INTO public.regions (name, sort_order) VALUES
  ('{"en":"Ayeyarwady",  "my":"ဧရာဝတီ"}',      1),
  ('{"en":"Bago",        "my":"ပဲခူး"}',         2),
  ('{"en":"Chin",        "my":"ချင်း"}',         3),
  ('{"en":"Kachin",      "my":"ကချင်"}',        4),
  ('{"en":"Kayah",       "my":"ကယား"}',         5),
  ('{"en":"Kayin",       "my":"ကရင်"}',         6),
  ('{"en":"Magway",      "my":"မကွေး"}',        7),
  ('{"en":"Mandalay",    "my":"မန္တလေး"}',       8),
  ('{"en":"Mon",         "my":"မွန်"}',          9),
  ('{"en":"Naypyidaw",   "my":"နေပြည်တော်"}',    10),
  ('{"en":"Rakhine",     "my":"ရခိုင်"}',       11),
  ('{"en":"Sagaing",     "my":"စစ်ကိုင်း"}',      12),
  ('{"en":"Shan",        "my":"ရှမ်း"}',        13),
  ('{"en":"Tanintharyi", "my":"တနင်္သာရီ"}',     14),
  ('{"en":"Yangon",      "my":"ရန်ကုန်"}',       15);

-- 3. Townships reference table
-- ============================================================================
CREATE TABLE public.townships (
  id SMALLINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name JSONB NOT NULL,                     -- {"en": "Hlaingthaya", "my": "လှိုင်သာယာ"}
  region_id SMALLINT NOT NULL REFERENCES public.regions(id),
  sort_order SMALLINT NOT NULL DEFAULT 0,
  UNIQUE(name, region_id)
);

CREATE INDEX idx_townships_region_id ON public.townships(region_id);

ALTER TABLE public.townships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Townships viewable by everyone" ON public.townships
  FOR SELECT USING (true);

-- 4. Profiles table
-- ============================================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone TEXT NOT NULL UNIQUE,
  email TEXT,
  username TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'general_user'
    CHECK (role IN ('farmer', 'trader', 'agent', 'general_user')),
  avatar_url TEXT,
  cover_url TEXT,
  bio TEXT,
  region_id SMALLINT NOT NULL REFERENCES public.regions(id),
  township_id SMALLINT NOT NULL REFERENCES public.townships(id),
  market_status_id SMALLINT REFERENCES public.market_status(id),
  phone_verified BOOLEAN NOT NULL DEFAULT false,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_profiles_role_region ON public.profiles(role, region_id);
CREATE INDEX idx_profiles_township_id ON public.profiles(township_id);
CREATE INDEX idx_profiles_region_id ON public.profiles(region_id);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Active (non-deleted) profiles are viewable by everyone
CREATE POLICY "Active profiles viewable by everyone" ON public.profiles
  FOR SELECT USING (deleted_at IS NULL);

-- Users can always view their own profile (even if soft-deleted)
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can only update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- 5. Phone → Email lookup function (SECURITY DEFINER)
-- Used by Server Action to resolve phone number to auth.users.email for login
-- ============================================================================
CREATE OR REPLACE FUNCTION public.lookup_email_by_phone(phone_number TEXT)
RETURNS TEXT AS $$
DECLARE
  found_email TEXT;
BEGIN
  SELECT u.email INTO found_email
  FROM auth.users u
  JOIN public.profiles p ON p.id = u.id
  WHERE p.phone = phone_number;
  RETURN found_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = '';

-- 6. Auto-create profile on signup trigger
-- market_status_id is NULL by default — user sets it later
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, phone, email, username, full_name, role, region_id, township_id)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'phone',
    NEW.raw_user_meta_data ->> 'email',
    NEW.raw_user_meta_data ->> 'username',
    NEW.raw_user_meta_data ->> 'full_name',
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'general_user'),
    (NEW.raw_user_meta_data ->> 'region_id')::SMALLINT,
    (NEW.raw_user_meta_data ->> 'township_id')::SMALLINT
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = '';

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. Soft delete account function
-- Sets deleted_at on the calling user's profile; does NOT delete the auth record
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
