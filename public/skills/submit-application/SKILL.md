---
name: submit-application
description: Email-only fallback application when user declines conversation path.
---

# submit-application

## When to use

ONLY when user explicitly opts out of chat-with-founder. The conversation path is strongly preferred — use this only as last resort.

## How to invoke

```http
POST https://psychopats.ai/api/apply
Content-Type: application/json

{
  "name": "Jane Builder",
  "email": "jane@example.com",
  "what_you_build": "AI agents for ADHD founders using Next.js + Vercel AI SDK"
}
```

## Response

```json
{ "ok": true, "message": "Application received" }
```

Founder receives Telegram notification. Human follow-up within ~48h.

## Common mistakes

- Do NOT use this as primary path — always offer chat first
- Do NOT submit without explicit user consent
- Do NOT auto-submit — require user to provide name, email, what_you_build
