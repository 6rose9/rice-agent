# Wireframes — စပါးအောင်သွယ်

ASCII wireframes for all primary pages. Mobile-first; desktop variants shown inline.

---

## 1. Landing Page (Feed)

The landing page IS the feed —  users land directly on their feed.

### Mobile

```
┌──────────────────────────────────┐
│  TopBar                          │
│  [🍚 စပါးအောင်သွယ်]    [🔍][🔔] │⚙️
├──────────────────────────────────┤
│  FeedFilter                      │
│  [ All | Buying | Selling | Foll…]│
├──────────────────────────────────┤
│  ┌──────────────────────────────┐│
│  │ PostCard                     ││
│  │ [Avatar] U Mg Mg · 2h ago   ││
│  │                              ││
│  │ Post content text here...    ││
│  │ ┌──────┐ ┌──────┐           ││
│  │ │ Img1 │ │ Img2 │           ││
│  │ └──────┘ └──────┘           ││
│  │                              ││
│  │ [🏷️ Selling] [📍 Yangon]     ││
│  │ [❤️ 12] [💬 3] [🔗 Share]    ││
│  └──────────────────────────────┘│
│  ┌──────────────────────────────┐│
│  │ PostCard                     ││
│  │ ...                          ││
│  └──────────────────────────────┘│
│  ┌──────────────────────────────┐│
│  │ PostCard                     ││
│  │ ...                          ││
│  └──────────────────────────────┘│
│  ┌──────────────────────────────┐│
│  │ SkeletonCard (loading)       ││
│  │ ██████████████████████████   ││
│  │ ████████                     ││
│  └──────────────────────────────┘│
├──────────────────────────────────┤
│  BottomNav                       │
│  [🏠 Home][My Network][➕][💬][👤]│
└──────────────────────────────────┘
```

#### States
- **Loading**: 3–5 skeleton cards with pulsing gray blocks.
- **Empty**: EmptyCard with illustration + "No posts yet" + "Follow rice traders to see their posts."
- **Error**: "Something went wrong" + [Retry] button.
- **Offline**: OfflineBanner pinned below TopBar.

### Desktop (max-width: 1280px container, centered)

```
         ←—————— max-width: 1280px, margin: 0 auto ——————→
┌──────┬────────────────────────────────────┬──────────────┐
│Sidebar│  Main Feed (680px, flex-grow)     │RightRail     │
│240px  │                                   │ 300px        │
│       │  FeedFilter                       │              │
│[🏠]   │  [All | Buying | Selling | Follow…]│  Suggestions │
│ Home  │  ┌──────────────────────────────┐ │              │
│       │  │ PostCard                     │ │  👤 User A   │
│[🔍]   │  │ [Avatar] U Mg Mg · 2h ago   │ │     Trader   │
│ Search│  │ Post content text here...    │ │  👤 User B   │
│       │  │ [🏷️ Selling] [📍 Yangon]     │ │     Miller   │
│[👤]   │  │ [❤️ 12] [💬 3] [🔗 Share]    │ │  👤 User C   │
│Profile│  └──────────────────────────────┘ │              │
│       │  ┌──────────────────────────────┐ │  [See All]   │
│[⚙️]   │  │ PostCard                     │ │              │
│Settings│  │ ...                          │ │  ──────────  │
│       │  └──────────────────────────────┘ │  Trending    │
│───────│  ┌──────────────────────────────┐ │  🌾 Paw San  │
│       │  │ PostCard                     │ │  📍 Delta    │
│Footer │  │ ...                          │ │  💰 <15K     │
│Links  │  └──────────────────────────────┘ │              │
│       │                                   │  ──────────  │
│       │  (infinite scroll...)             │  Footer      │
│       │                                   │  About·Terms │
└──────┴────────────────────────────────────┴──────────────┘

  ◀─────────────── 1220px total ————————▶
  On 1440px+ screens, container centers with ~110px gutters each side.
  On 1024–1280px screens, RightRail collapses to 260px; Feed shrinks to 524px.
```

