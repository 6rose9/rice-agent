import { Profile, Post, Comment, PostImage, MarketStatusRow, RegionRow, TownshipRow } from "@/types";

// ── Mock Reference Data ─────────────────────────────────────────────

export const mockMarketStatuses: MarketStatusRow[] = [
  { id: 1, name: { en: "Looking for Buyers",   my: "ဝယ်သူရှာနေသည်" },     sort_order: 1 },
  { id: 2, name: { en: "Looking for Suppliers", my: "ရောင်းသူရှာနေသည်" },  sort_order: 2 },
  { id: 3, name: { en: "Buying Rice",           my: "စပါးဝယ်မည်" },         sort_order: 3 },
  { id: 4, name: { en: "Selling Rice",          my: "စပါးရောင်းမည်" },       sort_order: 4 },
  { id: 5, name: { en: "Available as Agent",    my: "အကျိုးဆောင်ရနိုင်သည်" }, sort_order: 5 },
  { id: 6, name: { en: "Open for Partnership",   my: "လုပ်ငန်းဖက်စပ်ရှာနေသည်" }, sort_order: 6 },
];

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

// ── Lookup Helpers ──────────────────────────────────────────────────

/**
 * Resolve a profile's location to a human-readable string.
 * Format: "Township, Region" or just "Region" if township not found.
 */
export function getLocationLabel(profile: Profile): string {
  const township = mockTownships.find((t) => t.id === profile.township_id);
  const region = mockRegions.find((r) => r.id === profile.region_id);
  if (township && region) return `${township.name.en}, ${region.name.en}`;
  if (region) return region.name.en;
  return "";
}

/** Get the display label for a market status ID. */
export function getMarketStatusLabel(statusId: number | null | undefined): string {
  if (statusId == null) return "";
  const status = mockMarketStatuses.find((s) => s.id === statusId);
  return status?.name.en ?? "";
}

// ── Mock Profiles ───────────────────────────────────────────────────

export const mockProfiles: Profile[] = [
  {
    id: "user-1",
    phone: "09123456789",
    username: "ukyawmin",
    full_name: "U Kyaw Min",
    role: "trader",
    avatar_url: "",
    bio: "စပါးလုပ်ငန်း ၁၅ နှစ်အတွေ့အကြုံရှိ။ အရည်အသွေးကောင်းမွန်ရောင်းဝယ်ပါတယ်။",
    region_id: 15,
    township_id: 1, // Hlaingthaya
    market_status_id: 2, // Looking for Suppliers
    phone_verified: false,
    created_at: "2025-03-15T00:00:00Z",
    updated_at: "2026-06-10T00:00:00Z",
  },
  {
    id: "user-2",
    phone: "09987654321",
    username: "dawhla",
    full_name: "Daw Hla Htay",
    role: "farmer",
    avatar_url: "",
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
    username: "uaunggyi",
    full_name: "U Aung Gyi",
    role: "trader",
    avatar_url: "",
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
    username: "dawmyamyint",
    full_name: "Daw Mya Myint",
    role: "agent",
    avatar_url: "",
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
    username: "komyo",
    full_name: "Ko Myo Aung",
    role: "farmer",
    avatar_url: "",
    bio: "Shwe Bo ဒေသမှာ စပါးစိုက်ပျိုးပါတယ်။ နှစ်စဉ် တန်ချိန် ၅၀၀ ခန့်ထွက်ရှိပါတယ်။",
    region_id: 12,
    township_id: 7, // Shwe Bo
    market_status_id: 1, // Looking for Buyers
    phone_verified: false,
    created_at: "2025-05-15T00:00:00Z",
    updated_at: "2026-05-20T00:00:00Z",
  },
  {
    id: "user-6",
    phone: "09666555777",
    username: "umgmg",
    full_name: "U Mg Mg",
    role: "trader",
    avatar_url: "",
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
  }));
}

