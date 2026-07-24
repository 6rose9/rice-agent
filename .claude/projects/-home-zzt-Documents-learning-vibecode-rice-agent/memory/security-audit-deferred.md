---
name: security-audit-deferred
description: Security audit completed but findings deferred — not fixing now
metadata:
  type: feedback
---

Ran a full security audit on 2026-07-24 (28 findings: 2 critical, 7 high, 11 medium, 8 low). The service_role key in `.env.local` and the in-memory OTP store are the critical items. User reviewed the report and chose not to fix any of it right now — saved to `.claude/plans/security-audit-findings.md` for later.

**Why**: Not a priority right now; wants to address when ready.

**How to apply**: If asked about security or the audit, refer to the plan file. Don't proactively fix the findings unless asked.