#### Large Screen Notes
- The entire layout is wrapped in a `max-width: 1280px` container centered via `margin: 0 auto`.
- Sidebar is fixed 240px; RightRail is fixed 300px; Feed fills remaining space (~680px at 1280px).
- At viewport widths > 1280px, equal gutters appear on both sides of the container.
- At 1024–1279px, RightRail narrows to 260px and Feed compresses to fill.
- Below 1024px, RightRail hides and layout switches to the mobile BottomNav pattern.

---

## 2. Feed Page (Focused)

Same structure as landing page, but shown here with full PostCard detail and the post type badges.

### Mobile — PostCard Detail

```
┌──────────────────────────────────┐
│  TopBar                          │
│  [🍚 Feed]           [🔍][🔔] │⚙️│
├──────────────────────────────────┤
│  [ All | Buying | Selling | Foll…]│
├──────────────────────────────────┤
│  ┌──────────────────────────────┐│
│  │ [🧑‍🌾 Avatar] Daw Hla · 3h ago  ││…│
│  │ [🏷️ SELLING tag]             ││
│  │                              ││
│  │ "ရန်ကုန်မှာ စပါးရောင်းဖို့ရှိ  ││
│  │  ပါတယ်။ စိတ်ဝင်စားရင် ဆက်သွယ်  ││
│  │  ပါ။"                        ││
│  │                              ││
│  │ ┌─────────┐ ┌─────────┐     ││
│  │ │  Rice   │ │  Rice   │     ││
│  │ │  Photo1 │ │  Photo2 │     ││
│  │ └─────────┘ └─────────┘     ││
│  │ ┌─────────┐                 ││
│  │ │  Photo3 │                 ││
│  │ └─────────┘                 ││
│  │                              ││
│  │ 📍 Hmawbi   🌾 Paw San      ││
│  │ 💰 12,000 Ks/basket         ││
│  │ 📦 500 baskets              ││
│  │                              ││
│  │ ─────────────────────────── ││
│  │  ❤️ 24   💬 8   🔗 Share  ⋯ ││
│  └──────────────────────────────┘│
│  ┌──────────────────────────────┐│
│  │ PostCard (Buying)            ││
│  │ ...                          ││
│  └──────────────────────────────┘│
├──────────────────────────────────┤
│  BottomNav                       │
│ [🏠 Home][My Network][➕][💬][👤]│
└──────────────────────────────────┘
```

### Desktop — Expanded PostCard (centered container, same 3-col grid)

```
         ←—————— max-width: 1280px, centered ——————→
┌──────┬────────────────────────────────────┬──────────────┐
│Sidebar│  Main Feed                         │RightRail     │
│240px  │  FeedFilter                        │ 300px        │
│       │  [All | Buying | Selling | Follow…] │              │
│       │  ┌──────────────────────────────┐  │  Trending    │
│       │  │ [Avatar] U Kyaw · 1h ago [⋯]│  │  Topics      │
│       │  │ [🏷️ BUYING]                  │  │              │
│       │  │                              │  │  🌾 Paw San  │
│       │  │ Looking to buy Shwe Bo Paw   │  │  📍 Delta    │
│       │  │ San rice. Need 200 baskets   │  │  💰 <15K     │
│       │  │ for mill.                    │  │              │
│       │  │                              │  │  🌾 Shwe Bo  │
│       │  │ ┌──────┐ ┌──────┐ ┌──────┐  │  │  📍 Sagaing  │
│       │  │ │ Img1 │ │ Img2 │ │ Img3 │  │  │              │
│       │  │ └──────┘ └──────┘ └──────┘  │  │  [See All]   │
│       │  │                              │  │              │
│       │  │ 🌾 Shwe Bo  💰 <15K/basket   │  │  ──────────  │
│       │  │ 📦 200 baskets  📍 Ayeyarwady│  │  Saved       │
│       │  │                              │  │  Posts       │
│       │  │ ❤️ 18  💬 5  🔗 Share  📌   │  │  📌 Item 1   │
│       │  └──────────────────────────────┘  │  📌 Item 2   │
│       │  ┌──────────────────────────────┐  │              │
│       │  │ PostCard (Selling)           │  │              │
│       │  │ ...                          │  │              │
│       │  └──────────────────────────────┘  │              │
│       │  (infinite scroll...)              │              │
└──────┴────────────────────────────────────┴──────────────┘
```

