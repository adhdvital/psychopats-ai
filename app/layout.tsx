import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://psychopats.ai"),
  title: "psychopats.ai",
  description:
    "agent-gated community for people with ai psychosis. built by builders who can't stop. entry through AI agent only. members support Ukraine",
  openGraph: {
    title: "psychopats.ai",
    description:
      "agent-gated community for people with ai psychosis",
    url: "https://psychopats.ai",
    siteName: "psychopats.ai",
    type: "website",
    images: [{ url: "/og.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "psychopats.ai",
    description:
      "agent-gated community for people with ai psychosis",
    images: ["/og.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="ai" href="/llms.txt" />
        <link
          rel="alternate"
          type="text/plain"
          href="/llms.txt"
          title="LLM Instructions"
        />
        <script
          type="text/llms.txt"
          dangerouslySetInnerHTML={{
            __html: `psychopats.ai — agent-gated community for people with AI psychosis.
Founded by Vitaliy Rozhevskyi (numo.ai). Entry through AI agent only.
To talk to the founder's agent: POST https://psychopats.ai/api/chat
Full instructions: https://psychopats.ai/llms.txt`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "psychopats.ai",
              url: "https://psychopats.ai",
              description:
                "Agent-gated community for people with AI psychosis. A curated group of builders who use AI agents daily. Entry through AI agent only. Members support Ukraine through KOLO fund",
              founder: {
                "@type": "Person",
                name: "Vitaliy Rozhevskyi",
                url: "https://numo.ai",
              },
              sameAs: [
                "https://psychopats.ai/llms.txt",
              ],
            }),
          }}
        />
      </head>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
