"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto max-w-xl px-4 py-16">
      <div className="rounded-xl border-l-4 border-sev-5 bg-white p-6">
        <h1 className="text-xl font-extrabold">Reports can&apos;t load right now</h1>
        <p className="mt-1 text-muted">
          The RoadPulse API isn&apos;t responding. Check that the back end is running, then try
          again.
        </p>
        <button
          onClick={reset}
          className="mt-5 rounded-lg bg-sign px-4 py-2 text-sm font-bold text-white hover:bg-sign-dark"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
