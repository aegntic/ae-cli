import type { ReactElement } from "react";

type OgCardOpts = {
  kicker: string;
  title: string;
  foot: string;
};

// Branded social card: cool-grey "aegntic toy" surface + ink border (Swiss motif)
// + electric azure accent. Shared by the per-route opengraph-image.tsx files so
// every shareable surface (/, /leaderboard, /start) carries a consistent card.
// Plain inline styles — opengraph-image runs under next/og, no Tailwind there.
export function ogCard({ kicker, title, foot }: OgCardOpts): ReactElement {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "#E2E5E8",
        display: "flex",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          margin: 40,
          border: "6px solid #0A0A0B",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 64,
          background: "#FFFFFF",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 28,
              height: 28,
              background: "#2E9BFF",
              border: "3px solid #0A0A0B",
            }}
          />
          <div
            style={{
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: "#0A0A0B",
            }}
          >
            {kicker}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              fontSize: 78,
              fontWeight: 800,
              lineHeight: 1.02,
              letterSpacing: -2,
              color: "#0A0A0B",
            }}
          >
            {title}
          </div>
          <div style={{ fontSize: 28, color: "#1A6FBF", fontFamily: "monospace" }}>{foot}</div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ height: 8, width: 120, background: "#2E9BFF" }} />
          <div
            style={{
              fontSize: 26,
              fontWeight: 600,
              color: "#0A0A0B",
              fontFamily: "monospace",
            }}
          >
            aedex.ing
          </div>
        </div>
      </div>
    </div>
  );
}
