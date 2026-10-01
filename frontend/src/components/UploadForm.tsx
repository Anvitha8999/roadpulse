"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

type FormStatus = "idle" | "submitting" | "error";

export default function UploadForm() {
  const router = useRouter();
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [status, setStatus] = useState<FormStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  function fillMyLocation() {
    if (!navigator.geolocation) {
      setError("Your browser doesn't support location. Enter coordinates manually.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude.toFixed(5));
        setLongitude(pos.coords.longitude.toFixed(5));
        setError(null);
      },
      () => setError("Couldn't get your location. Enter coordinates manually."),
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setStatus("submitting");
    setError(null);

    const res = await fetch("/api/reports", { method: "POST", body: formData });
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setError(
        typeof body?.detail === "string"
          ? body.detail
          : "Upload failed. Check the photo and coordinates, then try again.",
      );
      setStatus("error");
      return;
    }

    router.push("/");
    router.refresh();
  }

  const inputClass =
    "mt-1 w-full rounded-md border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400";

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-lg border bg-white p-6">
      <label className="block text-sm font-medium">
        Photo of the damage
        <input
          name="image"
          type="file"
          accept="image/jpeg,image/png"
          required
          className="mt-1 block w-full text-sm"
        />
        <span className="mt-1 block text-xs text-slate-500">JPEG or PNG.</span>
      </label>

      <div className="grid grid-cols-2 gap-4">
        <label className="block text-sm font-medium">
          Latitude
          <input
            name="latitude"
            type="number"
            step="any"
            min={-90}
            max={90}
            required
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="block text-sm font-medium">
          Longitude
          <input
            name="longitude"
            type="number"
            step="any"
            min={-180}
            max={180}
            required
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
            className={inputClass}
          />
        </label>
      </div>

      <button
        type="button"
        onClick={fillMyLocation}
        className="rounded-md border px-3 py-1.5 text-sm hover:bg-slate-100"
      >
        Use my location
      </button>

      <label className="block text-sm font-medium">
        Description (optional)
        <textarea
          name="description"
          maxLength={500}
          rows={3}
          placeholder="e.g. Deep crack across the bike lane near 16th St"
          className={inputClass}
        />
      </label>

      {error && (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
      >
        {status === "submitting" ? "Submitting…" : "Submit report"}
      </button>
    </form>
  );
}