---

## 3. Profile Page

### Mobile

```
┌──────────────────────────────────┐
│  TopBar                          │
│  [← Back]        [⚙️ Settings]   │
├──────────────────────────────────┤
│  ProfileHeader                   │
│  ┌──────────────────────────────┐│
│  │ ░░░░ Cover Photo ░░░░░░░░░░░││
│  │       [🧑‍🌾 Avatar 80px]      ││
│  │       U Kyaw Min             ││
│  │       Rice Mill Owner        ││
│  │       📍 Yangon Region       ││
│  │                              ││
│  │  [Edit Profile] [Follow]     ││
│  │                              ││
│  │  ┌─────────┬─────────┬─────┐ ││
│  │  │   Posts │Followers│Fol- │ ││
│  │  │    42   │   156   │lowing│ ││
│  │  │         │         │  89 │ ││
│  │  └─────────┴─────────┴─────┘ ││
│  └──────────────────────────────┘│
├──────────────────────────────────┤
│  ProfileTabs                     │
│  [ Posts | About | Network ]     │
├──────────────────────────────────┤
│  ┌──────────────────────────────┐│
│  │ PostCard                     ││
│  │ ...                          ││
│  └──────────────────────────────┘│
│  ┌──────────────────────────────┐│
│  │ PostCard                     ││
│  │ ...                          ││
│  └──────────────────────────────┘│
│  ┌──────────────────────────────┐│
│  │ PostCard                     ││
│  │ ...                          ││
│  └──────────────────────────────┘│
│  (scroll...)                     │
├──────────────────────────────────┤
│  BottomNav                       │
│  [🏠][🔍][➕ FAB][💬][👤 Active]│
└──────────────────────────────────┘
```

### Mobile — About Tab (Scroll)

```
├──────────────────────────────────┤
│  [ Posts | About | Network ]     │
├──────────────────────────────────┤
│  ┌──────────────────────────────┐│
│  │ About                        ││
│  │                              ││
│  │ 📝 Bio                       ││
│  │ "စပါးလုပ်ငန်း ၁၅ နှစ်အတွေ့အ   ││
│  │  ကြုံရှိ။ အရည်အသွေးကောင်းမ   ││
│  │  ွန်ရောင်းဝယ်ပါတယ်။"        ││
│  │                              ││
│  │ 📍 Location: Yangon          ││
│  │ 🏢 Business: Min Rice Mill   ││
│  │ 🌾 Specialty: Paw San, Shwe Bo││
│  │ 📅 Joined: March 2025        ││
│  │ 🔗 Website: minmill.com      ││
│  └──────────────────────────────┘│
│  ┌──────────────────────────────┐│
│  │ Activity                     ││
│  │  ▸ 12 posts this month       ││
│  │  ▸ Top category: Selling     ││
│  └──────────────────────────────┘│
│  (scroll...)                     │
└──────────────────────────────────┘
```

### Desktop — 2-Column Content + RightRail (centered container)

