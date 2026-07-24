# Rice Agent — Senior Architecture Review

**Project**: Rice Agent (စပါးအောင်သွယ်)  
**Date**: 2026-07-24  
**Reviewer**: Senior Architect (AI-assisted)  
**Scope**: Full-stack architecture, data flow, component design, security, performance

---

## Executive Summary

Rice Agent is a Next.js 16 App Router application using Supabase as its BaaS (Auth, PostgreSQL, Storage). It implements a LinkedIn-for-rice-industry concept with social features (follow, connect, posts, comments) and marketplace listings (buying/selling posts). The architecture is well-structured overall — clean separation of server actions, validation, and client components. This review identifies 13 findings: 3 high-severity, 4 medium-severity, and 6 low-severity.

---

## Architecture Scorecard

| Dimension | Rating | Notes |
|-----------|--------|-------|
| **Route Structure** | 🟢 Strong | Logical route groups, proper nesting, consistent patterns |
| **Component Architecture** | 🟢 Strong | Good shadcn usage, domain-organized components, separation of concerns |
| **Data Flow** | 🟡 Fair | Server actions pattern is good, but authentication mix of client/server is inconsistent |
| **Type Safety** | 🟢 Strong | Generated DB types + app-level extensions + Zod schemas cover the full stack |
| **Security** | 🟡 Fair | Row-Level Security not fully leveraged — most auth is application-level |
| **State Management** | 🟡 Fair | Relies on local state + Context; no server state caching (React Query/TanStack) |
| **Error Handling** | 🟢 Good | All 4 states (loading/error/empty/success) across pages |
| **Performance** | 🟡 Fair | No caching strategy, no ISR/SSG, client-side data fetching for all pages |
| **Testing** | 🔴 Missing | No test files found |
| **Mobile UX** | 🟢 Strong | Responsive layout with dedicated mobile nav, bottom tabs, top bar |

---

## 🔴 High Severity Findings

### H1. No Row-Level Security (RLS) on Database Tables

**Location**: All `supabase/migrations/*.sql` files  
**Severity**: High  
**Category**: security  

**Observation**: All database tables lack RLS policies. The direct Supabase client queries in client components (`createClient()` from `@/lib/supabase/client.ts`) have full service-role access to tables. While the project uses server actions for mutations, direct reads from the client bypass any server-side authorization.

**Evidence**: 
- Profile page at `profile/[username]/page.tsx:171-176` does a direct `supabase.from("profiles").select("*").eq("username", username)` from the client
- RightRail component does `getSuggestedProfiles()` which also queries from client context  
- The `public_profiles` view exists but is not used by the client components

**Impact**: Any authenticated client can read all profile data directly. The privacy controls (`phone_visibility`, `email_visibility`) are enforced only client-side in the UI — they can be bypassed by direct API calls.

**Recommendation**: 
1. Enable RLS on all tables
2. Create RLS policies that respect the visibility columns  
3. Use the `public_profiles` view for public reads
4. For server actions, use the service-role client (already done)
5. For client-side reads, enforce RLS instead of relying on application-layer filtering

### H2. No Server-Side Caching or Data Layer

**Location**: All pages  
**Severity**: High  
**Category**: performance  

**Observation**: Every page fetches data client-side with `useEffect` + Supabase queries or server action calls. There is no React Server Component data fetching, no ISR, no React Cache, and no TanStack Query / SWR integration.

**Evidence**: 
- Feed page fetches posts via `getPosts()` in a `useEffect`
- Profile page fetches profile + posts + follow info + connection info all in `useEffect`
- Search page uses custom `useSearch` hook with debounce + AbortController (no caching)

**Impact**: 
- Every navigation triggers a full loading spinner/skeleton cycle
- No optimistic updates or cache invalidation
- Refetching the same data on re-mount
- Higher Supabase query costs

**Recommendation**: 
1. Migrate data fetching to React Server Components where possible (feed list, profile headers)
2. For client-interactive pages, integrate TanStack Query for cache management  
3. Use `React.cache()` for deduplicating server-side requests in Server Components
4. Consider `next/next` image optimization for avatar/cover URLs

### H3. No Test Coverage

**Location**: Entire codebase  
**Severity**: High  
**Category**: test-coverage  

**Observation**: Zero test files exist — no unit tests, no integration tests, no E2E tests. The project has no `jest`, `vitest`, `playwright`, or `cypress` configuration.

**Impact**: 
- No safety net for refactoring
- Server actions with complex business logic (connection lifecycle, subscription gating) are untested
- Auth flow edge cases (phone resolution, OTP expiry) cannot be validated

