import { CheckCircle2, CircleDot, Loader2, XCircle } from "lucide-react";

type StatusPillProps = {
  status: "idle" | "running" | "completed" | "failed";
  label?: string;
  className?: string;
};

const styles = {
  idle: "border-studio-ink/10 bg-studio-cream/70 text-studio-graphite",
  running: "border-studio-amber/40 bg-studio-amber/20 text-studio-graphite",
  completed: "border-studio-sage/45 bg-studio-sage/20 text-studio-graphite",
  failed: "border-studio-coral/45 bg-studio-coral/15 text-studio-graphite"
};

function StatusIcon({ status }: { status: StatusPillProps["status"] }) {
  if (status === "completed") {
    return <CheckCircle2 className="h-3.5 w-3.5 text-studio-sage" aria-hidden="true" />;
  }

  if (status === "failed") {
    return <XCircle className="h-3.5 w-3.5 text-studio-coral" aria-hidden="true" />;
  }

  if (status === "running") {
    return <Loader2 className="h-3.5 w-3.5 animate-spin text-studio-amber" aria-hidden="true" />;
  }

  return <CircleDot className="h-3.5 w-3.5 text-studio-graphite/55" aria-hidden="true" />;
}

export function StatusPill({ status, label, className = "" }: StatusPillProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold capitalize ${styles[status]} ${className}`}
    >
      <StatusIcon status={status} />
      {label ?? status}
    </span>
  );
}
