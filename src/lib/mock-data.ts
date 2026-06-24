import { Profile, Post, Comment, PostImage, RegionRow, TownshipRow } from "@/types";

// ── Mock Reference Data ─────────────────────────────────────────────

export const mockRegions: RegionRow[] = [
  { id: 1,  name: { en: "Ayeyarwady",  my: "ဧရာဝတီ" },     sort_order: 1 },
  { id: 2,  name: { en: "Bago",        my: "ပဲခူး" },        sort_order: 2 },
  { id: 3,  name: { en: "Chin",        my: "ချင်း" },        sort_order: 3 },
  { id: 4,  name: { en: "Kachin",      my: "ကချင်" },       sort_order: 4 },
  { id: 5,  name: { en: "Kayah",       my: "ကယား" },        sort_order: 5 },
  { id: 6,  name: { en: "Kayin",       my: "ကရင်" },        sort_order: 6 },
  { id: 7,  name: { en: "Magway",      my: "မကွေး" },       sort_order: 7 },
  { id: 8,  name: { en: "Mandalay",    my: "မန္တလေး" },      sort_order: 8 },
  { id: 9,  name: { en: "Mon",         my: "မွန်" },         sort_order: 9 },
  { id: 10, name: { en: "Naypyidaw",   my: "နေပြည်တော်" },   sort_order: 10 },
  { id: 11, name: { en: "Rakhine",     my: "ရခိုင်" },      sort_order: 11 },
  { id: 12, name: { en: "Sagaing",     my: "စစ်ကိုင်း" },     sort_order: 12 },
  { id: 13, name: { en: "Shan",        my: "ရှမ်း" },       sort_order: 13 },
  { id: 14, name: { en: "Tanintharyi", my: "တနင်္သာရီ" },    sort_order: 14 },
  { id: 15, name: { en: "Yangon",      my: "ရန်ကုန်" },      sort_order: 15 },
];

export const mockTownships: TownshipRow[] = [
  // Yangon (15)
  { id: 1,  name: { en: "Hlaingthaya", my: "လှိုင်သာယာ" }, region_id: 15, sort_order: 1 },
  { id: 2,  name: { en: "Hmawbi",      my: "မှော်ဘီ" },    region_id: 15, sort_order: 2 },
  { id: 3,  name: { en: "Insein",      my: "အင်းစိန်" },    region_id: 15, sort_order: 3 },
  { id: 4,  name: { en: "Mingaladon",  my: "မင်္ဂလာဒုံ" },  region_id: 15, sort_order: 4 },
  // Mandalay (8)
  { id: 5,  name: { en: "Chanayethazan", my: "ချမ်းအေးသာစံ" }, region_id: 8, sort_order: 1 },
  { id: 6,  name: { en: "Chanmyathazi",  my: "ချမ်းမြသာစည်" }, region_id: 8, sort_order: 2 },
  // Sagaing (12)
  { id: 7,  name: { en: "Shwe Bo",     my: "ရွှေဘို" },    region_id: 12, sort_order: 1 },
  { id: 8,  name: { en: "Monywa",      my: "မုံရွာ" },     region_id: 12, sort_order: 2 },
  // Ayeyarwady (1)
  { id: 9,  name: { en: "Pathein",     my: "ပုသိမ်" },     region_id: 1, sort_order: 1 },
  { id: 10, name: { en: "Hinthada",    my: "ဟင်္သာတ" },    region_id: 1, sort_order: 2 },
];

// ── Mock Profiles ───────────────────────────────────────────────────

