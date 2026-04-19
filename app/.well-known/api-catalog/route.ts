// Create at psychopats-ai/app/.well-known/api-catalog/route.ts
// Specialist A2 — HEAD handler required by RFC 9727 §2

export async function HEAD() {
  return new Response(null, {
    status: 200,
    headers: {
      'Content-Type': 'application/linkset+json; profile="https://www.rfc-editor.org/info/rfc9727"',
      'Link': '</.well-known/api-catalog>; rel="self"',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}

// GET is handled by the static file at public/.well-known/api-catalog
// Next.js prefers app/ route handlers over public/ files for same path — this route
// only implements HEAD. GET requests fall through to the static file via the
// public/.well-known/api-catalog content.
//
// Alternative: implement GET here too, reading the JSON from a constant.
// But keeping static file separate makes content updates easier (no redeploy).
