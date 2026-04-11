import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  title: "psychopats.ai",
  description: "Curated community of AI builders. Not for everyone.",
  openGraph: {
    title: "psychopats.ai",
    description: "Curated community of AI builders. Not for everyone.",
    url: "https://psychopats.ai",
    siteName: "psychopats.ai",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "psychopats.ai",
    description: "Curated community of AI builders. Not for everyone.",
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
    <html lang="en" className={jetbrainsMono.variable}>
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
                "Curated community of AI builders who support Ukraine.",
              founder: {
                "@type": "Person",
                name: "Vitaliy Rozhevskyi",
              },
            }),
          }}
        />
      </head>
      <body className="min-h-screen font-mono">{children}</body>
    </html>
  );
}
