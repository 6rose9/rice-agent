# Security Audit Findings (2026-07-24)

**Project**: Rice Agent (စပါးအောင်သွယ်)
**Audit performed by**: `security-auditor` agent
**Files reviewed**: 40+ source files across `src/`, `supabase/migrations/`, and config

---

## 🔴 Critical (P0 — Fix Immediately)

### C-01: In-Memory OTP Store With No Rate Limiting
- **File**: `src/lib/auth/actions.ts` lines 73-114
- **Issue**: `Map<string,{code,expiresAt}>` — breaks under serverless scaling, no rate limiting, OTP returned to client in `alert()`
- **Fix**: DB-backed OTP table, rate limits (max 3/phone/hour), never return OTP code

---

## 🟠 High (P1 — Next Sprint)

### H-01: Client-Side Only Subscription Gate
- **Files**: `src/lib/subscription.ts`, `src/app/(main)/pricing/page.tsx`
- **Issue**: `localStorage.setItem("subscription_tier","pro")` — any user can unlock premium via dev console
- **Fix**: Remove client-side system, implement proper payment or admin flow

### H-02: Password Reset Skips Server-Side OTP
- **File**: `src/lib/auth/actions.ts` (resetPassword), `src/app/(auth)/forgot-password/page.tsx`
- **Issue**: `resetPassword(phone, newPassword)` — no server-side OTP verification token
- **Fix**: Generate server-side OTP token on successful verification, validate in resetPassword

### H-03: No Rate Limiting on Auth Endpoints
- **Files**: All server actions in `src/lib/*/actions.ts`
- **Issue**: 1000+ login/OTP/report attempts per second possible
- **Fix**: DB-backed rate limits (5 login attempts/phone/15min, 3 OTP/phone/hour, etc.)

### H-04: Weak Image URL Validation
- **File**: `src/lib/posts/actions.ts` lines 281-286, 570-575
- **Issue**: Only checks URL prefix, can reference others' uploads; updatePost has race condition on delete+re-insert
- **Fix**: Validate ownership of image path, use signed URLs, wrap in transaction

### H-05: Search ILIKE Injection Risk
- **File**: `src/hooks/use-search.ts` lines 44-100
- **Issue**: Raw user input in Supabase `.or()` ILIKE patterns — `%` and `_` chars can manipulate matching
- **Fix**: Escape SQL pattern chars, consider full-text search (tsvector)

### H-06: Missing Content Security Policy (CSP)
- **File**: `next.config.ts`
- **Issue**: No CSP header, no HSTS. Missing: X-Frame-Options, COEP, COOP
- **Fix**: Add CSP header and `Strict-Transport-Security`

### H-07: Open Redirect
- **File**: `src/lib/actions.ts` lines 43-47
- **Issue**: `sanitizeRedirect()` blocks `//evil.com` but no whitelist of allowed paths
- **Fix**: Add allowed path whitelist or parse as URL and verify empty hostname

---

## 🟡 Medium (P2)

| ID | Finding | Key File |
|---|---|---|
| M-01 | No audit logging for security-sensitive ops | All `actions.ts` |
| M-02 | No cookie hardening (SameSite, Secure, HttpOnly) | `src/proxy.ts` |
| M-03 | Password reset bypasses Zod validation server-side | `src/lib/auth/actions.ts` |
| M-04 | No file type/size validation on image uploads | `create-post-form.tsx` |
| M-05 | Public storage buckets w/o signed URLs | Migration files |
| M-06 | Logging sensitive info in error handlers | Various `actions.ts` |
| M-07 | Middleware runs Supabase auth on ALL routes | `src/proxy.ts` |
| M-08 | Connection request re-send with no cooldown | `src/lib/network/actions.ts` |
| M-09 | Comments visible to all authenticated users | `src/lib/comments/actions.ts` |
| M-10 | Forgot-password step-skipping via React state | `forgot-password/page.tsx` |
| M-11 | Soft deletion leaves auth account active | Migration `auth_schema.sql` |

## 🔵 Low (P3)

| ID | Finding |
|---|---|
| L-01 | Missing `updated_at` trigger on `connection_requests` table |
| L-02 | Seed data contains hardcoded auth users |
| L-03 | Profile data fetch exposes all columns (phone, email, subscription_tier) |
| L-04 | `UnknownUser` fallback contains empty-string phone |
| L-05 | No HSTS header (HTTPS not enforced) |
| L-06 | Registration race condition on profile creation |
| L-07 | Comments return "Unknown User" for soft-deleted authors |
| L-08 | Storage path uses original filename (path traversal risk) |

---

**Full audit report**: See conversation with security-auditor agent on 2026-07-24.
