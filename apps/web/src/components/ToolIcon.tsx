"use client";

import { useState } from "react";

/**
 * Clean monochrome provider logo (the "modern tech provider logo pack" look).
 * Rendered as dark ink (#0a0a0b) — no colored bubble, no letter fallback.
 * If a slug fails to load it simply renders nothing, so only brands with a
 * real icon appear (no sad letter stand-ins).
 */
export function ToolIcon({ slug, size = 18 }: { slug: string; size?: number }) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;
  return (
    <img
      src={`https://api.iconify.design/simple-icons/${slug}.svg?color=%230a0a0b`}
      alt=""
      width={size}
      height={size}
      loading="lazy"
      onError={() => setFailed(true)}
      className="shrink-0"
    />
  );
}