// ── Mock Posts ───────────────────────────────────────────────────────
// Use fixed timestamps to avoid hydration mismatches between server and client

export const mockPosts: Post[] = [
  {
    id: "post-1",
    author_id: "user-2",
    author: mockProfiles[1],
    type: "selling",
    content:
      "ရန်ကုန်မှာ စပါးရောင်းဖို့ရှိပါတယ်။ စိတ်ဝင်စားရင် ဆက်သွယ်ပါ။\n\nPaw San အမျိုးအစားဖြစ်ပြီး အရည်အသွေးကောင်းမွန်ပါတယ်။",
    rice_type: "Paw San",
    price: 12000,
    quantity: 500,
    location: "Hmawbi, Yangon",
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
    content:
      "Looking to buy Shwe Bo Paw San rice. Need 200 baskets for mill processing.\n\nPlease contact if you have stock available in Ayeyarwady region.",
    rice_type: "Shwe Bo",
    price: 15000,
    quantity: 200,
    location: "Ayeyarwady Region",
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
    price: undefined,
    quantity: 1000,
    location: "Yangon Region",
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
    content:
      "Shwe Bo ဒေသထွက် Paw San စပါး ရောင်းရန်ရှိပါတယ်။\n\nနှစ်စဉ် တန်ချိန် ၅၀၀ ခန့်ထွက်ရှိပြီး အရည်အသွေးအကောင်းဆုံးဖြစ်ပါတယ်။",
    rice_type: "Paw San",
    price: 13500,
    quantity: 300,
    location: "Shwe Bo, Sagaing",
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
    price: 11000,
    quantity: 800,
    location: "Ayeyarwady Region",
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
    price: 10000,
    quantity: 600,
    location: "Mandalay",
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

// ── Relative time helper ─────────────────────────────────────────────

export function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "ယခုအတွင်း";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w`;
  return date.toLocaleDateString("my-MM");
}

// ── Format helpers ───────────────────────────────────────────────────

export function formatPrice(price: number | null | undefined): string {
  if (price == null) return "—";
  return `${price.toLocaleString()} Ks`;
}

export function formatQuantity(qty: number | null | undefined): string {
  if (qty == null) return "—";
  return `${qty.toLocaleString()} baskets`;
}

// ── Role badge display ───────────────────────────────────────────────

export const roleLabels: Record<string, string> = {
  farmer: "🧑‍🌾 Farmer",
  trader: "🏭 Trader",
  agent: "🤝 Agent",
  general_user: "👤 User",
};

// ── Region / Township data for form dropdowns ────────────────────────

export interface RegionData {
  label: string;
  townships: string[];
}

export const regionTownships: Record<string, RegionData> = {
  "yangon": {
    label: "Yangon Region",
    townships: [
      "Ahlon", "Bahan", "Botahtaung", "Dagon", "Dagon Myothit (East)",
      "Dagon Myothit (North)", "Dagon Myothit (South)", "Dagon Myothit (Seikkan)",
      "Dala", "Dawbon", "Hlaing", "Hlaingthaya", "Hlegu", "Hmawbi",
      "Htantabin", "Insein", "Kamayut", "Kawhmu", "Khayan", "Kungyangon",
      "Kyauktada", "Kyauktan", "Kyeemyindaing", "Lanmadaw", "Latha",
      "Mayangone", "Mingaladon", "Mingalartaungnyunt", "North Okkalapa",
      "Pabedan", "Pazundaung", "Sanchaung", "Seikgyikanaungto", "Seikkan",
      "Shwepyitha", "South Okkalapa", "Taikkyi", "Tamwe", "Thaketa",
      "Thanlyin", "Thingangyun", "Thongwa", "Twantay", "Yankin",
    ],
  },
  "mandalay": {
    label: "Mandalay Region",
    townships: [
      "Amarapura", "Aungmyethazan", "Chanayethazan", "Chanmyathazi",
      "Kyaukpadaung", "Kyaukse", "Lewe", "Madaya", "Mahaaungmyay",
      "Mahlaing", "Meiktila", "Mogok", "Myingyan", "Myittha", "Natogyi",
      "Ngazun", "Nyaung-U", "Patheingyi", "Pyawbwe", "Pyigyidagun",
      "Pyinoolwin", "Singu", "Sintgaing", "Tada-U", "Taungtha",
      "Thabeikkyin", "Thazi", "Wundwin", "Yamethin",
    ],
  },
  "ayeyarwady": {
    label: "Ayeyarwady Region",
    townships: [
      "Bogale", "Danubyu", "Dedaye", "Einme", "Hinthada", "Ingapu",
      "Kangyidaunt", "Kyaiklat", "Kyangin", "Kyaunggon", "Kyonpyaw",
      "Labutta", "Lemyethna", "Maubin", "Mawlamyinegyun", "Myanaung",
      "Myaungmya", "Ngapudaw", "Nyaungdon", "Pantanaw", "Pathein",
      "Pyapon", "Thabaung", "Wakema", "Yegyi", "Zalun",
    ],
  },
  "sagaing": {
    label: "Sagaing Region",
    townships: [
      "Ayadaw", "Banmauk", "Budalin", "Chaung-U", "Hkamti", "Homalin",
      "Indaw", "Kale", "Kalewa", "Kanbalu", "Katha", "Kawlin", "Khin-U",
      "Lahe", "Leshi", "Mawlaik", "Mingin", "Monywa", "Myaung", "Myinmu",
      "Nanyun", "Pale", "Paungbyin", "Pinlebu", "Sagaing", "Salingyi",
      "Shwebo", "Tamu", "Taze", "Tigyaing", "Wetlet", "Wuntho", "Ye-U",
      "Yinmarbin",
    ],
  },
  "bago": {
    label: "Bago Region",
    townships: [
      "Bago", "Daik-U", "Gyobingauk", "Kawa", "Kyauktaga", "Letpadan",
      "Minhla", "Monyo", "Nattalin", "Nyaunglebin", "Oktwin", "Padaung",
      "Paukkaung", "Paungde", "Pyay", "Shwegyin", "Shwedaung", "Tantabin",
      "Taungoo", "Thanatpin", "Thegon", "Thayarwady", "Waw", "Yedashe",
      "Zigon",
    ],
  },
  "magway": {
    label: "Magway Region",
    townships: [
      "Aunglan", "Chauk", "Gangaw", "Kamma", "Magway", "Minbu",
      "Mindon", "Minhla", "Myaing", "Myothit", "Natmauk", "Ngaphe",
      "Pakokku", "Pauk", "Pwintbyu", "Salin", "Saw", "Seikphyu",
      "Sidoktaya", "Sinbyugyun", "Taungdwingyi", "Thayet", "Tilin",
      "Yenangyaung", "Yesagyo",
    ],
  },
  "tanintharyi": {
    label: "Tanintharyi Region",
    townships: [
      "Bokpyin", "Dawei", "Kawthoung", "Kyunsu", "Launglon",
      "Myeik", "Palaw", "Tanintharyi", "Thayetchaung", "Yebyu",
    ],
  },
  "kachin": {
    label: "Kachin State",
    townships: [
      "Bhamo", "Chipwi", "Hpakant", "Injangyang", "Kawnglanghpu",
      "Machanbaw", "Mansi", "Mogaung", "Mohnyin", "Momauk",
      "Myitkyina", "Nogmung", "Puta-O", "Shwegu", "Sumprabum",
      "Tanai", "Tsawlaw", "Waingmaw",
    ],
  },
  "kayah": {
    label: "Kayah State",
    townships: [
      "Bawlakhe", "Demoso", "Hpasawng", "Hpruso", "Loikaw",
      "Mese", "Shadaw",
    ],
  },
  "kayin": {
    label: "Kayin State",
    townships: [
      "Hlaingbwe", "Hpa-An", "Hpapun", "Kawkareik", "Kyainseikgyi",
      "Myawaddy", "Thandaunggyi",
    ],
  },
  "chin": {
    label: "Chin State",
    townships: [
      "Falam", "Hakha", "Htantlang", "Kanpetlet", "Madupi",
      "Mindat", "Paletwa", "Tiddim", "Tonzang",
    ],
  },
  "mon": {
    label: "Mon State",
    townships: [
      "Bilin", "Chaungzon", "Kyaikmaraw", "Kyaikto", "Mawlamyine",
      "Mudon", "Paung", "Thanbyuzayat", "Thaton", "Ye",
    ],
  },
  "rakhine": {
    label: "Rakhine State",
    townships: [
      "Ann", "Buthidaung", "Gwa", "Kyaukphyu", "Kyauktaw",
      "Maungdaw", "Minbya", "Mrauk-U", "Munaung", "Myebon",
      "Pauktaw", "Ponnagyun", "Ramree", "Rathedaung", "Sittwe",
      "Thandwe", "Toungup",
    ],
  },
  "shan": {
    label: "Shan State",
    townships: [
      "Hopang", "Hsihseng", "Hseni", "Hsipaw", "Kalaw",
      "Kengtung", "Kunhing", "Kunlong", "Kutkai", "Kyaukme",
      "Laihka", "Langkho", "Lashio", "Laukkaing", "Lawksawk",
      "Loilen", "Mabein", "Manton", "Mawkmai", "Monghpyak",
      "Monghsat", "Mongkhet", "Mongmit", "Mongpan", "Mongping",
      "Mongton", "Mongyang", "Mongyawng", "Muse", "Namhsan",
      "Namtu", "Nanhkan", "Nansang", "Nawnghkio", "Nyaungshwe",
      "Pekon", "Pindaya", "Pinlaung", "Tachileik", "Tangyan",
      "Taunggyi", "Ywangan",
    ],
  },
  "naypyitaw": {
    label: "Naypyitaw Union Territory",
    townships: [
      "Dekkhinathiri", "Lewe", "Ottarathiri", "Pobbathiri",
      "Pyinmana", "Tatkon", "Zabuthiri", "Zeyarthiri",
    ],
  },
};

export const regionKeys = Object.keys(regionTownships);

// ── Region key → numeric ID mapping (for register form → DB) ──────────
export const regionKeyToId: Record<string, number> = {
  ayeyarwady: 1,
  bago: 2,
  chin: 3,
  kachin: 4,
  kayah: 5,
  kayin: 6,
  magway: 7,
  mandalay: 8,
  mon: 9,
  naypyitaw: 10,
  rakhine: 11,
  sagaing: 12,
  shan: 13,
  tanintharyi: 14,
  yangon: 15,
};

// ── Township name → numeric ID mapping (indexed by "regionKey|townshipName") ──
// Built from mockTownships — each township is unique by (name, region_id)
export const townshipKeyToId: Record<string, number> = {};
for (const t of mockTownships) {
  // Find the region key for this township's region_id
  const regionEntry = Object.entries(regionKeyToId).find(([, id]) => id === t.region_id);
  const regionKey = regionEntry?.[0] ?? "";
  townshipKeyToId[`${regionKey}|${t.name.en}`] = t.id;
}

// ── Market status labels (keyed by id for display) ───────────────────

export const marketStatusLabels: Record<number, string> = {
  1: "Looking for Buyers",
  2: "Looking for Suppliers",
  3: "Buying Rice",
  4: "Selling Rice",
  5: "Available as Agent",
  6: "Open for Partnership",
};

export const marketStatusShort: Record<number, string> = {
  1: "LFB",
  2: "LFS",
  3: "B.R.",
  4: "S.R.",
  5: "Avail",
  6: "OFP",
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
