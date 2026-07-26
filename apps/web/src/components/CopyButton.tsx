"use client";

import { useState } from "react";
import { track } from "@vercel/analytics";

// eventName is optional: when provided, a successful copy also fires a Vercel
// Web Analytics custom event (install_cmd_copied / start_cmd_copied) so the
// activation funnel is measurable. track() is a no-op until Analytics is enabled.
//
// Delight: clipboard icon morphs into a drawn checkmark + the label flips to a
// dry "copied" for ~1.6s. Reduced-motion users get the state swap instantly
// (globals.css forces ~0ms transitions/animations under prefers-reduced-motion).
export default function CopyButton({
  text,
  eventName,
}: {
  text: string;
  eventName?: string;
}) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      aria-label={copied ? "Copied" : "Copy to clipboard"}
      onClick={() => {
        navigator.clipboard.writeText(text);
        if (eventName) track(eventName);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1600);
      }}
      className="inline-flex items-center gap-1.5 rounded-md bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent transition-[background-color,transform] duration-150 ease-out hover:bg-accent/20 active:scale-[0.97]"
    >
      <span className="relative inline-block h-[13px] w-[13px]">
        {/* clipboard — visible at rest */}
        <svg
          viewBox="0 0 24 24"
          aria-hidden
          className={`absolute inset-0 h-[13px] w-[13px] fill-none stroke-current transition-all duration-200 ease-out ${
            copied ? "scale-50 opacity-0" : "scale-100 opacity-100"
          }`}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="9" y="9" width="11" height="11" rx="2" />
          <path d="M5 15V5a2 2 0 0 1 2-2h10" />
        </svg>
        {/* checkmark — draws in on copy */}
        <svg
          viewBox="0 0 24 24"
          aria-hidden
          className={`absolute inset-0 h-[13px] w-[13px] fill-none stroke-current transition-all duration-200 ease-out ${
            copied ? "scale-100 opacity-100" : "scale-50 opacity-0"
          }`}
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path
            d="M20 6 9 17l-5-5"
            pathLength={1}
            className={copied ? "animate-check-draw" : undefined}
          />
        </svg>
      </span>
      {copied ? "copied" : "Copy"}
    </button>
  );
}
