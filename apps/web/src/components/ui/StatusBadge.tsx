"use client"

const STATUS_STYLES: Record<string, string> = {
  COMPLETED: "bg-green/10 text-green border-green/20",
  RUNNING: "bg-accent/10 text-accent border-accent/20",
  FAILED: "bg-red-500/10 text-red-400 border-red-500/20",
  BLOCKED: "bg-amber/10 text-amber border-amber/20",
  READY: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
  STOPPED: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
  TIME_OUT: "bg-red-500/10 text-red-400 border-red-500/20",
}

const DOT_STYLES: Record<string, string> = {
  COMPLETED: "bg-green",
  RUNNING: "bg-accent",
  FAILED: "bg-red-500",
  BLOCKED: "bg-amber",
  READY: "bg-zinc-400",
  STOPPED: "bg-zinc-400",
  TIME_OUT: "bg-red-500",
}

export default function StatusBadge({ status }: { status: string }) {
  const badge = STATUS_STYLES[status] ?? STATUS_STYLES.READY
  const dot = DOT_STYLES[status] ?? DOT_STYLES.READY

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${badge}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {status}
    </span>
  )
}