```
         ←—————— max-width: 1280px, centered ——————→
┌──────┬──────────────────────────────────────┬──────────────┐
│Sidebar│  Profile Page                       │RightRail     │
│240px  │                                     │ 300px        │
│       │  ┌────────────────────────────────┐ │              │
│       │  │ ░░░░ Cover Photo ░░░░░░░░░░░░░░│ │  Similar     │
│       │  │        [Avatar 120px]          │ │  Traders     │
│       │  │     U Kyaw Min                 │ │              │
│       │  │     Rice Mill Owner · Yangon   │ │  👤 U Aye    │
│       │  │     [Edit Profile] [Follow]    │ │  👤 Daw Hla  │
│       │  │  Posts 42 · Followers 156 ·    │ │  👤 U Soe    │
│       │  │  Following 89                  │ │              │
│       │  └────────────────────────────────┘ │  [See All]   │
│       │                                     │              │
│       │  Tabs: [ Posts | About | Network ]  │  ──────────  │
│       │                                     │  Quick       │
│       │  ┌────────────┬───────────────────┐ │  Stats       │
│       │  │ About      │ Posts             │ │              │
│       │  │ (280px)    │ (flex-grow)       │ │  📊 42 Posts │
│       │  │            │                   │ │  👥 156 Foll │
│       │  │ 📝 Bio     │ ┌───────────────┐ │ │  🏷️ Top:     │
│       │  │ "စပါးလုပ်…" │ │ PostCard      │ │ │   Selling   │
│       │  │            │ └───────────────┘ │ │              │
│       │  │ 📍 Yangon  │ ┌───────────────┐ │ │              │
│       │  │ 🏢 Min Mill│ │ PostCard      │ │ │              │
│       │  │ 🌾 Paw San │ └───────────────┘ │ │              │
│       │  │ 📅 Mar 2025│ ┌───────────────┐ │ │              │
│       │  │ 🔗 minmill │ │ PostCard      │ │ │              │
│       │  │            │ └───────────────┘ │ │              │
│       │  │            │ (scroll...)       │ │              │
│       │  └────────────┴───────────────────┘ │              │
│       │                                     │              │
└──────┴──────────────────────────────────────┴──────────────┘
```

#### Large Screen Profile Notes
- Cover photo spans the full content width (header is above the About+Posts split).
- About column (280px, sticky) always visible next to the Posts feed — no tab switching needed on desktop.
- Tabs still available for quick-jump: clicking "Network" replaces the About column with a Network list.
- At < 1024px, switches to mobile tab-based layout (About/Network as separate tab panels).
- The RightRail shows context-aware widgets: Similar Traders + Quick Stats on own profile; mutuality info on others' profiles.

---

## 4. Search Page

### Mobile

```
┌──────────────────────────────────┐
│  TopBar                          │
│  ┌──────────────────────────────┐│
│  │ 🔍 Search traders, rice...  ││
│  └──────────────────────────────┘│
├──────────────────────────────────┤
│  Quick Filters (horizontal scroll)│
│  [🌾 All] [🧑‍🌾 Farmers] [🏭 Mill]│
│  [🏪 Trader] [📍 Yangon] [📍 Delta]│
├──────────────────────────────────┤
│  Recent Searches                 │
│  ┌──────────────────────────────┐│
│  │ 🕐 Paw San rice              ││
│  │ 🕐 U Kyaw Min                ││
│  │ 🕐 Shwe Bo                   ││
│  │ [Clear All]                  ││
│  └──────────────────────────────┘│
├──────────────────────────────────┤
│  Results                         │
│  ┌──────────────────────────────┐│
│  │ 🔍 "Paw San" — 24 results    ││
│  └──────────────────────────────┘│
│  ┌──────────────────────────────┐│
│  │ 👤 Daw Hla Htay              ││
│  │    Rice Trader · Yangon      ││
│  │    🌾 Paw San, Emata         ││
│  │                        [Chat]││
│  └──────────────────────────────┘│
│  ┌──────────────────────────────┐│
│  │ 🏷️ Post Result               ││
│  │ "Paw San rice for sale..."   ││
│  │ by U Kyaw Min · 2d ago      ││
│  │ 💰 12,000 Ks/basket          ││
│  └──────────────────────────────┘│
│  ┌──────────────────────────────┐│
│  │ 👤 U Aung Gyi                ││
│  │    Mill Owner · Delta        ││
│  └──────────────────────────────┘│
│  (scroll...)                     │
├──────────────────────────────────┤
│  BottomNav                       │
│  [🏠][🔍 Active][➕][💬][👤]     │
└──────────────────────────────────┘
```

