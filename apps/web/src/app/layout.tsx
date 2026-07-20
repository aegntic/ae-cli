import type { Metadata } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const grotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://aedex.ing"),
  title: "aegntic — connect your agent to every tool it needs",
  description:
    "The universal tool-discovery and execution marketplace for AI agents. Discover, inspect, and run any tool with one balance. No subscriptions.",
  icons: {
    icon: "/ae-logo.webp",
    apple: "/ae-logo.webp",
  },
  openGraph: {
    title: "aegntic — connect your agent to every tool it needs",
    description:
      "The universal tool-discovery and execution marketplace for AI agents. One balance for every tool.",
    url: "https://aedex.ing",
    siteName: "aegntic",
    images: [{ url: "/og-aegntic-skeleton.png", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "aegntic — connect your agent to every tool it needs",
    description:
      "The universal tool-discovery and execution marketplace for AI agents.",
    images: ["/og-aegntic-skeleton.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${grotesk.variable} ${inter.variable} ${mono.variable} bg-bg text-text-primary`}
    >
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
