# Post Report — Future Plan (Admin Panel)

This document outlines the enhanced post reporting system to be built when an admin panel is available.

## Current Implementation (V1)

- Simple report via three-dot menu on post card
- Free-text reason (optional)
- Auto-hide post at 5 reports (`is_active = false`)
- One report per user per post (UNIQUE constraint)
- Reporter can undo their report

---

## V2: Enhanced Report System

### Database Changes

#### Predefined Report Reasons

Add a `report_reasons` reference table:

```sql
CREATE TABLE report_reasons (
  id          smallint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  key         text    NOT NULL UNIQUE,  -- 'not_rice_related', 'spam', 'inappropriate', 'misleading', 'other'
  label       jsonb   NOT NULL,         -- {"en": "Not rice-related", "my": "စပါးနှင့်မသက်ဆိုင်ပါ"}
  sort_order  smallint NOT NULL DEFAULT 0
);
```

Seed data:

| id | key | label | sort_order |
|---|---|---|---|
| 1 | `not_rice_related` | `{"en": "Not rice-related", "my": "စပါးနှင့်မသက်ဆိုင်ပါ"}` | 1 |
| 2 | `spam` | `{"en": "Spam or scam", "my": " Spam သို့မဟုတ် လိမ်လည်မှု"}` | 2 |
| 3 | `inappropriate` | `{"en": "Inappropriate content", "my": "မသင့်လျော်သော ပါဝင်မှု"}` | 3 |
| 4 | `misleading` | `{"en": "Misleading information", "my": "လွဲမှားသော အချက်အလက်"}` | 4 |
| 5 | `duplicate` | `{"en": "Duplicate post", "my": "ထပ်နေသော ပို့စ်"}` | 5 |

Update `post_reports` table:

```sql
ALTER TABLE post_reports
  ADD COLUMN reason_id smallint REFERENCES report_reasons(id),
  ALTER COLUMN reason TYPE text;  -- keep free-text for "other" or additional details
```

#### Report Status Tracking

Add status to `post_reports` for admin workflow:

```sql
ALTER TABLE post_reports
  ADD COLUMN status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'reviewed', 'dismissed'));
```

---

### Admin Panel Features

#### 1. Reports Dashboard

Route: `/admin/reports`

- List all pending reports grouped by post
- Show post content preview, author info, report count
- Filter by: status (pending/reviewed/dismissed), reason type, date range
- Sort by: report count, most recent, oldest

#### 2. Report Detail View

- Full post content with author profile
- List of all reporters (anonymized: "User A", "User B")
- Report reasons breakdown (pie chart)
- Action buttons: Dismiss, Hide Post, Delete Post, Warn Author, Ban Author

#### 3. Moderation Actions

| Action | Effect |
|---|---|
| **Dismiss Report** | Set report status to `dismissed`. Post remains visible. |
| **Hide Post** | Set `is_active = false`. Post hidden from feed. |
| **Delete Post** | Hard delete post + images + reports. |
| **Warn Author** | Create notification to author. Log warning. |
| **Ban Author** | Soft-delete profile (`deleted_at = now()`). All posts hidden. |

#### 4. Report Statistics

- Reports per day/week/month chart
- Most reported post types
- Most common reasons
- Users with most reports received
- Users with most reports filed

---

### Enhanced Server Actions

#### `getReports()` — Admin only

```typescript
export async function getReports(filters?: {
  status?: 'pending' | 'reviewed' | 'dismissed';
  reason_id?: number;
  date_from?: string;
  date_to?: string;
}): Promise<{ reports: ReportGroup[]; total: number }>
```

Returns reports grouped by post with count and reason breakdown.

#### `reviewReport(reportId, action)` — Admin only

```typescript
export async function reviewReport(
  reportId: string,
  action: 'dismiss' | 'hide' | 'delete' | 'warn' | 'ban'
): Promise<ActionResult>
```

#### `getReportStats()` — Admin only

```typescript
export async function getReportStats(): Promise<{
  totalPending: number;
  totalReviewed: number;
  reportsByReason: { reason: string; count: number }[];
  reportsByDay: { date: string; count: number }[];
}>
```

---

### UI Components

#### Report Dialog (Enhanced)

Instead of free-text, show radio options:

```
Why are you reporting this post?

○ Not rice-related
○ Spam or scam
○ Inappropriate content
○ Misleading information
○ Duplicate post
○ Other: [text input]
```

#### Admin Report Card

```
┌─────────────────────────────────────────┐
│ ⚠️ 3 reports                            │
│                                         │
│ Post by: U Kyaw Min                      │
│ Type: Selling                            │
│ Content: "Special grade A rice..."       │
│                                         │
│ Reasons:                                │
│   • Not rice-related (2)                │
│   • Spam (1)                            │
│                                         │
│ [Dismiss] [Hide Post] [Delete] [Warn]   │
└─────────────────────────────────────────┘
```

---

### RLS Policies (Admin)

```sql
-- Admin-only policies (requires admin role check)
CREATE POLICY "Admins can view all reports"
  ON post_reports FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update reports"
  ON post_reports FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
```

**Note:** The `admin` role needs to be added to the `profiles_role_check` constraint:
```sql
ALTER TABLE profiles
  DROP CONSTRAINT profiles_role_check,
  ADD CONSTRAINT profiles_role_check
    CHECK (role IN ('farmer', 'trader', 'agent', 'general_user', 'admin'));
```

---

### Notification System Integration

When a post is hidden or author is warned:

1. Create row in `notifications` table (to be built)
2. Send push notification (if subscribed)
3. Show in-app notification badge

---

### Implementation Priority

| Phase | Feature | Effort |
|---|---|---|
| **Phase 1** (Current) | Simple report + auto-hide | Done |
| **Phase 2** | Predefined reasons + report status | Small |
| **Phase 3** | Admin dashboard + moderation actions | Medium |
| **Phase 4** | Statistics + analytics | Small |
| **Phase 5** | Notification integration | Medium |

---

### Open Questions

1. **Admin role**: Should we use a separate `is_admin` column on profiles, or a new role value?
2. **Appeal process**: Should authors be able to appeal hidden posts?
3. **Auto-hide threshold**: Should it vary by post type (e.g., 3 for general, 5 for trading)?
4. **Rate limiting**: Should we limit reports per user per day to prevent abuse?
5. **IP tracking**: Should we store reporter IP for abuse prevention?
