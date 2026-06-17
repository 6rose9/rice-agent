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
