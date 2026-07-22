import { ImageResponse } from "next/og";
import { ogCard } from "@/lib/og";

// /signup OG card — branded, consistent with the other route cards via ogCard.
export const alt = "aedex signup — free test credit to start";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    ogCard({
      kicker: "aedex",
      title: "Start with free test credit.",
      foot: "email-verified · workspace · key",
    }),
    { ...size },
  );
}