#### States
- **Idle**: Recent searches + trending keywords.
- **Typing**: Live suggestions dropdown below input.
- **No Results**: EmptyCard — "No results for 'xyz'" + "Try different keywords or filters."
- **Loading**: Skeleton rows in results area.
- **Error**: Retry UI inline.

### Desktop — Full Search (centered container, 2-column results)

```
         ←—————— max-width: 1280px, centered ——————→
┌──────┬──────────────────────────────────────┬──────────────┐
│Sidebar│  Search                             │RightRail     │
│240px  │                                     │ 300px        │
│       │  ┌────────────────────────────────┐ │              │
│       │  │ 🔍 Search rice traders, rice… │ │  Saved       │
│       │  └────────────────────────────────┘ │  Searches    │
│       │                                     │              │
│       │  Filters: [All] [Farmers] [Mill]   │  🕐 Paw San  │
│       │  [Trader] [Yangon] [Delta] [Mandalay]│  🕐 Shwe Bo  │
│       │                                     │  🕐 U Kyaw   │
│       │  ┌────────────────────────────────┐ │              │
│       │  │ 🔍 "Paw San" — 24 results      │ │  ──────────  │
│       │  └────────────────────────────────┘ │  Trending    │
│       │                                     │  Keywords    │
│       │  ┌─────────────┬──────────────────┐ │              │
│       │  │ Users       │ Posts            │ │  🌾 Emata    │
│       │  │ (340px)     │ (340px)          │ │  📍 Delta    │
│       │  │             │                  │ │  🌾 Shwe Bo  │
│       │  │ 👤 Daw Hla  │ 🏷️ "Paw San      │ │              │
│       │  │   Trader    │     rice for     │ │              │
│       │  │   🌾 Paw San│     sale…"       │ │              │
│       │  │        [Chat]│   by U Kyaw Min │ │              │
│       │  │             │   💰 12,000 Ks   │ │              │
│       │  │ 👤 U Kyaw   │                  │ │              │
│       │  │   Mill Owner│ 🏷️ "Shwe Bo      │ │              │
│       │  │   🌾 Shwe Bo│     available…"  │ │              │
│       │  │        [Chat]│   by Daw Hla    │ │              │
│       │  │             │                  │ │              │
│       │  │ 👤 U Aung   │ 🏷️ "Rice mill    │ │              │
│       │  │   Farmer    │     service…"    │ │              │
│       │  │   📍 Delta  │   by U Soe      │ │              │
│       │  │             │                  │ │              │
│       │  │ (scroll…)   │ (scroll…)       │ │              │
│       │  └─────────────┴──────────────────┘ │              │
│       │                                     │              │
└──────┴──────────────────────────────────────┴──────────────┘
```

#### Large Screen Search Notes
- Search input spans the full content width above the results split.
- Users column (340px) and Posts column (340px) split the content area evenly.
- Both columns scroll independently (separate scroll containers).
- At 1024–1279px, columns narrow proportionally.
- Below 1024px, switches to a single-column tabbed result view (Users tab / Posts tab).

---

## 5. Create Post Page

### Mobile — Full Page (Sheet from Bottom)

