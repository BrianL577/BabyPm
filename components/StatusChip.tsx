type Status = "green" | "amber" | "red" | "neutral";

const STYLES: Record<Status, string> = {
  green: "bg-rag-green-bg text-rag-green",
  amber: "bg-rag-amber-bg text-rag-amber",
  red: "bg-rag-red-bg text-rag-red",
  neutral: "bg-line/40 text-ink-soft",
};

const LABELS: Record<Status, string> = {
  green: "GREEN",
  amber: "AMBER",
  red: "RED",
  neutral: "—",
};

export default function StatusChip({ status, label }: { status: Status; label?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-sm px-2 py-0.5 font-mono text-xs font-medium tracking-wide ${STYLES[status]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
      {label || LABELS[status]}
    </span>
  );
}
