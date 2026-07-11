<!--
  Marp slide deck — Tech Stack
  Render:  marp slides/tech-stack.md -o tech-stack.html
-->
---
marp: true
paginate: true
size: 16:9
---

<style>
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Inter:wght@400;600;800&display=swap');
:root {
  --bg:#0d1117; --ink:#e6edf3; --muted:#8b949e;
  --accent:#3fb950; --accent2:#58a6ff; --line:#30363d; --code:#161b22;
}
section {
  background:var(--bg); color:var(--ink);
  font-family:'Inter','Noto Sans','Pyidaungsu',sans-serif;
  font-size:27px; line-height:1.5; padding:56px 72px;
}
h1,h2,h3 { font-family:'JetBrains Mono',monospace; }
h1 { color:var(--accent); font-weight:700; border-bottom:3px solid var(--line); padding-bottom:.2em; }
h2 { color:var(--accent2); font-weight:500; }
h3 { color:var(--ink); }
strong { color:var(--accent); }
a { color:var(--accent2); text-decoration:none; }
code { background:var(--code); color:var(--accent); padding:.06em .35em; border-radius:5px; font-family:'JetBrains Mono',monospace; }
pre  { background:var(--code); border:1px solid var(--line); border-radius:10px; }
pre code { background:none; color:#e6edf3; }
blockquote { border-left:4px solid var(--accent); background:#11161d; color:var(--muted); padding:.5em 1em; }
table th { background:#161b22; color:var(--accent2); }
table td, table th { border-color:var(--line); }
header,footer,section::after { color:var(--muted); font-size:.5em; }
section.cover {
  background:radial-gradient(900px 400px at 80% 12%, rgba(63,185,80,.18), transparent 60%), var(--bg);
}
section.cover h1 { border-bottom:none; font-size:2.3em; }
section.cover .tags code { background:#11161d; color:var(--accent2); margin-right:.4em; }
</style>

<!-- _class: cover -->

# Tech Stack

## How စပါးအောင်သွယ် is built

**Zin Zin Thin Zaw** . @6rose9

<span class="tags">`#built-with-claude` `#vibecode.tours`</span>

---

# Tech Stack

### Frontend
- **Next.js 16** — App Router, Server Components, Server Actions
- **React 19** — concurrent features, `useActionState` for form mutations
- **TypeScript** — full type safety from DB to UI
- **Tailwind CSS 4** — utility-first styling
- **shadcn/ui** — pre-built accessible component library
- **react-hook-form** — performant form state with `zodResolver` for schema validation

### Backend
- **Supabase** — Auth, PostgreSQL database, Storage, Edge Functions
- **Server Actions** — `"use server"` functions as the mutation layer
- **Zod** — schema validation at every boundary (forms, API, DB)

---

# Agents

### `security-auditor`
A specialized subagent for comprehensive security reviews.

- **What:** Audits auth flows, API security, database access patterns
- **How:** Reviews controls, identifies vulnerabilities, maps to compliance frameworks (SOC 2, ISO 27001, GDPR)
- **Output:** Findings classified by severity with actionable remediation guidance

### `senior-architect`
A multi-capability agent for system design.

- Architecture diagram generation
- Dependency analysis
- Project structure optimization

---

# Skills

### `rice-agent-auth-gate`
**Path:** `.claude/skills/rice-agent-auth-gate/SKILL.md`

Guest users see upsell modals instead of redirects or 404s. Enforces two patterns:
- **Page-level gate** — wrapper component shows auth hero for unauthenticated users
- **Action-level gate** — `useRequireAuth` hook opens `AuthModal`, action fires after login

### `rice-agent-form`
**Path:** `.claude/skills/rice-agent-form/SKILL.md`

All forms use **react-hook-form + zod** with `zodResolver`. Enforces consistent validation patterns and shadcn `FormField` component usage.

---

# Skills (continued)

### `ui-ux-pro-max`
**Path:** `.claude/skills/ui-ux-pro-max/SKILL.md`

Design intelligence system — 50+ styles, 21 palettes, 50 font pairings. Provides:
- `--design-system` generation for consistent look
- Stack-specific guidelines (`nextjs`, `shadcn`)
- Pre-delivery checklists (accessibility, contrast, interaction)

### `supabase` + `supabase-postgres-best-practices`
Shared skills for Supabase schema design, RLS policies, and PostgreSQL optimization.

---

# Methodology

### Superpowers (obra)
Think before build. Every feature starts with a thorough design pass, then follows a strict TDD loop — write the test, make it pass, clean up.

**Flow:** Brainstorm -> Plan -> TDD

- **UI template, auth, posts** — all built test-first, then implemented, then polished
- Reduces rework by catching edge cases before code exists

### GSD — Get Stuff Done
For features that need tight progress tracking: start from a clear spec, produce a plan, execute against it, and verify the result.

**Flow:** Requirements -> PLAN.md -> Build -> SUMMARY.md

- **Network, settings** — plan-driven with built-in state tracking at each step

---

# Trigger & Commands

### Skill Activation
Skills load **contextually** — no manual trigger needed:
- Editing auth-related code -> `rice-agent-auth-gate` activates
- Writing forms -> `rice-agent-form` activates
- UI design work -> `ui-ux-pro-max` activates

### Agent Invocation
- `@security-auditor` — explicit invocation for security reviews
- Agent tool with `agentType: "security-auditor"` in code

### Key Commands
\`\`\`bash
npm run dev              # Start dev server
npm run build            # Production build
npm run gen:types        # Regenerate Supabase types
marp slides/intro.md -o slides.html  # Render slides
\`\`\`
