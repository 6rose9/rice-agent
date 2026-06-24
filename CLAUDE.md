# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

စပါးအောင်သွယ် (Rice Agent) — A professional networking and marketplace platform for Myanmar's rice industry. Combines LinkedIn-style profiles with marketplace posts for buying/selling rice. Targets farmers, traders, agents, and general users.

## Commands

```bash
npm run dev          # Start dev server (Next.js)
npm run build        # Production build
npm run lint         # Run ESLint
npm run seed:posts   # Seed posts data (tsx scripts/seed-posts.ts)
npm run gen:types    # Regenerate Supabase types → src/lib/types/database.ts
```

## Architecture

### Stack
- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, shadcn/ui
- **Backend**: Supabase (Auth, PostgreSQL, Storage)
- **Validation**: Zod schemas
- **Forms**: react-hook-form + @hookform/resolvers

### Route Structure (App Router)

```
src/app/
├── (auth)/           # Auth pages (no sidebar)
│   ├── login/
│   └── register/
├── (main)/           # Main app (with sidebar layout)
│   ├── feed/         # Post feed
│   ├── search/       # User/post search
│   ├── posts/create/ # Create post
│   ├── profile/[username]/  # User profile
│   ├── profile/edit/
│   ├── saved/        # Bookmarked posts
│   ├── mynetwork/    # Followers/following
│   ├── messages/     # (placeholder)
│   ├── pricing/      # Subscription tiers
│   └── settings/
```

### Key Architectural Patterns

**Server Actions** — All mutations use `"use server"` functions in `src/lib/*/actions.ts`. They accept `(prevState, FormData)` and return `{ success, error?, redirect? }`. Used with React's `useActionState`.

**Supabase Clients**:
- `src/lib/supabase/server.ts` — Server-side client (uses `cookies()`)
- `src/lib/supabase/client.ts` — Browser client
- `src/lib/supabase/middleware.ts` — Session refresh helper

**Auth Flow** — Phone + password authentication. Users without email get a synthetic email (`{phone}@rice-agent.local`). Login resolves phone → email via `lookup_email_by_phone` RPC. No OTP verification in V1.

**Type Safety**:
- Generated DB types: `src/lib/types/database.ts` (from Supabase)
- Application types: `src/types/index.ts` (extends DB types with relations)
- Validation schemas: `src/lib/validations/*.ts` (Zod)

**Bilingual Content** — Reference tables (regions, townships, market_status) store names as JSONB `{"en": "...", "my": "..."}`.

### Important Conventions

- **Path aliases**: `@/*` maps to `./src/*`
- **Soft deletion**: Profiles use `deleted_at`, posts use `is_active`
- **Post types**: `general`, `buying`, `selling` — trading posts require `rice_type`
- **Subscription gate**: Buying/selling posts require client-sent `subscription_tier` field (demo/localStorage-based)
- **Image storage**: Supabase Storage buckets `profiles/` and `post-images/`

## Database

After modifying any database schema file (`supabase/migrations/*.sql`), you MUST update `docs/database.md` to reflect the changes. Read the current `docs/database.md`, understand the structure, and update only the affected sections.

Key tables: `profiles` (extends auth.users), `posts`, `post_images`, `saved_posts`, `regions`, `townships`, `market_status`

## Next.js Version Notice

This uses Next.js 16 which may have breaking changes from your training data. Check `node_modules/next/dist/docs/` before writing Next.js-specific code.

## Spec

Read `docs/spec.md` for full project specifications, user roles, and feature requirements.
