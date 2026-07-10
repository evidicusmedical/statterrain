"use client";

import { FormEvent, useState } from "react";
import type { LocationSearchResult } from "@/lib/geocoding/searchLocation";
import { searchLocation } from "@/lib/geocoding/searchLocation";

interface Props {
  radiusMiles: number;
  statusMessage: string;
  onSearchStart: () => void;
  onSearchComplete: (result: LocationSearchResult) => void;
  onClear: () => void;
}

export function LocationSearchBox({
  radiusMiles,
  statusMessage,
  onSearchStart,
  onSearchComplete,
  onClear,
}: Props) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault();
    onSearchStart();
    const clean = query.trim();
    if (!clean) {
      onSearchComplete({
        status: "invalid-input",
        location: null,
        message: "Enter a U.S. address, ZIP code, city/state, or state.",
        matchCount: 0,
      });
      return;
    }
    setLoading(true);
    const result = await searchLocation(clean);
    setLoading(false);
    onSearchComplete(result);
  }
  return (
    <form
      onSubmit={submit}
      className="rounded-lg border border-slate-200 bg-white/95 p-3 text-xs shadow-panel"
      aria-label="U.S. location search"
    >
      <label
        htmlFor="national-location-search"
        className="font-semibold text-slate-900"
      >
        Search U.S. address, ZIP, city/state, or state
      </label>
      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
        <input
          id="national-location-search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          type="search"
          autoComplete="off"
          placeholder="Example: 83702 or Boise, ID"
          className="min-h-10 flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={loading}
          className="min-h-10 rounded-md bg-terrain-700 px-3 py-2 font-semibold text-white disabled:opacity-60"
        >
          {loading ? "Searching…" : "Search"}
        </button>
        <button
          type="button"
          onClick={() => {
            setQuery("");
            onClear();
          }}
          className="min-h-10 rounded-md border border-slate-300 bg-white px-3 py-2 font-semibold text-slate-700"
        >
          Clear
        </button>
      </div>
      <p className="mt-2 text-slate-700" role="status">
        {statusMessage}
      </p>
      <p className="mt-1 text-slate-600">
        Selected planning radius remains {radiusMiles} miles. Search is
        session-only and not stored.
      </p>
    </form>
  );
}
