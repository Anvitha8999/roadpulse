import type { Report } from "@/lib/types";

const COLORS: Record<number, string> = {
  1: "bg-emerald-100 text-emerald-800",
  2: "bg-lime-100 text-lime-800",
  3: "bg-amber-100 text-amber-800",
  4: "bg-orange-100 text-orange-800",
  5: "bg-red-100 text-red-800",
};

export default function SeverityBadge({ report }: { report: Report }) {
  if (report.status === "pending") {
    return (
      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
        Scoring…
      </span>
    );
  }
  if (report.status === "failed" || report.severity == null) {
    return (
      <span className="rounded-full bg-slate-200 px-2.5 py-1 text-xs font-medium text-slate-800">
        Scoring failed
      </span>
    );
  }
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${COLORS[report.severity]}`}>
        Severity {report.severity}
      </span>
      {report.needs_review && (
        <span className="rounded-full border border-amber-300 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800">
          Needs review
        </span>
      )}
    </div>
  );
}
