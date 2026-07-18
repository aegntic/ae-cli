import type { Metadata } from "next";
import { Inter_Tight, Newsreader, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const sans = Inter_Tight({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

const serif = Newsreader({
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
  variable: "--font-serif-inter",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "aegntic — connect your agent to every tool it needs",
  description:
    "The universal tool-discovery and execution marketplace for AI agents. Discover, inspect, and run any tool with one balance. No subscriptions.",
  openGraph: {
    title: "aegntic — connect your agent to every tool it needs",
    description:
      "The universal tool-discovery and execution marketplace for AI agents. One balance for every tool.",
    url: "https://aegntic.ai",
    siteName: "aegntic",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "aegntic — connect your agent to every tool it needs",
    description:
      "The universal tool-discovery and execution marketplace for AI agents.",
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
      className={`${sans.variable} ${serif.variable} ${mono.variable} bg-bg text-text-primary`}
    >
      <body className="min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
