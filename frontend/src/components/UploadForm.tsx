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
    "mt-1.5 w-full rounded-lg border border-curb bg-white px-3 py-2 text-sm font-normal focus:border-sign focus:outline-none";

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border border-curb bg-white p-6">
      <label className="block text-sm font-semibold">
        Photo of the damage
        <input
          name="image"
          type="file"
          accept="image/jpeg,image/png"
          required
          className="mt-1.5 block w-full text-sm font-normal file:mr-3 file:rounded-lg file:border-0 file:bg-asphalt file:px-3 file:py-2 file:font-semibold file:text-white hover:file:bg-ink"
        />
        <span className="mt-1 block text-xs font-normal text-muted">JPEG or PNG. A close, well-lit shot of the damage scores best.</span>
      </label>

      <div className="grid grid-cols-2 gap-4">
        <label className="block text-sm font-semibold">
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
        <label className="block text-sm font-semibold">
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
        className="rounded-lg border border-curb px-3 py-1.5 text-sm font-semibold hover:border-sign hover:text-sign"
      >
        Use my location
      </button>

      <label className="block text-sm font-semibold">
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
        <p role="alert" className="rounded-lg border-l-4 border-sev-5 bg-sev-5/10 px-3 py-2 text-sm">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full rounded-lg bg-sign px-4 py-2.5 text-sm font-bold text-white hover:bg-sign-dark disabled:opacity-50 sm:w-auto"
      >
        {status === "submitting" ? "Submitting…" : "Submit report"}
      </button>
    </form>
  );
}
