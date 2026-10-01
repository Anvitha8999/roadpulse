"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto max-w-6xl px-4 py-16 text-center">
      <h1 className="text-xl font-semibold">Couldn&apos;t load reports</h1>
      <p className="mt-2 text-slate-600">The RoadPulse API may be down. Try again in a moment.</p>
      <button
        onClick={reset}
        className="mt-6 rounded-md bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-700"
      >
        Retry
      </button>
    </main>
  );
}
