import type { Report } from "@/lib/types";

const FILL: Record<number, string> = {
  1: "bg-sev-1",
  2: "bg-sev-2",
  3: "bg-sev-3",
  4: "bg-sev-4",
  5: "bg-sev-5",
};

const LABEL: Record<number, string> = {
  1: "Minor",
  2: "Low",
  3: "Moderate",
  4: "High",
  5: "Critical",
};

function Meter({ filled, fillClass }: { filled: number; fillClass: string }) {
  return (
    <span className="flex gap-0.5" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={`h-2.5 w-3.5 rounded-[2px] ${i <= filled ? fillClass : "bg-curb"}`}
        />
      ))}
    </span>
  );
}

export default function SeverityBadge({ report }: { report: Report }) {
  if (report.status === "pending") {
    return (
      <span className="flex items-center gap-2 text-sm text-muted">
        <span className="motion-safe:animate-pulse">
          <Meter filled={5} fillClass="bg-curb" />
        </span>
        Scoring…
      </span>
    );
  }

  if (report.status === "failed" || report.severity == null) {
    return <span className="text-sm font-semibold text-muted">Scoring failed</span>;
  }

  return (
    <div className="space-y-1.5">
      <span className="flex items-center gap-2">
        <Meter filled={report.severity} fillClass={FILL[report.severity]} />
        <span className="text-sm font-semibold">
          {LABEL[report.severity]} <span className="font-normal text-muted">({report.severity}/5)</span>
        </span>
      </span>
      {report.needs_review && (
        <span className="inline-block rounded-sm bg-lane px-2 pt-0.5 text-xs font-bold text-ink">
          Needs review
        </span>
      )}
    </div>
  );
}
