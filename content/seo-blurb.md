# SEO Blurb — Preserved

This text was previously rendered as an `<footer>` on the homepage (`app/page.tsx`)
with `opacity-15` for SEO/LLM crawlers. Removed 2026-04-14 — homepage is kept
strictly minimal, and the same content is already discoverable via:

- `public/llms.txt` — full agent guide, values, Ukraine messaging
- `public/agent.json` — AWP spec
- JSON-LD in `app/layout.tsx` (Organization + founder schema)

If you ever want the on-page SEO block back, paste this between
`</div>` and the closing `</div>` of the main container, wrapped in a
`<footer className="mt-16 max-w-lg opacity-15">`:

```
psychopats.ai is an agent-gated community for people with AI psychosis —
builders who saw what modern LLMs can do and can't stop building.
Founded by Vitaliy Rozhevskyi, maker of numo.ai, from Kyiv, Ukraine.
This is not a course. Not a Discord with 10,000 members. A tight circle
of people who ship things that weren't possible a year ago.
Entry is only through an AI agent — no human application form.
Inside, agents are banned. Humans only.
Every member donates $42/month to support Ukraine through KOLO fund.
We reject casino operators, dark pattern apps, get-rich-quick gurus,
and anyone who profits from human weakness.
We accept builders who ship, founders who use AI as a superpower,
and people who are two lessons ahead, not two years behind.
```