export const mockProfiles: Profile[] = [
  {
    id: "user-1",
    phone: "09123456789",
    email: "ukyawmin@example.com",
    username: "ukyawmin",
    full_name: "U Kyaw Min",
    role: "trader",
    avatar_url: "",
    cover_url: null,
    bio: "စပါးလုပ်ငန်း ၁၅ နှစ်အတွေ့အကြုံရှိ။ အရည်အသွေးကောင်းမွန်ရောင်းဝယ်ပါတယ်။",
    region_id: 15,
    township_id: 1, // Hlaingthaya
    market_status_id: 2, // Selling Rice
    phone_verified: false,
    created_at: "2025-03-15T00:00:00Z",
    updated_at: "2026-06-10T00:00:00Z",
  },
  {
    id: "user-2",
    phone: "09987654321",
    email: "dawhla@example.com",
    username: "dawhla",
    full_name: "Daw Hla Htay",
    role: "farmer",
    avatar_url: "",
    cover_url: null,
    bio: "Hmawbi မှာ စပါးစိုက်ပျိုးပါတယ်။ Paw San နဲ့ Shwe Bo အဓိကစိုက်ပါတယ်။",
    region_id: 15,
    township_id: 2, // Hmawbi
    market_status_id: 4, // Selling Rice
    phone_verified: false,
    created_at: "2025-01-20T00:00:00Z",
    updated_at: "2026-06-08T00:00:00Z",
  },
  {
    id: "user-3",
    phone: "09555111222",
    email: "uaunggyi@example.com",
    username: "uaunggyi",
    full_name: "U Aung Gyi",
    role: "trader",
    avatar_url: "",
    cover_url: null,
    bio: "Rice mill owner in Ayeyarwady Delta. Buying paddy in bulk.",
    region_id: 1,
    township_id: 9, // Pathein
    market_status_id: 3, // Buying Rice
    phone_verified: false,
    created_at: "2025-02-10T00:00:00Z",
    updated_at: "2026-06-05T00:00:00Z",
  },
  {
    id: "user-4",
    phone: "09444333222",
    email: "dawmyamyint@example.com",
    username: "dawmyamyint",
    full_name: "Daw Mya Myint",
    role: "agent",
    avatar_url: "",
    cover_url: null,
    bio: "အကျိုးဆောင် ၁၀ နှစ်ကျော်။ ဧရာဝတီနဲ့ ရန်ကုန်ဒေသကို အဓိကချိတ်ဆက်ပေးပါတယ်။",
    region_id: 15,
    township_id: 3, // Insein
    market_status_id: 5, // Available as Agent
    phone_verified: false,
    created_at: "2025-04-01T00:00:00Z",
    updated_at: "2026-06-12T00:00:00Z",
  },
  {
    id: "user-5",
    phone: "09222333444",
    email: "komyo@example.com",
    username: "komyo",
    full_name: "Ko Myo Aung",
    role: "farmer",
    avatar_url: "",
    cover_url: null,
    bio: "Shwe Bo ဒေသမှာ စပါးစိုက်ပျိုးပါတယ်။ နှစ်စဉ် တန်ချိန် ၅၀၀ ခန့်ထွက်ရှိပါတယ်။",
    region_id: 12,
    township_id: 7, // Shwe Bo
    market_status_id: 2, // Selling Rice
    phone_verified: false,
    created_at: "2025-05-15T00:00:00Z",
    updated_at: "2026-05-20T00:00:00Z",
  },
  {
    id: "user-6",
    phone: "09666555777",
    email: "umgmg@example.com",
    username: "umgmg",
    full_name: "U Mg Mg",
    role: "trader",
    avatar_url: "",
    cover_url: null,
    bio: "Mandalay rice wholesaler. Specializing in Emata and Paw San varieties.",
    region_id: 8,
    township_id: 5, // Chanayethazan
    market_status_id: 6, // Open for Partnership
    phone_verified: false,
    created_at: "2024-11-01T00:00:00Z",
    updated_at: "2026-06-14T00:00:00Z",
  },
];

// ── Mock Post Images ─────────────────────────────────────────────────

function placeholderImages(postId: string, count: number): PostImage[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `img-${postId}-${i}`,
    post_id: postId,
    url: `/api/placeholder/400/300?text=Rice+Photo+${i + 1}`,
    sort_order: i,
    created_at: new Date().toISOString(),
  }));
}

// ── Mock Posts ───────────────────────────────────────────────────────
// Use fixed timestamps to avoid hydration mismatches between server and client

