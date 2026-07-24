# UI/UX Pro Max — Full Audit Report

**Project:** စပါးအောင်သွယ် (Rice Agent)  
**Date:** 2026-07-24  
**Files Reviewed:** 27 pages & components  
**Design System Recommendation:** Organic Biophilic (greens, rounded corners, natural feel)

---

## 🔴 CRITICAL

### 1. Emoji-as-Icon Anti-Pattern — 44 occurrences across 10 files

Emojis render differently per OS, can't be themed, fail for screen readers, and look unprofessional compared to SVGs. Lucide icons are already used elsewhere — this is inconsistent.

**Key offenders:**

| File | Count | Examples |
|------|-------|----------|
| `src/components/post/trading-form-fields.tsx` | 12 | `🌾`, `📝`, `💰`, `📍`, `☀️`, `🏠`, `🚚`, `📦`, `⚖️`, `🏘️`, `📋` |
| `src/components/feed/post-card.tsx` | 7 | Badges: `📝 General`, `🛒 Selling`, `💰 Buying` + inline `🏠`, `☀️`, `🚚`, `📍` |
| `src/components/post/create-post-form.tsx` | 7 | Type selectors `📝`/`🛒`/`💰` + `📷` photo label |
| `src/app/(main)/about/page.tsx` | 7 | Role cards: `👨‍🌾`, `🤝`, `🏭` + badges |
| `src/lib/constants.ts` | 7 | `ROLE_LABELS` + `POST_TYPE_LABELS` |
| `src/app/(main)/search/page.tsx` | 3 | Quick filters: `🧑‍🌾`, `🏭`, `🤝` |
| `src/components/post/edit-post-form.tsx` | 4 | Same pattern as create-post-form |
| `src/components/layout/right-rail.tsx` | 1 | `🏷️` in Quick Stats |
| `src/components/post/location-picker.tsx` | 1 | `📍` in pin status |
| `src/lib/posts/actions.ts` | 1 | `🌾` / `📍` in trending topics |

**Fix:** Replace with Lucide icons already in the project:

| Emoji | Lucide Icon | Notes |
|-------|-------------|-------|
| `🧑‍🌾` | `Sprout` | |
| `🏭` | `Factory` | |
| `🤝` | `Handshake` | Already imported in post-actions.tsx |
| `📝` | `FileText` or `Edit3` | |
| `🛒` | `ShoppingCart` | |
| `💰` | `Banknote` | Already used elsewhere |
| `🌾` | `Wheat` | Already used in post-card.tsx! |
| `🏠` | `Home` or `MapPin` | |
| `☀️` | `Sun` or `Droplets` | |
| `🚚` | `Truck` | |
| `📍` | `MapPin` | Already used elsewhere |
| `📷` | `ImagePlus` | Already used in create-post-form.tsx |
| `🏷️` | `Tag` or `Award` | |
| `📦` | `Package` | Already used elsewhere |
| `📋` | `ClipboardList` | |
| `🏘️` | `Building2` | |
| `⚖️` | `Scale` | |
| `👨‍🌾` | `Sprout` | |
| `🏪` | `Store` | |
| `📊` | `BarChart3` | |

**Quickest win:** Fix `POST_TYPE_LABELS` and `ROLE_LABELS` in `src/lib/constants.ts` — all consumers inherit the fix.

---

### 2. Missing `aria-label` on Icon-Only Interactive Elements

| Location | Issue |
|----------|-------|
| `src/app/(main)/search/page.tsx:106` | `X` clear button has no `aria-label` — screen readers can't identify it |
| `src/components/feed/post-card.tsx:172-194` | `role="button"` "See more/less" spans lack `aria-expanded` state |
| `src/app/(main)/settings/page.tsx:229` | Sign Out `<button>` has no `aria-label` differentiating it |

### 3. Keyboard Navigation Gaps

| Location | Issue |
|----------|-------|
| `src/app/(main)/profile/[username]/page.tsx` | Duplicate mobile + desktop tab instances could confuse focus management |
| `src/components/feed/post-card.tsx:172-194` | CSS gradient overlay may intercept clicks at small widths |

---

## 🟠 HIGH

### 4. Touch Targets Below 44px Minimum (WCAG)

| Element | File:Line | Current | WCAG Min |
|---------|-----------|---------|----------|
| Feed filter pills | `feed-filter.tsx:34` — `h-8` | 32px | 44px ❌ |
| Search clear X button | `search/page.tsx:106-112` | ~16px | 44px ❌ |
| Bottom nav | `bottom-nav.tsx` — `h-14` | 56px | 44px ✅ |

### 5. Content Layout Shift (CLS)

| Location | Issue |
|----------|-------|
| `src/components/feed/post-card.tsx:217-224` | Post images use `<img>` without explicit `width`/`height` — `aspect-[4/3]` helps but Next.js `<Image>` would eliminate CLS |
| `src/app/(main)/profile/[username]/page.tsx:477-498` | Cover uses inline `backgroundImage` — gradient → image swap causes visual jump |

### 6. `prefers-reduced-motion` Not Respected

