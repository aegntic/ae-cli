"use client";

import { useState } from "react";

/**
 * Real brand icon for a provider, sourced from Iconify's Simple Icons set
 * (https://api.iconify.design/simple-icons/<slug>.svg). Rendered white so it
 * reads on the colored toy-chip background.
 *
 * Falls back to a letter bubble if the icon slug is missing or fails to load,
 * so niche/unknown providers degrade gracefully instead of a broken image.
 */
export function ToolIcon({
  slug,
  letter,
  size = 20,
}: {
  slug?: string;
  letter: string;
  size?: number;
}) {
  const [failed, setFailed] = useState(false);

  if (slug && !failed) {
    return (
      <img
        src={`https://api.iconify.design/simple-icons/${slug}.svg?color=%23ffffff`}
        alt={letter}
        width={size}
        height={size}
        loading="lazy"
        onError={() => setFailed(true)}
        className="relative z-[3]"
      />
    );
  }

  return <span className="relative z-[3] text-sm font-bold text-white">{letter}</span>;
}
