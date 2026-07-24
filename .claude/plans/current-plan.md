# Design Plan: စပါးအောင်သွယ် UI Polish

## Grounding

**Subject:** Myanmar rice industry networking + marketplace platform (farmers, traders, agents).  
**Single job of the page:** Help rice professionals discover opportunities and connect — every page serves either identity (profile), discovery (feed/search), or connection (network/messages).  
**Audience:** Rural-to-urban Myanmar professionals. Many on mobile. Bilingual (Myanmar + English). Value trust and personal reputation highly.

## Design Vision

Not another generic green startup — draw from the **rice paddy itself**: the deep green of young shoots (`primary`), the amber-gold of ripe harvest (`accent`), the off-white of rice paper (`background`). Warm, earthy, professional. Think "LinkedIn for agriculture" — but warmer, less corporate.

The **signature element**: use the existing RiceSeedIcon (a clustered grain vector) as an accent mark — in empty states, as a loading indicator, beside market prices. It's specific to this domain and no other platform would use it.

## Token System

### Color (refined, not rebuilt)

| Token | Current | New | Why |
|---|---|---|---|
| `--background` | `oklch(0.98 0.01 110)` | `oklch(0.985 0.005 90)` | Warmer (less green cast) like rice paper |
| `--primary` | `oklch(0.55 0.14 145)` | `oklch(0.5 0.15 150)` | Deeper, more natural leaf green |
| `--accent` | `oklch(0.92 0.06 110)` | — | Keep, it's a good paddy young-green |
| `--muted` | `oklch(0.96 0.01 100)` | `oklch(0.96 0.01 85)` | Slightly warmer gray |
| `--muted-foreground` | `oklch(0.55 0.02 100)` | — | Keep (reads fine) |
| `--border` | `oklch(0.9 0.02 105)` | — | Keep |
| No gold/amber token | — | `--color-gold: oklch(0.65 0.12 85)` | Paddy gold — used for premium/trading badges |

### Typography

Geist Sans is already loaded. Rather than add another font, make the *treatment* distinctive:

- **Headings:** `font-semibold tracking-tight` — tighter letter-spacing, more presence
- **Body:** Keep `text-sm` but set `leading-relaxed` consistently (Myanmar text needs generous line height)
- **Data/numbers (prices, stats):** Use Geist Mono via `font-mono` with `tabular-nums` so prices align in lists
- **Labels/captions:** `text-xs text-muted-foreground` with consistent capitalization (sentence case)

### Layout conventions (standardized)

- **Page headings:** `flex items-center gap-2 px-4 py-3 border-b text-base font-semibold`
- **Card content:** `p-4` everywhere (was mixing `p-4`, `px-4 py-3`, etc.)
- **Section spacing:** `gap-4` between sections, `space-y-3` within card bodies
- **Sidebar width:** Keep 240px (consistent with current)
- **Right rail:** Keep 260px/300px responsive

## Changes by Page

### 1. Globals & Tokens (`globals.css`)
- Adjust `--background`, `--primary` oklch values (per table above)
- Add `--color-gold` custom property
- Ensure dark mode values feel intentional, not just inverted

### 2. Feed (`feed/page.tsx`, `post-card.tsx`, `feed-filter.tsx`)
- **Spacing:** Tighten post card padding from `p-4` to `px-3 py-3` on mobile, keep `p-4` on desktop
- **Filter bar:** Fix sticky positioning so it doesn't overlap with top-bar on mobile (add `top-12` offset when mobile)
- **Text:** Post content stays `text-sm` but use `leading-relaxed` for Myanmar text readability
- **Trading meta chips:** Slightly rounded (`rounded-md` → `rounded-lg`), use `tabler-nums` for prices
- **Loading more:** Better loading state (show skeleton cards instead of just spinner on button)

### 3. Profile (`[username]/page.tsx`)
- **Cover gradient:** Change from `from-emerald-200 to-green-100` to `from-emerald-300/70 to-green-200/50` — softer, more natural
- **Avatar:** Fix the avatar sizing — `h-20 w-20 sm:h-28 sm:w-28` is good but the ring should use `ring-3 ring-background` for less visual weight
- **Stats row:** On mobile, use `gap-4` instead of `gap-6` so it doesn't overflow
- **Tabs:** The duplicate mobile/desktop tabs structure should be DRY'd up
- **Skeleton:** Already excellent — keep as-is

