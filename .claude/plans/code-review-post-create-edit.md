# Code Review & Refactor: Post Create/Edit

## Code Review Findings

### 🔴 Critical Bugs

1. **RICE_TYPES mismatch** — `create-post-form.tsx` uses full names with Burmese
   (`"Soft rice (ဆန်ပျော့)"`, etc.) while `edit-post-modal.tsx` uses short names
   (`["soft rice", "hard rice", "Other"]`). Editing a post created with a different
   set of values breaks the select field — the selected value won't match any option.

2. **paddy_condition type/data inconsistency** — Three conflicting representations:
   - Validation schema: `z.coerce.number().min(10).max(16)` (moisture %)
   - Create form: range slider 10–16 (correct per schema)
   - Edit modal: Select with `"dry"` / `"wet"` string options (wrong)
   - Post type: `"dry" | "wet" | null` (wrong)
   - Mock data: `"dry"` / `"wet"` strings
   - When editing, `z.coerce.number()` on `"dry"` → `NaN` → validation fails

3. **updatePost doesn't set `badge` field** — `createPost` sets `payload.badge = "pro"`
   for trading posts, but `updatePost` does not. Race condition: if a post type changes
   from buying/selling → general, the badge won't be cleared.

### 🟡 Duplicated Code (extract to shared)

| What | Create | Edit |
|------|--------|------|
| RICE_TYPES | `["Soft rice (ဆန်ပျော့)", ...]` | `["soft rice", "hard rice", "Other"]` |
| MEASURING/UNITS | `MEASURING` var name | `UNITS` var name |
| Range constants | PRICE/QTY/POUND min/max/step | Same values duplicated |
| `formatLakh()` | lines 64-66 | lines 67-69 |
| Image upload | Upload loop logic | Slightly different (auth user ID retrieval) |
| LocationPicker import | `dynamic(() => import(...), { ssr: false })` | Same |
| Trading fields JSX | Full fields markup (~90 lines) | ~85% same, minor label/copy differences |
| FormData build | `formData.append()` | `formData.set()` (inconsistent) |

### 🟢 Minor Issues

1. **Edit uses `any` type**: `useForm<any>(...)` instead of `useForm<PostInput>(...)`
2. **FormData methods inconsistent**: create uses `append`, edit uses `set`
3. **Image preview sizes differ**: `w-20 h-20` (create) vs `w-16 h-16` (edit)
4. **Edit submit button missing `disabled` state** — create disables when content
   is empty, edit doesn't.
5. **Edit missing premium upsell banner** for non-subscribers
6. **Create doesn't fetch `auth.getUser()` before upload** — relies on
   `user?.user.id` from provider; edit fetches explicitly. One pattern is safer.

---

## Plan: Shared Component Extraction

### New File: `src/components/post/post-form-constants.ts`

Shared constants to replace duplicates:
- `RICE_TYPES` (use full names from create form)
- `MEASURING` (name unified from `MEASURING`/`UNITS`)
- `PRICE_MIN`, `PRICE_MAX`, `PRICE_STEP`
- `QTY_MIN`, `QTY_MAX`, `QTY_STEP`
- `POUND_MIN`, `POUND_MAX`
- `formatLakh()` helper

### New File: `src/components/post/trading-form-fields.tsx`

Shared component for the buying/selling extra fields section. Props:
- `postType: "buying" | "selling"`
- All react-hook-form methods (`register`, `watch`, `setValue`, `errors`)
- `errors` typed properly via PostInput discrimination
- Includes: rice type select, rice name input, price slider, quantity slider,
  region/township selects, pound_per_bag slider, paddy_condition slider,
  address input, LocationPicker, easy_to_carry switch
- Consistent labels and UX between create and edit

### Modify: `create-post-form.tsx`

- Import constants from `post-form-constants.ts`
- Import `TradingFormFields` from `trading-form-fields.tsx`
- Remove duplicated constants, `formatLakh`, trading fields JSX
- Keep: header (avatar + badge), type selector, premium upsell, content textarea,
  image upload section, footer

### Modify: `edit-post-modal.tsx`

- Import constants from `post-form-constants.ts`
- Import `TradingFormFields` from `trading-form-fields.tsx`
- Fix: use `useForm<PostInput>` instead of `useForm<any>`
- Remove duplicated code
- Keep: dialog shell, content textarea, image upload, footer

### Bug Fixes (done alongside refactor)

1. **Fix RICE_TYPES**: use unified list from constants
2. **Fix paddy_condition**: use range slider in edit (match create + schema)
3. **Fix `badge` in updatePost** (`src/lib/posts/actions.ts`):
   - Set `payload.badge = "pro"` for trading posts, `payload.badge = "free"` for general
4. **Fix FormData methods**: use `formData.append` consistently
5. **Fix image sizes**: use `w-20 h-20` consistently
6. **Add disabled state** to edit submit button when content is empty

### Files to touch

| File | Action |
|------|--------|
| `src/components/post/post-form-constants.ts` | **NEW** — shared constants |
| `src/components/post/trading-form-fields.tsx` | **NEW** — shared trading fields |
| `src/components/post/create-post-form.tsx` | Edit — use shared components |
| `src/components/post/edit-post-modal.tsx` | Edit — use shared components, fix bugs |
| `src/lib/posts/actions.ts` | Edit — fix `badge` field in `updatePost` |
| `src/types/index.ts` | Edit — fix `paddy_condition` type to `number | null` |
| `src/lib/validations/post.ts` | No changes (already correct with number coerce) |

### What stays unchanged

- `actions.ts` createPost / updatePost server functions (structure is fine, just badge fix)
- `location-picker.tsx` (no duplication — both already use `dynamic(() => import(...))`)
- `mock-data.ts` (only needs paddy_condition values updated to match fix)
