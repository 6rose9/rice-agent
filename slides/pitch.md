---
marp: true
paginate: true
transition: fade
# PechaKucha: 6 slides, 20s auto-advance. Do not change the count.
auto-advance: 20
---

<!-- slide 1 -->
# Who's my person?
Rice farmers and traders in Myanmar. The farmer with 500 တင်း of rice ready to sell but no way to reach buyers outside their village. The trader who drives town to town hunting for stock. They do business through Facebook groups, phone calls, and word of mouth — because nothing purpose-built exists for them.

---

<!-- slide 2 -->
# Their problem
There's no way to search for "a farmer selling ဧည့်မထ rice near Mon." Facebook posts vanish in the feed — no profiles, no reputation, no trust. The rice trade runs on personal contacts, and if you don't have them, you're locked out.

---

<!-- slide 3 -->
# What I built
စပါးအောင်သွယ် — Rice Agent. A professional networking and marketplace platform for Myanmar's rice industry. Users create profiles with roles and location, publish buying and selling posts, browse a paginated feed, search by role and region, and follow each other to build trusted networks. Think LinkedIn meets classifieds, but for rice.

---

<!-- slide 4 -->
# How I built it
- MCP: Magic (21st.dev) for shadcn/ui components, Context7 for library docs — both in .mcp.json
- Skill: rice-agent-auth-gate and rice-agent-form in .claude/skills/ — teaches Claude to gate content behind auth modals instead of redirects, and enforce react-hook-form + zod on every form
- Agent: senior-code-reviewer and nextjs-log-reviewer in .claude/agents/ — adversarial code review after every feature chunk, checking security, RLS, N+1 queries, edge cases

---

<!-- slide 5 -->
# Why it matters
Auth, profiles, feed, and post creation are fully dynamic — real data flowing through 6 tables with Row-Level Security, 10 indexes, cursor pagination, soft deletes, and cascading foreign keys. Network, messages, and search are UI-complete but not wired yet. 

---

<!-- slide 6 -->
# Done checklist
- [✅] repo public
- [✅] MCP + skill + agent used
- [] report.md in team repo
