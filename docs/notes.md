# Project Notes

## State Management Decision (2026-06-17)

Chose TanStack Query (React Query) over alternatives:

- **SWR** — rejected because cursor-based pagination (`useInfiniteQuery`) is less mature; this app needs a paginated feed
- **RTK + RTK Query** — rejected due to ~30KB+ bundle, weak Next.js App Router / RSC support, and heavy boilerplate for a server-state-only app with minimal client state
- **Zustand / Jotai / Recoil** — rejected because the app has almost no shared client state; UI state is local component state

**Why TanStack Query:**
- Server-state focused (profiles, posts, feeds, follows — all from Supabase)
- Built-in `useInfiniteQuery` for cursor-based paginated feed
- Optimistic updates for follow/unfollow and CRUD mutations
- Minimal boilerplate, excellent Next.js App Router support
- Matches the custom hooks pattern in architecture.md

## Supabase Setup (2026-06-17)

1. `pnpm install @supabase/supabase-js @supabase/ssr`
2. Created `src/lib/supabase/client.ts` — `createBrowserClient` for client components
3. Created `src/lib/supabase/server.ts` — `createServerClient` + `cookies()` for server
4. Created `src/lib/supabase/middleware.ts` — `updateSession()` for proxy/middleware
5. Added `.env.local` with `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
6. `npx skills add supabase/agent-skills` → `.agents/skills/supabase*`

shadcn `@supabase/supabase-client-nextjs` skipped — registry unreachable; clients written manually.