- No `motion-safe:` / `motion-reduce:` Tailwind variants used anywhere in the project
- `post-actions.tsx:123` — `hover:scale-110` on like button has no reduced-motion fallback
- All `transition-colors duration-200` instances lack reduced-motion fallback

### 7. Missing `cursor-pointer` on Interactive Elements

| Location | Issue |
|----------|-------|
| `src/app/(main)/profile/[username]/page.tsx:413` | "View All Connections" — has `hover:bg-accent` but no `cursor-pointer` |
| `src/app/(main)/profile/[username]/page.tsx:420` | "Pending Invitations" — same issue |

---

## 🟡 MEDIUM

### 8. Inconsistent Icon Strategy (3 Approaches Mixed)

| Approach | Usage | Verdict |
|----------|-------|---------|
| Lucide SVGs | Sidebar, post-actions, profile, settings, feed | ✅ Correct |
| Emoji characters | 44 occurrences across 10 files (see #1) | ❌ Replace |
| Raw `<img>` tag | `post-card.tsx:270` — `bag.jpeg` | ❌ Use Next.js `<Image>` |

### 9. Readability: Font Sizes Below Minimum

| Element | File | Current Size | Issue |
|---------|------|-------------|-------|
| Post badges | `post-card.tsx` | `text-[10px]` (~10px) | Below 16px readable minimum |
| Bottom nav labels | `bottom-nav.tsx:47` | `text-[10px]` (~10px) | Below readable threshold |
| Premium PRO badge | `create-post-form.tsx:252,273` | `text-[8px]` (~8px) | Extremely small |

### 10. Line Length Unconstrained

Feed content inside `max-w-[1280px]` layout has no `max-w-prose` or `max-w-[65ch]` constraint — long content can exceed 75 characters/line, hurting readability.

**Fix:** Add `max-w-prose` or `max-w-[65ch]` to post content containers.

### 11. Post Type Labels Use Emojis

`src/lib/constants.ts:17-19` — `POST_TYPE_LABELS` are consumed everywhere. Fixing them there fixes all consumers at once.

---

## 🔵 INFO

### 12. Good Empty/Error State Coverage ✅

All pages checked have proper idle, loading, empty, and error states:
- Feed (`SkeletonCard`, `ErrorCard`, `EmptyCard`)
- Profile (skeleton layout matching page structure, error, not-found)
- Search (idle with recent searches, loading, results, empty)
- Messages ("Subscription Required" state)
- Settings (sign-in gate, loading spinner)
- Pricing (sign-in gate, success/error banners)

### 13. "Following" Filter is Non-Functional

`src/app/(main)/feed/page.tsx:72` — The "Following" filter always returns empty with `// not implemented yet`. Consider hiding or disabling it with a tooltip until the feature is built.

### 14. Good Loading States with Skeletons ✅

Profile and feed pages use skeleton loaders matching the layout structure — professional approach.

### 15. Glass/Blur Effects Already Present ✅

`top-bar.tsx:11` and `bottom-nav.tsx:20` use `backdrop-blur supports-[backdrop-filter]:bg-background/60` — modern, on-brand.

### 16. Submit/Confirm Button Patterns

✅ All buttons use `disabled={isSubmitting}` + spinner pattern. However:
- **Delete Post** dialog (`post-card.tsx:328-338`): Shows "Deleting..." but dialog close isn't disabled
- **Report Post** (`post-card.tsx:410-428`): Shows "Thank you" text but no visual confirmation action was taken

---

## Summary

| Priority | Count | Fix Effort |
|----------|-------|------------|
| 🔴 Emoji icons | 44 in 10 files | ~30 min (search & replace) |
| 🔴 aria-labels | 3 locations | ~10 min |
| 🟠 Touch targets | 2 patterns | ~15 min |
| 🟠 reduced-motion | Global | ~10 min |
| 🟡 Icon consistency | 1 file (constants) | ~5 min |
| 🟡 Font sizes | 3 tunings | ~10 min |

### Recommended Fix Order

1. **Fix `src/lib/constants.ts`** — Replace emojis in `ROLE_LABELS` and `POST_TYPE_LABELS` → fixes all consumers automatically
2. **Fix `src/components/feed/post-card.tsx`** — Replace emoji badges + inline emojis (7 locations, most visible)
3. **Fix `src/components/post/trading-form-fields.tsx`** — Replace emoji labels (12 locations)
4. **Fix `src/components/post/create-post-form.tsx`** — Replace emoji buttons/labels (7 locations)
5. **Fix `src/app/(main)/search/page.tsx`** — Replace emoji filter buttons (3 locations)
6. **Fix remaining files** — `edit-post-form.tsx`, `about/page.tsx`, `right-rail.tsx`, `location-picker.tsx`
7. **Add `aria-label`** — Search clear button, post-card expand/collapse
8. **Fix touch targets** — Feed filter pills to `h-10`/`h-11`, search clear button to larger click area
9. **Add `prefers-reduced-motion`** — Wrap animations in `motion-safe:` variant
10. **Add `cursor-pointer`** — Profile page network panel links
