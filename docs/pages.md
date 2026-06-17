# Pages & Layout — စပါးအောင်သွယ်

Reference: LinkedIn-style SaaS feed system

---

## 1. App Layout

### Mobile
- BottomNav fixed (5 tabs)
- TopBar fixed
- Full-width feed

### Desktop
- Sidebar (240px left)
- Main content (640px feed)
- RightRail (300px sticky)

---

## 2. Feed Page

Structure:
- FeedFilter (All / Buying / Selling / Following)
- PostCard list (infinite scroll)

States:
- loading → skeleton cards
- empty → empty state card
- error → retry UI

---

## 3. Profile Page

Sections:
- ProfileHeader (cover + avatar + stats)
- ProfileTabs:
  - Posts (default)
  - About
  - Network

Layout:
- Mobile: single column
- Desktop: 2-column about layout

---

## 4. Create Post

Type:
- modal (desktop)
- full page (mobile)

Sections:
- user identity row
- post type toggle (Selling / Buying)
- textarea editor
- image upload (max 4)
- optional details:
  - location
  - rice type
  - price
  - quantity

---

## 5. Search Page

- search input
- filters (role, location, status)
- results list (users + posts)

---

## 6. Navigation Rules

### Mobile
- BottomNav primary navigation
- Create button = FAB

### Desktop
- Sidebar navigation replaces top bar
- RightRail for suggestions

---

## 7. UX Rules

- Mobile-first always
- Feed is default landing page
- Post interaction optimized for thumb usage
- Minimal clicks to create post