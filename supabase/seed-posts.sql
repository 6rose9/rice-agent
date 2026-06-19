-- ============================================================================
-- Seed: 5 Selling & Buying Posts
-- Run in Supabase Dashboard → SQL Editor
--
-- Since subscription is not yet implemented, selling/buying posts can't be
-- created through the form UI (it shows a Pro upsell). This script seeds
-- the database with realistic trading posts for development/testing.
--
-- Idempotent: safe to re-run (uses ON CONFLICT / skips if already exists).
-- ============================================================================

DO $$
DECLARE
  uid1  UUID := 'a0000000-0000-4000-8000-000000000001';
  uid2  UUID := 'a0000000-0000-4000-8000-000000000002';
  uid3  UUID := 'a0000000-0000-4000-8000-000000000003';
  uid4  UUID := 'a0000000-0000-4000-8000-000000000004';
  uid5  UUID := 'a0000000-0000-4000-8000-000000000005';
  pid1  UUID := 'b0000000-0000-4000-8000-000000000001';
  pid2  UUID := 'b0000000-0000-4000-8000-000000000002';
  pid3  UUID := 'b0000000-0000-4000-8000-000000000003';
  pid4  UUID := 'b0000000-0000-4000-8000-000000000004';
  pid5  UUID := 'b0000000-0000-4000-8000-000000000005';
BEGIN

-- 1. Create auth users (profiles FK references auth.users)
-- ============================================================================
-- The handle_new_user trigger will auto-create basic profiles.
INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at)
VALUES
  (uid1, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'seed_farmer1@example.com', '', now(), '{"phone":"09900000001","username":"seed_farmer1","full_name":"U Tin Win","role":"farmer","region_id":15,"township_id":14}', now(), now()),
  (uid2, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'seed_trader1@example.com', '', now(), '{"phone":"09900000002","username":"seed_trader1","full_name":"U Zaw Min Oo","role":"trader","region_id":15,"township_id":12}', now(), now()),
  (uid3, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'seed_farmer2@example.com', '', now(), '{"phone":"09900000003","username":"seed_farmer2","full_name":"Ko Aung Ko","role":"farmer","region_id":12,"township_id":126}', now(), now()),
  (uid4, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'seed_trader2@example.com', '', now(), '{"phone":"09900000004","username":"seed_trader2","full_name":"U Soe Moe","role":"trader","region_id":8,"township_id":47}', now(), now()),
  (uid5, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'seed_agent1@example.com', '', now(), '{"phone":"09900000005","username":"seed_agent1","full_name":"Daw Khin Mar Lay","role":"agent","region_id":1,"township_id":94}', now(), now())
ON CONFLICT (id) DO NOTHING;

-- 2. Update profiles with extra fields (bio, market_status_id)
-- ============================================================================
-- The trigger already inserted basic profiles; we just add the extras.
UPDATE public.profiles SET
  bio              = 'Hmawbi မှာ Paw San စပါး အဓိကစိုက်ပျိုးပါတယ်။ နှစ်စဉ် တင်းရေ ၃၀၀ ခန့်ထွက်ရှိပါတယ်။',
  market_status_id = 4  -- Selling Rice
WHERE id = uid1;

UPDATE public.profiles SET
  bio              = 'ရန်ကုန်အခြေစိုက် ဆန်ကုန်သည်။ ပြည်တွင်းပြည်ပ စပါးရောင်းဝယ်ရေး လုပ်ကိုင်ပါတယ်။',
  market_status_id = 3  -- Buying Rice
WHERE id = uid2;

UPDATE public.profiles SET
  bio              = 'Shwe Bo ဒေသမှာ စပါးစိုက်ပျိုးပြီး အရည်အသွေးကောင်း စပါးများ ရောင်းချပါတယ်။',
  market_status_id = 1  -- Looking for Buyers
WHERE id = uid3;

UPDATE public.profiles SET
  bio              = 'မန္တလေးဆန်ကုန်သည်။ Emata နဲ့ Paw San အဓိကဝယ်ယူပါတယ်။',
  market_status_id = 6  -- Open for Partnership
WHERE id = uid4;

UPDATE public.profiles SET
  bio              = 'ဧရာဝတီတိုင်းအခြေစိုက် ကိုယ်စားလှယ်။ လယ်သမားနဲ့ ကုန်သည်ချိတ်ဆက်ပေးပါတယ်။',
  market_status_id = 5  -- Available as Agent
WHERE id = uid5;

-- 3. Create posts (3 selling, 2 buying)
-- ============================================================================

