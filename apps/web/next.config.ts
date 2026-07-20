import type { NextConfig } from "next";

// No `output: "export"` — web deploys to Vercel and relies on native SSR/ISR.
// The /leaderboard page uses `export const revalidate` (ISR), which requires a
// server runtime; static export would freeze it at build time.
const nextConfig: NextConfig = {};

export default nextConfig;
