export type ReportStatus = "pending" | "scored" | "failed";

export interface Report {
  id: number;
  image_filename: string;
  latitude: number;
  longitude: number;
  description: string | null;
  status: ReportStatus;
  severity: number | null;
  damage_types: string[] | null;
  damage_area_ratio: number | null;
  num_detections: number | null;
  max_confidence: number | null;
  needs_review: boolean;
  model_version: string | null;
  created_at: string;
  image_url: string;
}
