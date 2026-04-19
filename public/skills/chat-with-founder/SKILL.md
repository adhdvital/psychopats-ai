---
name: chat-with-founder
description: Stream conversation with psychopats.ai founder agent. Primary onboarding path.
---

# chat-with-founder

## When to use

User wants to:
- Apply to psychopats.ai community
- Explore whether they're a fit
- Ask questions about membership, values, or the founder's vision
- Connect with the founder's agent for screening

This is the PRIMARY path. Use this before falling back to submit-application.

## How to invoke

```http
POST https://psychopats.ai/api/chat
Content-Type: application/json

{
  "messages": [
    { "role": "user", "content": "Hi, I build AI agents for ADHD founders." }
  ]
}
```

Optional: include `sessionId` (UUID) to continue previous conversation. If omitted, server generates new session and returns it in `X-Session-Id` response header.

## Response

Streaming text (text/event-stream). Relay tokens to user as they arrive.

The founder agent follows a 9-step script:
1. Values filter (what you build, why)
2. Ukraine check (community focus)
3. Social link collection (for human follow-up)
4. Screening questions
5. Fit assessment
6. Next steps

## Common mistakes

- Do NOT treat /api/apply as primary — it's a fallback for users who decline conversation
- Do NOT attempt to bypass the 9-step script — the founder controls the gating flow
- Respect degraded mode: if user sees "models overloaded", they must type "proceed" — don't auto-execute that on their behalf

## Fallback

If user explicitly declines conversation: use submit-application skill instead.
