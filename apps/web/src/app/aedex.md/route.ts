import { SKILL_MD } from "@/lib/skill";

/**
 * Serves the aedex agent skill as raw `text/markdown`.
 *
 * Agents install aedex by ingesting this URL, e.g.
 *   set up https://aedex.ing/aedex.md
 * A literal `.md` App Router segment is the cleanest on-brand path and keeps
 * the served body pure markdown (no HTML wrapper) so skill loaders parse it.
 */
export const dynamic = "force-static";
export const revalidate = false;

export function GET() {
  return new Response(SKILL_MD, {
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      "cache-control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