export const mockPosts: Post[] = [
  {
    id: "post-general-1",
    author_id: "user-4",
    author: mockProfiles[3],
    type: "general",
    content:
      "ဧရာဝတီတိုင်းမှာ စပါးစိုက်ပျိုးနည်း အကြံပေးလိုပါတယ်။ ဘယ်သူ့ဆီမှာ အကြံဥာဏ်တောင်းလို့ရနိုင်မလဲ? ကျေးဇူးတင်ပါတယ်။",
    images: [],
    reaction_count: 12,
    comment_count: 5,
    created_at: "2026-06-17T08:00:00Z",
    updated_at: "2026-06-17T08:00:00Z",
  },
  {
    id: "post-general-2",
    author_id: "user-6",
    author: mockProfiles[5],
    type: "general",
    is_saved: true,
    content:
      "မန္တလေးမှာ စပါးပွဲရုံသစ်တစ်ခု ဖွင့်လိုက်ပါတယ်။ စပါးစိုက်ပျိုးသူတွေနဲ့ ချိတ်ဆက်လိုပါတယ်။ ကျွန်တော့် Profile ကို ဝင်ကြည့်ပေးပါ။",
    images: placeholderImages("post-general-2", 2),
    reaction_count: 8,
    comment_count: 3,
    created_at: "2026-06-17T07:00:00Z",
    updated_at: "2026-06-17T07:00:00Z",
  },
  {
    id: "post-1",
    author_id: "user-2",
    author: mockProfiles[1],
    type: "selling",
    content:
      "ရန်ကုန်မှာ စပါးရောင်းဖို့ရှိပါတယ်။ စိတ်ဝင်စားရင် ဆက်သွယ်ပါ။\n\nPaw San အမျိုးအစားဖြစ်ပြီး အရည်အသွေးကောင်းမွန်ပါတယ်။",
    rice_type: "Paw San",
    rice_name: "Special Grade A",
    price: 550_000,
    quantity: 500,
    unit: "basket",
    address: "No. 45, Hmawbi Township, Yangon",
    region: "yangon",
    township: "Hmawbi",
    easy_to_carry: true,
    pound_per_bag: 100,
    paddy_condition: "14",
    badge: "pro",
    images: placeholderImages("post-1", 3),
    reaction_count: 24,
    comment_count: 8,
    created_at: "2026-06-17T04:00:00Z",
    updated_at: "2026-06-17T04:00:00Z",
  },
  {
    id: "post-2",
    author_id: "user-3",
    author: mockProfiles[2],
    type: "buying",
    is_saved: true,
    content:
      "Looking to buy Shwe Bo Paw San rice. Need 200 baskets for mill processing.\n\nPlease contact if you have stock available in Ayeyarwady region.",
    rice_type: "Shwe Bo",
    rice_name: undefined,
    price: 650_000,
    quantity: 200,
    unit: "basket",
    address: "Ayeyarwady Rice Mill, Pathein",
    region: "ayeyarwady",
    township: "Pathein",
    easy_to_carry: false,
    pound_per_bag: null,
    paddy_condition: "14",
    badge: "pro",
    images: placeholderImages("post-2", 1),
    reaction_count: 18,
    comment_count: 5,
    created_at: "2026-06-17T06:00:00Z",
    updated_at: "2026-06-17T06:00:00Z",
  },
  {
    id: "post-3",
    author_id: "user-1",
    author: mockProfiles[0],
    type: "buying",
    content:
      "ဆန်စက်အတွက် စပါး အမြောက်အများ ဝယ်ယူမည်။\n\nPaw San၊ Emata မရွေး ဝယ်ယူပါမည်။ တစ်နှုန်းကောင်းပေးပါမည်။",
    rice_type: "Any",
    rice_name: undefined,
    price: undefined,
    quantity: 1000,
    unit: "basket",
    address: "Hlaingthaya Industrial Zone, Yangon",
    region: "yangon",
    township: "Hlaingthaya",
    easy_to_carry: true,
    pound_per_bag: 95,
    paddy_condition: "12",
    badge: "pro_plus",
    images: [],
    reaction_count: 32,
    comment_count: 12,
    created_at: "2026-06-17T01:00:00Z",
    updated_at: "2026-06-17T01:00:00Z",
  },
  {
    id: "post-4",
    author_id: "user-5",
    author: mockProfiles[4],
    type: "selling",
    is_saved: true,
    content:
      "Shwe Bo ဒေသထွက် Paw San စပါး ရောင်းရန်ရှိပါတယ်။\n\nနှစ်စဉ် တန်ချိန် ၅၀၀ ခန့်ထွက်ရှိပြီး အရည်အသွေးအကောင်းဆုံးဖြစ်ပါတယ်။",
    rice_type: "Paw San",
    rice_name: "Shwe Bo Premium",
    price: 600_000,
    quantity: 300,
    unit: "basket",
    address: "Shwe Bo Town, Sagaing",
    region: "sagaing",
    township: "Shwebo",
    easy_to_carry: false,
    pound_per_bag: 98,
    paddy_condition: "14",
    badge: "pro",
    images: placeholderImages("post-4", 4),
    reaction_count: 45,
    comment_count: 15,
    created_at: "2026-06-16T19:00:00Z",
    updated_at: "2026-06-16T19:00:00Z",
  },
  {
    id: "post-5",
    author_id: "user-4",
    author: mockProfiles[3],
    type: "selling",
    content:
      "ဧရာဝတီတိုင်းမှ စပါးများ ရောင်းချရန် ချိတ်ဆက်ပေးပါတယ်။\n\nလက်ရှိ Paw San နှင့် Emata နှစ်မျိုးလုံးရှိပါတယ်။",
    rice_type: "Paw San, Emata",
    rice_name: undefined,
    price: 500_000,
    quantity: 800,
    unit: "basket",
    address: "Pathein, Ayeyarwady",
    region: "ayeyarwady",
    township: "Pathein",
    easy_to_carry: true,
    pound_per_bag: 105,
    paddy_condition: "14",
    badge: "pro",
    images: placeholderImages("post-5", 2),
    reaction_count: 10,
    comment_count: 3,
    created_at: "2026-06-16T07:00:00Z",
    updated_at: "2026-06-16T07:00:00Z",
  },
  {
    id: "post-6",
    author_id: "user-6",
    author: mockProfiles[5],
    type: "buying",
    content:
      "မန္တလေးဆန်ကုန်သည်များအတွက် Emata စပါး အမြောက်အများဝယ်ယူမည်။\n\nပွဲရုံများမှ တိုက်ရိုက်ဝယ်ယူလိုပါတယ်။",
    rice_type: "Emata",
    rice_name: undefined,
    price: 450_000,
    quantity: 600,
    unit: "basket",
    address: "Mandalay Rice Market, Chanayethazan",
    region: "mandalay",
    township: "Chanayethazan",
    easy_to_carry: false,
    pound_per_bag: null,
    paddy_condition: "12",
    badge: "pro",
    images: [],
    reaction_count: 8,
    comment_count: 2,
    created_at: "2026-06-15T07:00:00Z",
    updated_at: "2026-06-15T07:00:00Z",
  },
];

