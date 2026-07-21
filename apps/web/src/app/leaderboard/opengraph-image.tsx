import { ImageResponse } from "next/og";
import { ogCard } from "@/lib/og";

export const alt = "aedex reliability leaderboard — which data tool actually works";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    ogCard({
      kicker: "reliability board",
      title: "Which data tool actually works?",
      foot: "live telemetry · can't be faked",
    }),
    { ...size },
  );
}
