import { ImageResponse } from "next/og";
import { ogCard } from "@/lib/og";

// Root OG card — also serves as the Twitter card (Next uses opengraph-image for
// twitter:image when no twitter-image file is present). File convention, so
// Next injects the og:image meta automatically; the manual images in layout
// metadata were removed in favour of this.
export const alt = "aedex — one balance, every data tool";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    ogCard({
      kicker: "aedex",
      title: "One balance. Every data tool.",
      foot: "discover first · run second · bill last",
    }),
    { ...size },
  );
}