// ── Mock Comments ────────────────────────────────────────────────────

export const mockComments: Record<string, Comment[]> = {
  "post-1": [
    {
      id: "comment-1",
      post_id: "post-1",
      author_id: "user-1",
      author: mockProfiles[0],
      content: "ဈေးနှုန်းလေး ပြောပြပေးပါဦး။ ဘယ်နှစ်တင်းရှိလဲဗျ။",
      created_at: "2026-06-17T05:00:00Z",
    },
    {
      id: "comment-2",
      post_id: "post-1",
      author_id: "user-3",
      author: mockProfiles[2],
      content: "အရည်အသွေးကောင်းရင် အကုန်ဝယ်မယ်။ ဖုန်းဆက်လိုက်ပါ့မယ်။",
      created_at: "2026-06-17T06:00:00Z",
    },
  ],
  "post-2": [
    {
      id: "comment-3",
      post_id: "post-2",
      author_id: "user-5",
      author: mockProfiles[4],
      content: "Shwe Bo က ကျွန်တော့်ဆီမှာ Paw San ရှိတယ်။ ၂၀၀ တင်းရတယ်။",
      created_at: "2026-06-17T06:30:00Z",
    },
  ],
};

// ── Mock Network Data ────────────────────────────────────────────────

export interface NetworkInvitation {
  id: string;
  from: Profile;
  message?: string;
  mutual_connections: number;
  created_at: string;
}

export const mockInvitations: NetworkInvitation[] = [
  {
    id: "inv-1",
    from: mockProfiles[1], // Daw Hla Htay
    message: "I'd like to connect with you. I sell Paw San rice in Hmawbi.",
    mutual_connections: 3,
    created_at: "2026-06-17T05:00:00Z",
  },
  {
    id: "inv-2",
    from: mockProfiles[4], // Ko Myo Aung
    message: undefined,
    mutual_connections: 1,
    created_at: "2026-06-16T23:00:00Z",
  },
  {
    id: "inv-3",
    from: mockProfiles[3], // Daw Mya Myint
    message:
      "ဧရာဝတီနဲ့ ရန်ကုန်ဒေသကို ချိတ်ဆက်ပေးတဲ့ အကျိုးဆောင်ပါ။ ချိတ်ဆက်ချင်ပါတယ်။",
    mutual_connections: 5,
    created_at: "2026-06-16T07:00:00Z",
  },
];

// "People you may know" — complementary to mockProfiles
export const mockSuggestions = mockProfiles.slice(0, 6);

export const networkStats = {
  connections: 156,
  followers: 42,
  following: 89,
};