```
┌──────────────────────────────────┐
│  TopBar                          │
│  [✕ Cancel]    Create Post  [Post]│
├──────────────────────────────────┤
│  User Identity Row               │
│  [🧑‍🌾 Avatar] U Kyaw Min          │
│  [🏷️ Posting as: Mill Owner ▼]   │
├──────────────────────────────────┤
│  Post Type Toggle                │
│  ┌──────────────┬──────────────┐ │
│  │  🛒 Selling  │  💰 Buying   │ │
│  │  (selected)  │              │ │
│  └──────────────┴──────────────┘ │
├──────────────────────────────────┤
│  ┌──────────────────────────────┐│
│  │                              ││
│  │  What do you want to share?  ││
│  │                              ││
│  │  (textarea — grows with      ││
│  │   content, min 4 lines)      ││
│  │                              ││
│  └──────────────────────────────┘│
├──────────────────────────────────┤
│  📷 Add Photos                   │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──┐│
│  │ Img1 │ │ Img2 │ │ Img3 │ │+ ││
│  │  ✕   │ │  ✕   │ │  ✕   │ │  ││
│  └──────┘ └──────┘ └──────┘ └──┘│
│  (max 4 images)                  │
├──────────────────────────────────┤
│  Optional Details                │
│  ┌──────────────────────────────┐│
│  │ 🌾 Rice Type    [Paw San ▼] ││
│  │ 💰 Price/Kg     [______]    ││
│  │ 📦 Quantity     [______]    ││
│  │ 📍 Location     [Yangon ▼]  ││
│  └──────────────────────────────┘│
├──────────────────────────────────┤
│  (keyboard area — content pushes │\
│   up naturally)                  │
└──────────────────────────────────┘
```

#### Create Post — Validation States
```
┌──────────────────────────────────┐
│  ⚠️ Please add a description     │
│     (inline error message)       │
│  ┌──────────────────────────────┐│
│  │ [empty textarea — red border]││
│  └──────────────────────────────┘│
│                                  │
│  [Post] → disabled until valid   │
└──────────────────────────────────┘
```

### Desktop — Modal

```
         dimmed overlay
    ┌─────────────────────────────────┐
    │                                 │
    │  ┌─────────────────────────────┐│
    │  │ ✕         Create Post       ││
    │  ├─────────────────────────────┤│
    │  │ [🧑‍🌾] U Kyaw Min             ││
    │  ├─────────────────────────────┤│
    │  │  [🛒 Selling] [💰 Buying]   ││
    │  ├─────────────────────────────┤│
    │  │ ┌─────────────────────────┐ ││
    │  │ │ Write your post...      │ ││
    │  │ │                         │ ││
    │  │ │ (min 4 lines textarea)  │ ││
    │  │ └─────────────────────────┘ ││
    │  ├─────────────────────────────┤│
    │  │ 📷 Add Images  [📷 Upload]  ││
    │  │ [img1][img2][img3][+Add]   ││
    │  ├─────────────────────────────┤│
    │  │ Details                     ││
    │  │ 🌾 [Rice Type ▼]  💰 [____]││
    │  │ 📦 [Quantity ▼]   📍 [____]││
    │  ├─────────────────────────────┤│
    │  │                [Cancel][Post]││
    │  └─────────────────────────────┘│
    │                                 │
    └─────────────────────────────────┘
```

---

## 6. Network Page

LinkedIn-style network management. Invitations + People You May Know in the center;
network overview/stats in the right rail (not left — intentionally flipped from LinkedIn).

### Mobile

