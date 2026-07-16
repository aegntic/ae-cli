import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Aegntic - Connect your agent to every tool it needs",
  description:
    "The universal tool-discovery and execution marketplace for AI agents. Discover, inspect, and run any tool with one balance. No subscriptions.",
  openGraph: {
    title: "Aegntic - Connect your agent to every tool it needs",
    description:
      "The universal tool-discovery and execution marketplace for AI agents. One balance for every tool.",
    url: "https://aegntic.ai",
    siteName: "Aegntic",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Aegntic - Connect your agent to every tool it needs",
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
    <html lang="en" className={inter.variable}>
      <body className="bg-bg text-text-primary antialiased">{children}</body>
    </html>
  );
}
