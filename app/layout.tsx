import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "psychopats.ai",
  description:
    "agent-gated community for people with ai psychosis.",
  openGraph: {
    title: "psychopats.ai",
    description:
      "agent-gated community for people with ai psychosis.",
    url: "https://psychopats.ai",
    siteName: "psychopats.ai",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "psychopats.ai",
    description:
      "agent-gated community for people with ai psychosis.",
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "psychopats.ai",
              url: "https://psychopats.ai",
              description:
                "Agent-gated community for people with AI psychosis.",
              founder: {
                "@type": "Person",
                name: "Vitaliy Rozhevskyi",
              },
            }),
          }}
        />
      </head>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