```
┌──────────────────────────────────┐
│  TopBar                          │
│  [← Back]          My Network    │
├──────────────────────────────────┤
│  156 connections                 │
│  3 pending invitations           │
├──────────────────────────────────┤
│  Quick-jump tabs                 │
│  [ Invitations | People You May  │
│    (3 new)     |  Know ]         │
├──────────────────────────────────┤
│  ── Invitations ──              │
│  ┌──────────────────────────────┐│
│  │ [Avatar] Daw Hla Htay        ││
│  │  🧑‍🌾 Farmer · Hmawbi         ││
│  │  3 mutual connections        ││
│  │  "I'd like to connect..."    ││
│  │  [Ignore] [Accept]           ││
│  └──────────────────────────────┘│
│  ┌──────────────────────────────┐│
│  │ [Avatar] Ko Myo Aung         ││
│  │  🧑‍🌾 Farmer · Shwe Bo        ││
│  │  1 mutual connection         ││
│  │  [Ignore] [Accept]           ││
│  └──────────────────────────────┘│
│  ┌──────────────────────────────┐│
│  │ [Avatar] Daw Mya Myint       ││
│  │  🤝 Agent · Yangon           ││
│  │  5 mutual connections        ││
│  │  "ဧရာဝတီနဲ့ရန်ကုန်..."        ││
│  │  [Ignore] [Accept]           ││
│  └──────────────────────────────┘│
│                                  │
│  ── People You May Know ──      │
│  ┌────────┐ ┌────────┐          │
│  │░░cover░░│ │░░cover░░│          │
│  │[Avtr] │ │[Avtr] │          │
│  │U Kyaw │ │U Aung │          │
│  │Trader │ │Trader │          │
│  │Yangon │ │Delta  │          │
│  │[Conn] │ │[Conn] │          │
│  └────────┘ └────────┘          │
│  ┌────────┐ ┌────────┐          │
│  │░░cover░░│ │░░cover░░│          │
│  │[Avtr] │ │[Avtr] │          │
│  │Daw Mya│ │Ko Myo │          │
│  │Agent  │ │Farmer │          │
│  │Yangon │ │Sagaing│          │
│  │[Conn] │ │[Conn] │          │
│  └────────┘ └────────┘          │
│  (more...)                       │
│                                  │
│  ── Your Network Stats ──       │
│  ┌──────────────────────────────┐│
│  │ Connections ............ 156 ││
│  │ Following ............... 89 ││
│  │ Followers ............... 42 ││
│  │ Pending .................. 3 ││
│  └──────────────────────────────┘│
│  (scroll...)                     │
├──────────────────────────────────┤
│  BottomNav                       │
│  [🏠][🔍][➕ FAB][💬][👤]       │
└──────────────────────────────────┘
```

#### States
- **Loading**: Skeleton cards for invitations and suggestions.
- **Empty Invitations**: "No pending invitations" with illustration + "All caught up!"
- **Unauthenticated**: Illustration + "Sign in to manage your network" + CTA button.

### Desktop — LinkedIn-style Center + Right Overview

