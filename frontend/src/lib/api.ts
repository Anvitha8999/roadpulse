import type { Report } from "./types";

const API_URL = process.env.API_URL ?? "http://localhost:8000";

export async function getReports(sort: "newest" | "severity"): Promise<Report[]> {
  const res = await fetch(`${API_URL}/reports?sort=${sort}&limit=100`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load reports: ${res.status}`);
  }
  return res.json();
}
