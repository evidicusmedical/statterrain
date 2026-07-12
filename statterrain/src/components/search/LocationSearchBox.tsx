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
        message: "Search by full address, city and state, ZIP code, or coordinates.",
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
      className="flex w-full flex-col gap-1"
      aria-label="Primary planning location search"
      data-testid="location-search-form"
    >
      <label htmlFor="global-search" className="sr-only">
        Search by full address, city and state, ZIP code, or coordinates
      </label>
      <div className="flex min-w-0 flex-1 gap-2">
        <input
          id="global-search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          type="search"
          autoComplete="off"
          placeholder="Search by full address, city and state, ZIP code, or coordinates."
          data-testid="location-search-input"
          className="min-h-10 min-w-[26rem] w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-terrain-600"
        />
        <button
          type="submit"
          data-testid="location-search-submit"
          disabled={loading}
          className="min-h-10 rounded-md bg-terrain-700 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {loading ? "Searching…" : "Search"}
        </button>
        <button
          type="button"
          onClick={() => {
            setQuery("");
            onClear();
          }}
          className="min-h-10 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700"
        >
          Clear
        </button>
      </div>
      <p className="text-xs font-medium text-slate-700" role="status" data-testid="location-search-status">
        {statusMessage} Selected planning radius remains {radiusMiles} miles. Search is session-only and not stored.
      </p>
    </form>
  );
}
