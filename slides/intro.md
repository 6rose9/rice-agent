<!--
  Marp template — "terminal-dark"
  Copy this file into your repo (e.g. slides/intro.md) and replace the content.
  Render:  marp slides/intro.md -o slides.html      (or .pdf / .png)
  Theme is self-contained in the <style> block below — no external CSS needed.
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
section.lead { background:#11161d; }
section.lead h1 { border-bottom:none; }
</style>

<!-- _class: cover -->

# စပါးအောင်သွယ်

## Myanmar's Rice Industry — Professional Networking & Marketplace

**Crystal** . @6rose9

<span class="tags">`#built-with-claude` `#vibecode.tours`</span>

---

# What it is

- **Problem:** Myanmar rice trading relies on fragmented Facebook groups, phone calls, and personal contacts — discovery is slow, trust is hard to build
- **Who it's for:** Farmers, traders, agents, and general users in Myanmar's rice supply chain
- **What it does:** LinkedIn-style profiles + marketplace posts — build professional identity, publish buy/sell opportunities, grow your network

---

# How it works

1. **Register** with phone + password → choose your role (Farmer / Trader / Agent)
2. **Create profile** → photo, location, market status ("Selling Rice", "Available as Agent"…)
3. **Post opportunities** → buying or selling posts with rice type, price, images
4. **Discover & connect** → search by role, location, rice type; follow users; build your network

Stack: **Next.js 16 · React 19 · TypeScript · Tailwind CSS · shadcn/ui · Supabase** · built with Claude Code

---

<!-- _class: lead -->

# Demo

![w:880](../public/assets/demo/d1.png)

## Screenshots
| Home Feed | Selling Post | Buying Post |
|-----------|--------------|-------------|
| ![Home Feed](public/assets/demo/d1.png) | ![Selling Post](public/assets/demo/d2.png) | ![Buying Post](public/assets/demo/d3.png) |

| Create Post | Create Selling and Buying Post |
|-------------|-------------------------------|
| ![Create Post](public/assets/demo/d4.png) | ![Create Selling and Buying Post](public/assets/demo/d5.png) | 

| Network | Profile |
|---------|---------|
| ![Network](public/assets/demo/d6.png) | ![Profile](public/assets/demo/d7.png) |

---

# Links

- **Live:** https://rice-agent.vercel.app/
- **Repo:** github.com/6rose9/rice-agent
- **License:** MIT
