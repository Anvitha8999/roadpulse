import Link from "next/link";
import AutoRefresh from "@/components/AutoRefresh";
import SeverityBadge from "@/components/SeverityBadge";
import { getReports } from "@/lib/api";

export const dynamic = "force-dynamic";

const CITY_TZ = "America/Los_Angeles";

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
  const stats = [
    { label: "Total reports", value: reports.length },
    { label: "Average severity", value: avgSeverity },
    { label: "Critical (severity 5)", value: scored.filter((r) => r.severity === 5).length },
    { label: "Needs review", value: reports.filter((r) => r.needs_review).length },
  ];
  const hasPending = reports.some((r) => r.status === "pending");

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <AutoRefresh active={hasPending} />

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Road damage reports</h1>
          <p className="text-sm text-slate-600">
            Scored automatically by a YOLO segmentation model. Low-confidence results are flagged
            for staff review.
          </p>
        </div>
        <div className="flex gap-2 text-sm">
          {(["newest", "severity"] as const).map((option) => (
            <Link
              key={option}
              href={`/?sort=${option}`}
              className={`rounded-md border px-3 py-1.5 ${
                sort === option
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "bg-white hover:bg-slate-100"
              }`}
            >
              {option === "newest" ? "Newest first" : "Most severe first"}
            </Link>
          ))}
        </div>
      </div>

      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg border bg-white p-4">
            <p className="text-sm text-slate-600">{s.label}</p>
            <p className="mt-1 text-2xl font-semibold">{s.value}</p>
          </div>
        ))}
      </section>

      <section className="overflow-x-auto rounded-lg border bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3 font-medium">Photo</th>
              <th className="px-4 py-3 font-medium">Report</th>
              <th className="px-4 py-3 font-medium">Severity</th>
              <th className="px-4 py-3 font-medium">Model confidence</th>
              <th className="px-4 py-3 font-medium">Location</th>
              <th className="px-4 py-3 font-medium">Submitted</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {reports.map((r) => (
              <tr key={r.id}>
                <td className="px-4 py-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/api${r.image_url}`}
                    alt={`Report ${r.id}`}
                    className="h-14 w-20 rounded object-cover"
                  />
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium">#{r.id}</p>
                  <p className="text-slate-600">{r.description ?? "No description"}</p>
                </td>
                <td className="px-4 py-3">
                  <SeverityBadge report={r} />
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {r.max_confidence != null ? `${Math.round(r.max_confidence * 100)}%` : "–"}
                </td>
                <td className="px-4 py-3">
                  <a
                    href={`https://www.openstreetmap.org/?mlat=${r.latitude}&mlon=${r.longitude}#map=17/${r.latitude}/${r.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {r.latitude.toFixed(4)}, {r.longitude.toFixed(4)}
                  </a>
                </td>
                <td className="px-4 py-3 text-slate-600">
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
                <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                  No reports yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </main>
  );
}
