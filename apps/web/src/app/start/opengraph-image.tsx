import { ImageResponse } from "next/og";
import { ogCard } from "@/lib/og";

export const alt = "get started with aedex — running in sixty seconds";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    ogCard({
      kicker: "get started",
      title: "Running in sixty seconds.",
      foot: "bun add -g @aegntic/aedex",
    }),
    { ...size },
  );
}