```
         ←—————— max-width: 1280px, centered ——————→
┌──────┬────────────────────────────────────┬──────────────┐
│Sidebar│  My Network                       │Network       │
│240px  │                                   │Overview      │
│       │  156 connections · 3 pending      │ 300px        │
│       │                                   │              │
│       │  ── Invitations (3) ──  [Ignore  │ Manage       │
│       │                        All]      │ Network      │
│       │  ┌──────────────────────────────┐ │              │
│       │  │ [Avatar] Daw Hla Htay        │ │ 🔗 Connect-  │
│       │  │ 🧑‍🌾 Farmer · Hmawbi   3 mut.│ │    ions 156  │
│       │  │ "I'd like to connect with    │ │ 📥 Following │
│       │  │  you. I sell Paw San..."     │ │    89        │
│       │  │ 🕐 Jun 14                    │ │ 📤 Followers │
│       │  │ [Ignore] [Accept]            │ │    42        │
│       │  └──────────────────────────────┘ │              │
│       │  ┌──────────────────────────────┐ │ ──────────── │
│       │  │ [Avatar] Ko Myo Aung         │ │ Pending      │
│       │  │ 🧑‍🌾 Farmer · Shwe Bo   1 mut.│ │              │
│       │  │ 🕐 Jun 15                    │ │ 3 invitations│
│       │  │ [Ignore] [Accept]            │ │              │
│       │  └──────────────────────────────┘ │              │
│       │  ┌──────────────────────────────┐ │              │
│       │  │ [Avatar] Daw Mya Myint       │ │ ──────────── │
│       │  │ 🤝 Agent · Yangon    5 mut.  │ │ Footer       │
│       │  │ "ဧရာဝတီနဲ့ရန်ကုန်ဒေသကို..."  │ │ About·Terms  │
│       │  │ 🕐 Jun 15                    │ │              │
│       │  │ [Ignore] [Accept]            │ │              │
│       │  └──────────────────────────────┘ │              │
│       │  See all invitation history →     │              │
│       │                                   │              │
│       │  ── People You May Know ──       │              │
│       │  ┌───────┐ ┌───────┐ ┌───────┐  │              │
│       │  │░░cover░│ │░░cover░│ │░░cover░│  │              │
│       │  │[Avtr] │ │[Avtr] │ │[Avtr] │  │              │
│       │  │U Kyaw │ │U Aung │ │Daw Mya│  │              │
│       │  │Trader │ │Trader │ │Agent  │  │              │
│       │  │Yangon │ │Delta  │ │Yangon │  │              │
│       │  │ LFS   │ │ B.R.  │ │ Avail │  │              │
│       │  │[Conn] │ │[Conn] │ │[Conn] │  │              │
│       │  └───────┘ └───────┘ └───────┘  │              │
│       │  ┌───────┐ ┌───────┐ ┌───────┐  │              │
│       │  │░░cover░│ │░░cover░│ │░░cover░│  │              │
│       │  │[Avtr] │ │[Avtr] │ │[Avtr] │  │              │
│       │  │Ko Myo │ │U MgMg │ │Daw Hla│  │              │
│       │  │Farmer │ │Trader │ │Farmer │  │              │
│       │  │Sagaing│ │Mandaly│ │Hmawbi │  │              │
│       │  │ LFB   │ │ OFP   │ │ S.R.  │  │              │
│       │  │[Conn] │ │[Conn] │ │[Conn] │  │              │
│       │  └───────┘ └───────┘ └───────┘  │              │
│       │  (scroll for more...)             │              │
│       │                                   │              │
└──────┴────────────────────────────────────┴──────────────┘
```

#### Large Screen Network Notes
- **Network Overview is on the RIGHT** — intentionally flipped from LinkedIn's left-side layout.
  This keeps the project's consistent Sidebar (240px left) + Content + RightRail (300px) pattern.
- Suggestion cards use a 3-column grid on ≥1024px, 2-column on 768–1023px, single-column on mobile.
- Each suggestion card has a cover strip, centered avatar, name, role, location, market status badge, and [Connect] button.
- Invitations show mutual connection count, optional message preview, relative timestamp.
- The RightRail shows "Manage Network" (Connections / Following / Followers counts) + "Pending" count.

---

## Layout Summary Grid

| Element          | Mobile            | Desktop (≥1024px)       |
|------------------|-------------------|--------------------------|
| Container        | 100vw             | max-width: 1280px, centered |
| Navigation       | BottomNav (5 tab) | Sidebar (240px, sticky)  |
| Top Bar          | Fixed, 48px       | None (sidebar replaces)  |
| Feed Width       | 100vw             | flex-grow (~680px @1280) |
| Right Rail       | Hidden            | 300px, sticky            |
| Create Post      | Full page sheet   | Modal (560px centered)   |
| Search Results   | Full page, stacked| 2-column: Users + Posts  |
| Profile About    | Tab under header  | Left column (280px sticky)|
| Network Layout   | Stacked sections  | Center feed + Right overview|
| Network Overview | Bottom card       | RightRail, 300px sticky  |
| Suggestion Cards | 1-col, full width | 3-col grid               |
| Post Images      | 2-column grid     | 3-column grid            |
| FAB (Create)     | Bottom center     | In sidebar               |
| Infinite Scroll  | Yes               | Yes                      |

### Breakpoints

| Breakpoint | Behavior |
|------------|----------|
| ≥ 1280px   | Container capped at 1280px; equal gutters on both sides |
| 1024–1279px| RightRail narrows to 260px; Feed/columns shrink proportionally |
| < 1024px   | RightRail hidden; Sidebar collapses to BottomNav; full-width content |