INSERT INTO public.posts (id, author_id, type, content, rice_type, rice_name, price, quantity, unit, address, location, township, easy_to_carry, pound_per_bag, paddy_condition, badge, reaction_count, comment_count, created_at, updated_at)
VALUES
  -- Post 1: Selling — farmer selling Paw San from Hmawbi
  (pid1, uid1, 'selling',
   E'Paw San စပါးကောင်းကောင်း ရောင်းရန်ရှိပါတယ်။\n\nHmawbi ခြံမှာ စိုက်ပျိုးထားတဲ့ အကောင်းဆုံး Paw San စပါးဖြစ်ပါတယ်။ ဆန်စက်လုပ်ငန်းရှင်များ ဆက်သွယ်မေးမြန်းနိုင်ပါတယ်။',
   'Paw San', 'Hmawbi Premium', 580000, 300, 'basket', 'No. 12, Hmawbi Township, Yangon', 'yangon', 'Hmawbi', true, 100, 'dry', 'pro', 15, 4, now() - INTERVAL '3 hours', now() - INTERVAL '3 hours'),

  -- Post 2: Buying — trader looking for bulk paddy for mill
  (pid2, uid2, 'buying',
   E'ဆန်စက်အတွက် စပါးအမြောက်အများ ဝယ်ယူမည်။\n\nPaw San နှင့် ရာသီစပါးများ ဝယ်ယူပါမည်။ တစ်ရာသီလုံး အဆက်မပြတ်ဝယ်ယူမည်ဖြစ်ပါသည်။ တန်ဖိုးနှုန်းထားကောင်းပေးပါမည်။',
   'Paw San', 'Mill Grade A', 620000, 1000, 'basket', 'Hlaingthaya Industrial Zone, Yangon', 'yangon', 'Hlaingthaya', true, 104, '14', 'pro', 28, 7, now() - INTERVAL '5 hours', now() - INTERVAL '5 hours'),

  -- Post 3: Selling — farmer selling Shwe Bo premium
  (pid3, uid3, 'selling',
   E'Shwe Bo ဒေသထွက် အကောင်းဆုံး စပါးများ ရောင်းရန်ရှိပါတယ်။\n\nကျွန်တော်တို့ ခြံမှာ တစ်နှစ်လျှင် တန်ချိန် ၄၀၀ ခန့်ထွက်ရှိပါတယ်။ ဈေးကွက်အတွင်းအကောင်းဆုံးအရည်အသွေးအာမခံပါတယ်။',
   'Shwe Bo', 'Shwe Bo Special', 550000, 400, 'basket', 'Shwe Bo Town, Sagaing', 'sagaing', 'Shwebo', false, 98, 'dry', 'pro', 42, 11, now() - INTERVAL '8 hours', now() - INTERVAL '8 hours'),

  -- Post 4: Buying — Mandalay trader buying Emata
  (pid4, uid4, 'buying',
   E'မန္တလေးအခြေစိုက် ဆန်ကုန်သည်။ Emata စပါး အမြောက်အများ ဝယ်ယူမည်။\n\nတစ်လလျှင် တင်း ၅၀၀ ခန့် ပုံမှန်ဝယ်ယူမည်။ ရေရှည်ချိတ်ဆက်လုပ်ကိုင်လိုပါတယ်။',
   'Emata', 'Emata Premium Grade', 480000, 500, 'basket', 'Mandalay Rice Market, Chanayethazan', 'mandalay', 'Chanayethazan', false, 96, '12', 'pro', 19, 6, now() - INTERVAL '12 hours', now() - INTERVAL '12 hours'),

  -- Post 5: Selling — agent connecting Ayeyarwady farmers
  (pid5, uid5, 'selling',
   E'ဧရာဝတီတိုင်းမှ လယ်သမားများကိုယ်စား စပါးအရောင်းအဝယ် ချိတ်ဆက်ပေးပါတယ်။\n\nလက်ရှိတွင် ပုသိမ်နှင့် ဟင်္သာတဒေသမှ Paw San စပါးတင်း ၆၀၀ ရရှိနိုင်ပါပြီ။ အရည်အသွေးအာမခံပါတယ်။',
   'Paw San', 'Ayeyarwady Paw San', 530000, 600, 'basket', 'Pathein, Ayeyarwady Region', 'ayeyarwady', 'Pathein', true, 102, '13', 'pro', 33, 9, now() - INTERVAL '1 day', now() - INTERVAL '1 day')
ON CONFLICT (id) DO NOTHING;

-- 4. Create post images (ON CONFLICT skip)
-- ============================================================================
INSERT INTO public.post_images (post_id, url, sort_order) VALUES
  -- Post 1: Hmawbi Paw San (3 images — nature/field scenes)
  (pid1, 'https://picsum.photos/id/1039/800/600', 0),
  (pid1, 'https://picsum.photos/id/1047/800/600', 1),
  (pid1, 'https://picsum.photos/id/1060/800/600', 2),
  -- Post 2: Hlaingthaya mill buying (2 images — industrial/landscape)
  (pid2, 'https://picsum.photos/id/1018/800/600', 0),
  (pid2, 'https://picsum.photos/id/1019/800/600', 1),
  -- Post 3: Shwe Bo premium (4 images — golden fields/rivers)
  (pid3, 'https://picsum.photos/id/15/800/600', 0),
  (pid3, 'https://picsum.photos/id/28/800/600', 1),
  (pid3, 'https://picsum.photos/id/29/800/600', 2),
  (pid3, 'https://picsum.photos/id/36/800/600', 3),
  -- Post 5: Ayeyarwady delta agent (2 images — water/delta scenes)
  (pid5, 'https://picsum.photos/id/1033/800/600', 0),
  (pid5, 'https://picsum.photos/id/1036/800/600', 1)
ON CONFLICT DO NOTHING;

RAISE NOTICE 'Seeded 5 selling/buying posts with images';

END $$;
