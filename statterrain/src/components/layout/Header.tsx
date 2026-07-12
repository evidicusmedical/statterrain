"use client";

import { product } from "@/config/product";
import type { SearchLocation } from "@/data/demo-region";
import { FeedbackButton } from "@/components/feedback/FeedbackButton";
import { LocationSearchBox } from "@/components/search/LocationSearchBox";
import type { LocationSearchResult } from "@/lib/geocoding/searchLocation";

interface HeaderProps {
  location: SearchLocation;
  radiusMiles: number;
  selectedFacilityName?: string | null;
  selectedFacilityType?: string | null;
  activeMobileTab?: string;
  summaryOpen: boolean;
  onSelectLocation: (loc: SearchLocation) => void;
  searchStatusMessage: string;
  onLocationSearchStart: () => void;
  onLocationSearchComplete: (result: LocationSearchResult) => void;
  onLocationSearchClear: () => void;
  onGenerateBrief: () => void;
  onOpenFilters: () => void;
}

export function Header({
  location,
  radiusMiles,
  selectedFacilityName,
  selectedFacilityType,
  activeMobileTab,
  summaryOpen,
  onSelectLocation: _onSelectLocation,
  searchStatusMessage,
  onLocationSearchStart,
  onLocationSearchComplete,
  onLocationSearchClear,
  onGenerateBrief,
  onOpenFilters,
}: HeaderProps) {
  void _onSelectLocation;


  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="flex flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
        <button
          type="button"
          onClick={onOpenFilters}
          className="inline-flex items-center justify-center rounded-md border border-slate-300 p-2 text-slate-600 hover:bg-slate-50 lg:hidden"
          aria-label="Open filters"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden
          >
            <path
              d="M4 6h16M7 12h10M10 18h4"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <div className="flex items-center gap-2.5">
          <svg
            width="30"
            height="30"
            viewBox="0 0 40 40"
            aria-hidden
            className="text-terrain-600"
          >
            <circle
              cx="20"
              cy="20"
              r="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
              opacity="0.35"
            />
            <circle
              cx="20"
              cy="20"
              r="12"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
              opacity="0.55"
            />
            <circle cx="20" cy="20" r="3.4" fill="currentColor" />
            <path
              d="M20 6v6M20 28v6M6 20h6M28 20h6"
              stroke="currentColor"
              strokeWidth="1.4"
              opacity="0.5"
            />
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

        <div className="relative ml-0 min-w-[260px] flex-1 sm:ml-4">
          <LocationSearchBox
            radiusMiles={radiusMiles}
            statusMessage={searchStatusMessage}
            onSearchStart={onLocationSearchStart}
            onSearchComplete={onLocationSearchComplete}
            onClear={onLocationSearchClear}
          />
        </div>

        <FeedbackButton
          className="inline-flex text-xs md:text-sm"
          context={{
            locationLabel: location.label,
            radiusMiles,
            facilityLabel: selectedFacilityName,
            facilityTypeLabel: selectedFacilityType,
            activeMobileTab,
            summaryState: summaryOpen ? "shown" : "hidden",
          }}
        />

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
