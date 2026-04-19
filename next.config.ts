import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/apply",
        destination: "/start",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      // Homepage — full discovery triangle for agents landing on root
      {
        source: "/",
        headers: [
          {
            key: "Link",
            value: [
              '</llms.txt>; rel="llms-txt"',
              '</.well-known/api-catalog>; rel="api-catalog"',
              '</openapi.yaml>; rel="service-desc"; type="application/yaml"',
              '</.well-known/agent.json>; rel="describedby"; type="application/json"',
            ].join(", "),
          },
        ],
      },
      // API routes — advertise catalog and service-desc
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Link",
            value: [
              '</.well-known/api-catalog>; rel="api-catalog"',
              '</openapi.yaml>; rel="service-desc"; type="application/yaml"',
            ].join(", "),
          },
        ],
      },
      // API catalog endpoint — correct MIME + self link
      {
        source: "/.well-known/api-catalog",
        headers: [
          {
            key: "Content-Type",
            value:
              'application/linkset+json; profile="https://www.rfc-editor.org/info/rfc9727"',
          },
          { key: "Cache-Control", value: "public, max-age=3600" },
          { key: "Link", value: '</.well-known/api-catalog>; rel="self"' },
        ],
      },
      // Markdown negotiation responses need Vary: Accept
      {
        source: "/(llms.txt|start.md)",
        headers: [
          { key: "Vary", value: "Accept" },
          { key: "X-Robots-Tag", value: "noindex" },
        ],
      },
    ];
  },
  async rewrites() {
    return {
      beforeFiles: [
        // Homepage — agents requesting markdown get llms.txt
        {
          source: "/",
          has: [
            {
              type: "header",
              key: "accept",
              value: "(.*)text/markdown(.*)",
            },
          ],
          destination: "/llms.txt",
        },
        // /start — agents requesting markdown get start.md
        {
          source: "/start",
          has: [
            {
              type: "header",
              key: "accept",
              value: "(.*)text/markdown(.*)",
            },
          ],
          destination: "/start.md",
        },
      ],
    };
  },
};

export default nextConfig;
