import UploadForm from "@/components/UploadForm";

export const metadata = { title: "Report damage | RoadPulse" };

export default function ReportPage() {
  return (
    <main className="mx-auto max-w-xl space-y-6 px-4 py-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Report road damage</h1>
        <p className="mt-1 text-muted">
          Add a photo and where it was taken. The damage is scored within seconds and city staff
          review it on the dashboard.
        </p>
      </div>
      <UploadForm />
    </main>
  );
}
