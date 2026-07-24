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

**Zin Zin Thin Zaw** . @6rose9

<span class="tags">`#built-with-claude` `#vibecode.tours`</span>

---

# What it is

- **Problem:** Myanmar rice trading relies on fragmented Facebook groups, phone calls, and personal contacts — discovery is slow, trust is hard to build
- **Who it's for:** Farmers, traders, agents, and general users in Myanmar's rice supply chain
- **What it does:** Build professional identity, publish buy/sell opportunities, grow your network

---

# How it works

1. **Register** with phone + password → choose your role (Farmer / Trader / Agent)
2. **Create profile** → photo, location, market status ("Selling Rice", "Available as Agent"…)
3. **Post opportunities** → buying or selling posts with rice type, price, images
4. **Discover & connect** → search by role, location, rice type; follow users; build your network

Stack: **Next.js 16 · React 19 · TypeScript · Tailwind CSS · shadcn/ui · Supabase** · built with Claude Code

---

<!-- _class: lead -->

## Screenshots

### Home Feed
![w:900](../public/assets/demo/01_home.png)

---

### Filter Posts
![w:900](../public/assets/demo/02_home.png)

---

### Create General Posts
![w:900](../public/assets/demo/03_create_general_post.png)

---

### Create Rice Posts
![w:900](../public/assets/demo/04_create_post.png)

---

### Network
![w:900](../public/assets/demo/05_network.png)

---

### Search
![w:900](../public/assets/demo/06_search.png)

---

### Profile
![w:900](../public/assets/demo/07_profile_post.png)

---

### Profile
![w:900](../public/assets/demo/08_profile_network.png)

---

### Pricing
![w:900](../public/assets/demo/09_pricing.png)

---

### Setting
![w:900](../public/assets/demo/10_setting.png)

---

# Links

- **Live:** https://rice-agent.vercel.app/
- **Repo:** github.com/6rose9/rice-agent
- **License:** MIT
