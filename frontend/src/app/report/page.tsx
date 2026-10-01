import UploadForm from "@/components/UploadForm";

export const metadata = { title: "Report damage · RoadPulse" };

export default function ReportPage() {
  return (
    <main className="mx-auto max-w-xl space-y-4 px-4 py-8">
      <div>
        <h1 className="text-2xl font-semibold">Report road damage</h1>
        <p className="text-sm text-slate-600">
          Upload a photo and its location. Our model scores the damage within seconds, and city
          staff review the results.
        </p>
      </div>
      <UploadForm />
    </main>
  );
}
