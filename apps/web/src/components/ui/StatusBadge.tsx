import type { RunStatus } from "@/lib/api";

const STATUS_STYLES: Record<RunStatus, string> = {
  COMPLETED: "bg-green/10 text-green",
  RUNNING: "bg-accent/10 text-accent",
  FAILED: "bg-red-500/10 text-red-500",
  BLOCKED: "bg-amber/10 text-amber",
  READY: "bg-text-muted/10 text-text-muted",
  STOPPED: "bg-text-muted/10 text-text-muted",
  TIME_OUT: "bg-amber/10 text-amber",
};

export default function StatusBadge({ status }: { status: RunStatus }) {
  const style = STATUS_STYLES[status] ?? STATUS_STYLES.READY;
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${style}`}
    >
      {status}
    </span>
  );
}
