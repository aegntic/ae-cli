import Image from "next/image";

/**
 * Official aegntic "ae" wordmark (ae-logo.webp).
 * The source asset is a BLACK wordmark on transparent alpha; we invert it so
 * it reads white on the dark charcoal surfaces. Aspect 344x189.
 */
export function Logo({
  height = 26,
  invert = true,
  className = "",
}: {
  height?: number;
  invert?: boolean;
  className?: string;
}) {
  const width = Math.round(height * (344 / 189));
  return (
    <Image
      src="/ae-logo.webp"
      alt="aegntic"
      width={width}
      height={height}
      priority
      className={`${invert ? "[filter:invert(1)]" : ""} ${className}`}
    />
  );
}
