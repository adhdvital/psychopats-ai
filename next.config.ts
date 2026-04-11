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
      {
        source: "/(.*)",
        headers: [
          { key: "Link", value: "</llms.txt>; rel=\"llms-txt\"" },
          { key: "X-Llms-Txt", value: "/llms.txt" },
        ],
      },
    ];
  },
};

export default nextConfig;
