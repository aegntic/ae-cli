"use client";

export default function CopyButton({ text }: { text: string }) {
  return (
    <button
      className="rounded-md bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent transition-colors hover:bg-accent/20"
      onClick={() => {
        navigator.clipboard.writeText(text);
      }}
    >
      Copy
    </button>
  );
}
