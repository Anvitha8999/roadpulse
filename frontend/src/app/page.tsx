import Link from "next/link";
import AgentChat from "@/components/AgentChat";
import AutoRefresh from "@/components/AutoRefresh";
import SeverityBadge from "@/components/SeverityBadge";
import { getReports } from "@/lib/api";

export const dynamic = "force-dynamic";

const CITY_TZ = "America/Los_Angeles";

const SEVERITY_SCALE = [
  { level: 1, label: "Minor", fill: "bg-sev-1" },
  { level: 2, label: "Low", fill: "bg-sev-2" },
  { level: 3, label: "Moderate", fill: "bg-sev-3" },
  { level: 4, label: "High", fill: "bg-sev-4" },
  { level: 5, label: "Critical", fill: "bg-sev-5" },
];

export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string }>;
}) {
  const { sort: sortParam } = await searchParams;
  const sort = sortParam === "severity" ? "severity" : "newest";
  const reports = await getReports(sort);

  const scored = reports.filter((r) => r.status === "scored");
  const avgSeverity = scored.length
    ? (scored.reduce((sum, r) => sum + (r.severity ?? 0), 0) / scored.length).toFixed(1)
    : "–";
  const critical = scored.filter((r) => r.severity === 5).length;
  const needsReview = reports.filter((r) => r.needs_review).length;
  const hasPending = reports.some((r) => r.status === "pending");
  const mix = SEVERITY_SCALE.map((s) => ({
    ...s,
    count: scored.filter((r) => r.severity === s.level).length,
  }));

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-4 py-8">
      <AutoRefresh active={hasPending} />

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-extrabold tracking-tight">Road damage reports</h1>
          <p className="mt-1 text-muted">
            Photos from residents, scored for severity by a crack-segmentation model. Scores the
            model is unsure about are marked for review.
          </p>
        </div>
        <div className="flex rounded-lg border border-curb bg-white p-1 text-sm font-semibold">
          {(["newest", "severity"] as const).map((option) => (
            <Link
              key={option}
              href={`/?sort=${option}`}
              aria-current={sort === option ? "page" : undefined}
              className={`rounded-md px-3 py-1.5 ${
                sort === option ? "bg-asphalt text-white" : "text-muted hover:text-ink"
              }`}
            >
              {option === "newest" ? "Newest first" : "Most severe first"}
            </Link>
          ))}
        </div>
      </div>

      <section className="rounded-xl border border-curb bg-white">
        <dl className="grid grid-cols-2 divide-curb md:grid-cols-4 md:divide-x">
          <div className="p-5">
            <dt className="text-sm text-muted">Reports</dt>
            <dd className="mt-1 text-4xl font-extrabold tabular-nums">{reports.length}</dd>
          </div>
          <div className="p-5">
            <dt className="text-sm text-muted">Average severity</dt>
            <dd className="mt-1 text-4xl font-extrabold tabular-nums">
              {avgSeverity}
              <span className="text-lg font-semibold text-muted"> / 5</span>
            </dd>
          </div>
          <div className="p-5">
            <dt className="text-sm text-muted">Critical</dt>
            <dd className="mt-1 text-4xl font-extrabold tabular-nums text-sev-5">{critical}</dd>
          </div>
          <div className={`p-5 ${needsReview ? "border-l-4 border-l-lane md:border-l-4" : ""}`}>
            <dt className="text-sm text-muted">Needs review</dt>
            <dd className="mt-1 text-4xl font-extrabold tabular-nums">{needsReview}</dd>
          </div>
        </dl>

        {scored.length > 0 && (
          <div className="border-t border-curb px-5 py-4">
            <p className="mb-2 text-sm font-semibold">Severity mix</p>
            <div
              className="flex h-3 overflow-hidden rounded-full bg-curb"
              role="img"
              aria-label={mix.map((m) => `${m.label}: ${m.count}`).join(", ")}
            >
              {mix
                .filter((m) => m.count > 0)
                .map((m) => (
                  <span
                    key={m.level}
                    className={m.fill}
                    style={{ width: `${(m.count / scored.length) * 100}%` }}
                  />
                ))}
            </div>
            <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
              {mix.map((m) => (
                <li key={m.level} className="flex items-center gap-1.5">
                  <span className={`h-2.5 w-2.5 rounded-sm ${m.fill}`} aria-hidden="true" />
                  {m.label} {m.count}
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <AgentChat />

      <section className="overflow-hidden rounded-xl border border-curb bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-curb bg-concrete/60 text-muted">
            <tr>
              <th className="px-4 py-3 font-semibold">Photo</th>
              <th className="px-4 py-3 font-semibold">Report</th>
              <th className="px-4 py-3 font-semibold">Severity</th>
              <th className="hidden px-4 py-3 font-semibold md:table-cell">Model confidence</th>
              <th className="hidden px-4 py-3 font-semibold lg:table-cell">Location</th>
              <th className="hidden px-4 py-3 font-semibold md:table-cell">Submitted</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-curb">
            {reports.map((r) => (
              <tr key={r.id} className="align-top hover:bg-concrete/40">
                <td className="px-4 py-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/api${r.image_url}`}
                    alt={`Photo for report ${r.id}`}
                    className="h-16 w-24 rounded-md object-cover"
                  />
                </td>
                <td className="px-4 py-3">
                  <p className="font-bold">#{r.id}</p>
                  <p className="text-muted">{r.description ?? "No description"}</p>
                </td>
                <td className="px-4 py-3">
                  <SeverityBadge report={r} />
                </td>
                <td className="hidden px-4 py-3 tabular-nums text-muted md:table-cell">
                  {r.max_confidence != null ? `${Math.round(r.max_confidence * 100)}%` : "–"}
                </td>
                <td className="hidden px-4 py-3 lg:table-cell">
                  <a
                    href={`https://www.openstreetmap.org/?mlat=${r.latitude}&mlon=${r.longitude}#map=17/${r.latitude}/${r.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold text-sign underline-offset-2 hover:underline"
                  >
                    View on map
                  </a>
                  <p className="text-xs tabular-nums text-muted">
                    {r.latitude.toFixed(4)}, {r.longitude.toFixed(4)}
                  </p>
                </td>
                <td className="hidden px-4 py-3 text-muted md:table-cell">
                  {new Date(r.created_at).toLocaleString("en-US", {
                    timeZone: CITY_TZ,
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </td>
              </tr>
            ))}
            {reports.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-muted">
                  No reports yet. New reports from the{" "}
                  <Link href="/report" className="font-semibold text-sign hover:underline">
                    Report damage
                  </Link>{" "}
                  page show up here.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </main>
  );
}
