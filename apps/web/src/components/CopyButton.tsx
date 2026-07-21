"use client";

import { track } from "@vercel/analytics";

// eventName is optional: when provided, a successful copy also fires a Vercel
// Web Analytics custom event (install_cmd_copied / start_cmd_copied) so the
// activation funnel is measurable. track() is a no-op until Analytics is enabled.
export default function CopyButton({
  text,
  eventName,
}: {
  text: string;
  eventName?: string;
}) {
  return (
    <button
      className="rounded-md bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent transition-colors hover:bg-accent/20"
      onClick={() => {
        navigator.clipboard.writeText(text);
        if (eventName) track(eventName);
      }}
    >
      Copy
    </button>
  );
}
