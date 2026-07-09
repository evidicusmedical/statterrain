"use client";

import { useMemo, useState } from "react";
import { product } from "@/config/product";
import { searchLocations, type SearchLocation } from "@/data/demo-region";
import { SyntheticBadge } from "@/components/ui/Badge";
import { FeedbackButton } from "@/components/feedback/FeedbackButton";

interface HeaderProps {
  location: SearchLocation;
  onSelectLocation: (loc: SearchLocation) => void;
  onGenerateBrief: () => void;
  onOpenFilters: () => void;
}

export function Header({ location, onSelectLocation, onGenerateBrief, onOpenFilters }: HeaderProps) {
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    const pool = q.length === 0 ? searchLocations : searchLocations.filter((l) => l.label.toLowerCase().includes(q));
    return pool.slice(0, 6);
  }, [query]);

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="flex flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
        <button
          type="button"
          onClick={onOpenFilters}
          className="inline-flex items-center justify-center rounded-md border border-slate-300 p-2 text-slate-600 hover:bg-slate-50 lg:hidden"
          aria-label="Open filters"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M4 6h16M7 12h10M10 18h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        <div className="flex items-center gap-2.5">
          <svg width="30" height="30" viewBox="0 0 40 40" aria-hidden className="text-terrain-600">
            <circle cx="20" cy="20" r="18" fill="none" stroke="currentColor" strokeWidth="1.4" opacity="0.35" />
            <circle cx="20" cy="20" r="12" fill="none" stroke="currentColor" strokeWidth="1.4" opacity="0.55" />
            <circle cx="20" cy="20" r="3.4" fill="currentColor" />
            <path d="M20 6v6M20 28v6M6 20h6M28 20h6" stroke="currentColor" strokeWidth="1.4" opacity="0.5" />
          </svg>
          <div className="leading-tight">
            <div className="flex items-center gap-2">
              <span className="font-mono text-base font-semibold tracking-tight text-slate-900">
                {product.name}
              </span>
              <span className="rounded border border-slate-300 bg-slate-50 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-500">
                {product.prototypeVersion}
              </span>
            </div>
            <p className="text-xs text-slate-500">{product.tagline}</p>
          </div>
        </div>

        <div className="relative ml-0 min-w-[220px] flex-1 sm:ml-4">
          <label htmlFor="global-search" className="sr-only">
            Search hospital, city, ZIP, county, or address
          </label>
          <input
            id="global-search"
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            placeholder={`Search: ${location.label}`}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-terrain-600"
          />
          {showSuggestions && suggestions.length > 0 && (
            <ul
              role="listbox"
              className="absolute z-20 mt-1 w-full overflow-hidden rounded-md border border-slate-200 bg-white shadow-panel"
            >
              {suggestions.map((loc) => (
                <li key={loc.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={loc.id === location.id}
                    onClick={() => {
                      onSelectLocation(loc);
                      setQuery("");
                      setShowSuggestions(false);
                    }}
                    className="flex w-full items-center justify-between px-3 py-2 text-left text-sm text-slate-700 hover:bg-terrain-50"
                  >
                    <span>{loc.label}</span>
                    <span className="text-xs uppercase text-slate-400">{loc.kind}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="hidden items-center gap-2 text-xs text-slate-500 md:flex">
          <span className="h-2 w-2 rounded-full bg-terrain-500" aria-hidden />
          Synthetic demonstration data — not real-world
        </div>

        <SyntheticBadge />

        <FeedbackButton className="hidden md:inline-flex" />

        <button
          type="button"
          onClick={onGenerateBrief}
          className="whitespace-nowrap rounded-md bg-terrain-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-terrain-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terrain-600"
        >
          Generate Evidence Brief
        </button>
      </div>
    </header>
  );
}