**Recommendation**:
1. Add Vitest for unit tests (server actions, validation schemas, utility functions)
2. Add Playwright E2E tests for critical paths: login → create post → view profile → connect
3. Add MSW (Mock Service Worker) for API mocking in tests
4. Start with: validation schema tests → utility tests → critical server action tests

---

## 🟡 Medium Severity Findings

### M1. Inconsistent Auth Pattern — Client vs Server

**Location**: `src/app/(main)/profile/[username]/page.tsx` + `src/lib/network/actions.ts`  
**Severity**: Medium  
**Category**: architecture  

**Observation**: The `isOwnProfile` check is done client-side by comparing `currentUser?.profile.username === username`. This means profile ownership is determined after the component mounts. The route protection in `proxy.ts` only guards `/profile/edit` — any authenticated user can access any profile URL.

**Impact**: 
- Profile owner checks and visibility enforcement happen client-side, not server-side
- The profile page renders skeleton, then fully renders, then could theoretically flicker if auth state changes

**Recommendation**: 
1. Add a canonical URL header or metadata check for own-profile
2. Move visibility checks into server actions that return data gated by permissions
3. Consider using Next.js middleware for route-level access control

### M2. Subscription System is a Mock

**Location**: `src/lib/subscription.ts`, `src/app/(main)/pricing/page.tsx`, `src/lib/posts/actions.ts:146-155`  
**Severity**: Medium  
**Category**: correctness  

**Observation**: The subscription tier system uses `localStorage` for gating buying/selling posts. The server-side check reads `profiles.subscription_tier` from the database, but the pricing page just writes to `localStorage` — it never updates the database. This means:
- Users who set `localStorage.subscription_tier = "pro"` on the client can create trading posts
- Server-side `createPost` checks `profiles.subscription_tier` from DB, which defaults to `"free"`
- There's no payment integration — the feature is effectively non-functional for real users

**Impact**: All users are on "free" tier server-side, so buying/selling posts cannot be created unless the localStorage mock is also synced server-side.

**Recommendation**: 
1. Either implement real payment processing (Lemon Squeezy, Stripe)  
2. Or set all existing profiles to `"pro"` in a migration if this is a demo
3. Or remove the subscription gate entirely until payment is implemented

### M3. Proxy/Middleware Has Limited Scope

**Location**: `src/proxy.ts`  
**Severity**: Medium  
**Category**: architecture  

**Observation**: The project uses a route handler at `src/proxy.ts` instead of the standard `middleware.ts`. It only protects `/profile/edit` and redirects authenticated users away from `/login` and `/register`. There is no middleware at all using the standard Next.js middleware convention.

**Impact**:
- No centralized route protection
- No session refresh on route transitions
- The proxy pattern is unconventional and may not reliably run on every request

**Recommendation**: 
1. Migrate to proper `middleware.ts` in the project root
2. Add route protection for all auth-gated pages
3. Implement Supabase session refresh in middleware
4. Reference `node_modules/next/dist/docs/` for Next.js 16 middleware patterns

### M4. Direct Client-Side Supabase Queries Bypass Server Actions

**Location**: `src/app/(main)/profile/[username]/page.tsx:170-176`, `src/hooks/use-regions.ts`, `src/hooks/use-market-statuses.ts`  
**Severity**: Medium  
**Category**: architecture  

**Observation**: Several components query Supabase directly from the client using the browser client (`createClient()`), bypassing the server action layer. While these are read-only queries, they bypass authorization and cannot benefit from server-side caching.

**Recommendation**:
1. Move all database reads to server actions or React Server Components
2. Keep only the Supabase client for real-time subscriptions (not yet implemented)
3. Use server actions for the pattern consistency — every data operation goes through a server action

---

## 🟢 Low Severity Findings

### L1. Duplicate Auth Pages in (main) Route Group

**Location**: `src/app/(main)/login/page.tsx` and similar  
**Severity**: Low  
**Category**: maintainability  

**Observation**: Auth pages (`/login`, `/register`, `/forgot-password`) exist both in `(auth)/` (no sidebar) and `(main)/` (with sidebar). Only the `(auth)` versions are linked and used.

**Recommendation**: Remove the duplicated pages in `(main)/` to avoid confusion.

### L2. No Proper Loading.tsx Files

**Location**: Route directories  
**Severity**: Low  
**Category**: UX  

**Observation**: While pages implement inline loading states, none of the route directories use Next.js `loading.tsx` files. These would provide instant loading states before the client component JavaScript loads.

**Recommendation**: Add `loading.tsx` at key route segments for streaming SSR support.

