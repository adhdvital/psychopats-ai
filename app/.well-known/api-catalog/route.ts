// Handler for /.well-known/api-catalog — RFC 9727
// Serves linkset+json for GET, and advertises self for HEAD.
// Route handler has priority over static public/ file in Next.js App Router,
// so we implement both methods here to avoid 405 on GET.

const CATALOG = {
  linkset: [
    {
      anchor: 'https://psychopats.ai/api/chat',
      'service-desc': [{ href: 'https://psychopats.ai/openapi.yaml', type: 'application/yaml' }],
      'service-doc': [{ href: 'https://psychopats.ai/llms.txt', type: 'text/plain' }],
      describedby: [{ href: 'https://psychopats.ai/.well-known/agent.json', type: 'application/json' }],
    },
    {
      anchor: 'https://psychopats.ai/api/apply',
      'service-desc': [{ href: 'https://psychopats.ai/openapi.yaml', type: 'application/yaml' }],
      'service-doc': [{ href: 'https://psychopats.ai/llms.txt', type: 'text/plain' }],
    },
    {
      anchor: 'https://psychopats.ai/api/subscribe',
      'service-desc': [{ href: 'https://psychopats.ai/openapi.yaml', type: 'application/yaml' }],
      'service-doc': [{ href: 'https://psychopats.ai/llms.txt', type: 'text/plain' }],
    },
  ],
};

const HEADERS = {
  'Content-Type': 'application/linkset+json; profile="https://www.rfc-editor.org/info/rfc9727"',
  'Link': '</.well-known/api-catalog>; rel="self"',
  'Cache-Control': 'public, max-age=3600',
};

export async function GET() {
  return new Response(JSON.stringify(CATALOG, null, 2), { status: 200, headers: HEADERS });
}

export async function HEAD() {
  return new Response(null, { status: 200, headers: HEADERS });
}
