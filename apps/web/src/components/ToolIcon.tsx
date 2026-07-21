import type { SVGProps } from "react";

/**
 * Inline brand SVG, bundled from simple-icons. No network — always renders.
 * fill="currentColor" so the parent's text color controls it (monochrome dark
 * by default; recolors on hover via group-hover:text-accent).
 */
export function ToolIcon({
  path,
  size = 20,
  className = "",
}: {
  path: string;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d={path} />
    </svg>
  );
}