### L3. No Metadata API Usage

**Location**: All page files  
**Severity**: Low  
**Category**: SEO  

**Observation**: None of the pages export `generateMetadata` or `metadata` objects. This means no dynamic page titles, descriptions, or OG tags for social sharing.

**Recommendation**: Add metadata exports to public pages (profile pages, post detail pages) for SEO and social sharing.

### L4. Comment Section Duplication

**Location**: `src/components/feed/post-card.tsx` references `@/components/post/comment-section` but the file may exist at both `feed/` and `post/` paths  
**Severity**: Low  
**Category**: maintainability  

**Observation**: The comment section component appears to have two potential locations. This should be consolidated.

**Recommendation**: Verify and deduplicate — keep only one canonical location.

### L5. No Pagination for Connections/Following Pages

**Location**: `src/app/(main)/mynetwork/connections/page.tsx`, `src/app/(main)/mynetwork/following/page.tsx`  
**Severity**: Low  
**Category**: scalability  

**Observation**: The connections and following pages fetch all profiles at once with no pagination. For users with hundreds of connections, this will degrade performance.

**Recommendation**: Add cursor or offset pagination for list pages. The feed already implements this pattern — reuse it.

### L6. Magic Strings and Missing Constants

**Location**: Various files  
**Severity**: Low  
**Category**: maintainability  

**Observation**: Several values are used as magic strings without constant definitions:
- `connections_visibility` field name in profile page type cast
- Visibility values: `"public"`, `"connections"`, `"followers"`, `"private"`
- Market status default colors

**Recommendation**: Extract into typed constants in `src/lib/constants.ts`.

---

## Architectural Strengths

Despite the findings, the project has several well-executed architectural decisions:

1. **Server Action Pattern**: Clean `"use server"` functions with `ActionResult<T>` return types — consistent and type-safe
2. **Component Organization**: Components grouped by domain (`feed/`, `network/`, `auth/`, `post/`) rather than type
3. **State Handling**: Every data-fetching page implements loading, error, empty, and success states
4. **Type Safety**: Three-layer type system (generated DB types → app types → Zod schemas) provides end-to-end type coverage
5. **Skeleton Loaders**: All loading states use skeleton UIs matching the content layout (recently fixed for profile page)
6. **Mobile-First**: Responsive design with dedicated mobile navigation (bottom nav + top bar)
7. **Database Migrations**: 14 sequential migration files with clear naming and proper indexing
8. **Reference Data**: Regions, townships, and market statuses use bilingual JSONB `{"en": "...", "my": "..."}` naming

---

## Recommendations Priority Matrix

| Finding | Effort | Impact | Priority |
|---------|--------|--------|----------|
| H1 — RLS Policies | Medium | High | P0 |
| H3 — Test Coverage | High | High | P0 |
| M2 — Subscription Mock | Low | Medium | P1 |
| M3 — Middleware Migration | Medium | Medium | P1 |
| M4 — Direct Client Queries | Medium | Medium | P1 |
| H2 — Server Caching | High | Medium | P2 |
| M1 — Auth Consistency | Low | Low | P2 |
| L1-L6 — Cleanup | Low | Low | P3 |

---

## Dependency Graph

```mermaid
flowchart TD
    subgraph External["External Dependencies"]
        Next[Next.js 16] --> React[React 19]
        Next --> Supabase[@supabase/ssr + supabase-js]
        Next --> RHF[react-hook-form]
        RHF --> Zod
        Next --> Tailwind[Tailwind CSS 4]
        Tailwind --> shadcn[@radix-ui primitives]
    end

    subgraph Internal["Internal Module Graph"]
        Types[types/index.ts] --> DBTypes[lib/types/database.ts]
        Schemas[lib/validations/*.ts] --> Zod
        Actions[lib/*/actions.ts] --> Schemas
        Actions --> SupabaseClients[lib/supabase/*.ts]
        Components[components/*] --> Actions
        Components --> Types
        Hooks[hooks/*] --> SupabaseClients
        Hooks --> Types
        Pages[app/**/page.tsx] --> Components
        Pages --> Actions
        Pages --> Hooks
    end
```

---

## Key Metrics

| Metric | Value |
|--------|-------|
| App routes | 22 |
| Client components | ~35 |
| Server actions | 34 |
| Database tables | 13 |
| Database views | 1 |
| Database functions | 5 |
| Migration files | 14 |
| Custom hooks | 7 |
| Zod schemas | 12 |
| Runtime dependencies | 20 |
| Dev dependencies | 8 |
| Test files | 0 |
| RLS policies | 0 |
