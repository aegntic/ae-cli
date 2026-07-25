import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: "https://aedex.ing/sitemap.xml",
    host: "https://aedex.ing",
  };
}
