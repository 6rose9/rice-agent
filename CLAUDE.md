<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Spec

Read `docs/spec.md` for full project specifications.

## Database Documentation

After modifying any database schema file (`supabase/migrations/*.sql`, `prisma/schema.prisma`, `src/models/*.ts`, or any SQL files), you MUST update `docs/database.md` to reflect the changes. Read the current `docs/database.md`, understand the structure, and update only the affected sections (tables, columns, indexes, RLS policies, enums, etc.).