### 4. Search (`search/page.tsx`)
- **Mobile empty state:** Better iconography (use RiceSeedIcon for "no results" instead of User icon)
- **Filter pills:** Match feed filter styling (rounded-full, same height)
- **Desktop results:** Better visual separation between user and post columns
- **Spacing:** Consistent 4px-grid padding throughout

### 5. Auth Pages (`login/page.tsx`, `register/page.tsx`)
- **Card:** Increase to `max-w-[420px]` (currently 400/480) for better breathing room on desktop
- **Spacing:** More vertical space between form fields (`space-y-5` instead of `space-y-4`)
- **OTP section:** Better visual grouping with the verification card

### 6. Settings & Saved
- **Settings:** The `max-w-[780px]` constraint is good but inconsistent — standardize to match feed width
- **Saved:** Already clean — empty state icon could use the rice seed for character

### 7. Error / Empty / NotFound States
- **404 pages:** Both main and not-found — add RiceSeedIcon alongside the FileQuestion icon for a touch of personality
- **Error boundaries:** Already good — add a subtle animation on the icon pulse
- **SignInGate:** Consistent across pages — good. Add the RiceSeedIcon in the sentry circle.

### 8. Sidebar & Bottom Nav
- **Sidebar:** Add subtle `hover:bg-accent/50` on nav items (already via Button variant)
- **Active state:** More prominent — use `bg-primary/10 text-primary` style (ghost + active tint) rather than secondary button variant
- **Bottom nav:** On active tab, use a subtle dot indicator below the icon instead of just color change

### 9. Network Page (`mynetwork/page.tsx`)
- **Suggestion cards:** Reduce visual weight — `border` → `border border-border/70`, tighter `p-3` on mobile
- **Mobile tabs:** Consistent styling with rest of app

## Self-Critique

Before writing code, I reviewed the above against what a generic AI design would produce:

- The warm-cream/terracotta default is avoided entirely — the palette is built from rice-field greens and paddy gold, not generic warm tones
- The green isn't the "default green" — it's specifically `oklch(0.5 0.15 150)` which has a distinct yellow undertone (rice leaf), not a neutral or blue-green
- No numbered markers (01/02/03)
- The RiceSeedIcon as a motif is genuinely specific to this domain
- The type choices (Geist Sans with tight tracking, Geist Mono for prices) don't add new fonts but make the existing setup feel more intentional

**One aesthetic risk:** Adding the gold/amber accent (`--color-gold`) as a second brand color for trading features. Green + gold can feel sporty or gaudy if overused. The constraint: gold appears only on buying/selling post badges, pricing cards, and the crown icon — never as a background or text color. This keeps it a signal color, not a brand color.

## File Change List

1. `src/app/globals.css` — Token refinement, add gold, better dark values, tabular-nums on data
2. `src/app/(main)/feed/page.tsx` — Fix filter sticky offset, improve load-more state
3. `src/components/feed/feed-filter.tsx` — Mobile sticky offset fix
4. `src/components/feed/post-card.tsx` — Tighter mobile spacing, tabular-nums on prices, gold badge for trading
5. `src/components/feed/empty-card.tsx` — Use RiceSeedIcon
6. `src/components/feed/skeleton-card.tsx` — Refine skeleton proportions
7. `src/app/(main)/profile/[username]/page.tsx` — Cover gradient, stats spacing, DRY tabs
8. `src/app/(main)/search/page.tsx` — Consistent spacing, RiceSeedIcon in empty states
9. `src/components/layout/sidebar.tsx` — Active state refinement, gold icon for pricing
10. `src/components/layout/bottom-nav.tsx` — Active dot indicator
11. `src/components/layout/right-rail.tsx` — Tighter spacing, gold accent on trading suggestions
12. `src/app/(auth)/login/page.tsx` — Card spacing refinement
13. `src/app/(auth)/register/page.tsx` — Card spacing refinement, OTP section styling
14. `src/app/not-found.tsx` — Add RiceSeedIcon
15. `src/app/(main)/not-found.tsx` — Add RiceSeedIcon
16. `src/app/(main)/error.tsx` — Subtle animation
17. `src/app/(main)/network/page.tsx` — Tighter mobile cards
18. `src/app/(main)/settings/page.tsx` — Standardize width
19. `src/app/(main)/saved/page.tsx` — RiceSeedIcon in empty state
