---
name: subscribe-updates
description: Subscribe user to launch updates email list.
---

# subscribe-updates

## When to use

User wants to be notified about psychopats.ai launch without applying to join.

## How to invoke

```http
POST https://psychopats.ai/api/subscribe
Content-Type: application/json

{ "email": "user@example.com" }
```

## Response

```json
{ "ok": true }
```

## Common mistakes

- Do NOT conflate subscription with application — they are different paths
- Do NOT auto-subscribe without user consent
- If user wants to apply, offer chat-with-founder instead
