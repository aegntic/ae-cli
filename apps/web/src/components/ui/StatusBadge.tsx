import type { RunStatus } from "@/lib/api";

const STATUS_STYLES: Record<RunStatus, string> = {
  COMPLETED: "bg-toy-green text-white",
  RUNNING: "bg-toy-yellow text-black",
  FAILED: "bg-toy-red text-white",
  BLOCKED: "bg-toy-lavender text-white",
  READY: "bg-bg-elevated text-text-secondary border-2 border-black",
  STOPPED: "bg-bg-elevated text-text-muted border-2 border-black",
  TIME_OUT: "bg-toy-orange text-white",
};

export default function StatusBadge({ status }: { status: RunStatus }) {
  const style = STATUS_STYLES[status] ?? STATUS_STYLES.READY;
  return (
    <span
      className={`toy-chip inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${style}`}
    >
      {status}
    </span>
  );
}
