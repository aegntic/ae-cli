import type { MetadataRoute } from "next";
import { COMPETITORS } from "@/lib/comparisons";

const BASE = "https://aedex.ing";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const last = (path: string, changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"], priority: number): MetadataRoute.Sitemap[number] => ({
    url: `${BASE}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  });

  return [
    last("", "weekly", 1.0),
    last("/tools", "weekly", 0.9),
    last("/leaderboard", "hourly", 0.8),
    last("/compare", "weekly", 0.8),
    last("/start", "monthly", 0.6),
    last("/signup", "monthly", 0.6),
    last("/app", "monthly", 0.5),
    last("/aedex.md", "monthly", 0.4),
    ...COMPETITORS.map((c) =>
      last(`/compare/${c.slug}`, "monthly", 0.7),
    ),
  ];
}
