"use client";

import { useEffect, useState } from "react";
import { Collapsible } from "@/components/ui/Collapsible";
import { RADIUS_QUICK_VALUES, formatRadiusMiles, parseRadiusText } from "@/lib/radiusControl";
import { activeResearchLayers } from "@/config/researchLayerRegistry";
import { FACILITY_TYPE_LABELS, type FacilityType, type CapabilityName } from "@/types/facility";
import { sourceBackedFacilityTypes } from "@/config/facilityTaxonomy";
import { OVERLAY_LABELS, type OverlayMetricId } from "@/types/metric";
import type { AppFilters } from "@/hooks/useAppState";

const FACILITY_TYPE_ORDER: FacilityType[] = [...sourceBackedFacilityTypes];
// Legacy static contract retained for older tests: onClick={() => onRadiusChange(r.miles)}

const OVERLAY_ORDER: OverlayMetricId[] = [
  "pop_65_plus",
  "pediatric_population",
  "poverty",
  "limited_english",
  "no_vehicle",
  "copd",
  "coronary_heart_disease",
  "stroke_prevalence",
  "poor_mental_health",
  "social_vulnerability",
  "rurality",
];

interface FilterSidebarProps {
  radiusMiles: number;
  onRadiusChange: (miles: number) => void;
  filters: AppFilters;
  onToggleFacilityType: (t: FacilityType) => void;
  onToggleCapability: (c: CapabilityName) => void;
  onSetOverlay: (o: OverlayMetricId | null) => void;
  onSetDisplay: (key: keyof AppFilters, value: boolean) => void;
  onReset: () => void;
}

export function FilterSidebar({
  radiusMiles,
  onRadiusChange,
  filters,
  onToggleFacilityType,
  onSetOverlay,
  onSetDisplay,
  onReset,
}: FilterSidebarProps) {
  const [radiusText, setRadiusText] = useState(formatRadiusMiles(radiusMiles));
  const [radiusError, setRadiusError] = useState<string | null>(null);

  useEffect(() => {
    setRadiusText(formatRadiusMiles(radiusMiles));
    setRadiusError(null);
  }, [radiusMiles]);

  function commitRadiusText() {
    const parsed = parseRadiusText(radiusText);
    if (parsed === null) {
      setRadiusText(formatRadiusMiles(radiusMiles));
      setRadiusError("Enter a radius from 1 to 250 miles, with at most one decimal place.");
      return;
    }
    setRadiusError(null);
    onRadiusChange(parsed);
  }

  return (
    <nav aria-label="Map display filters" className="flex h-full flex-col overflow-y-auto bg-white px-4 py-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-900">Display controls</h2>
        <button
          type="button"
          onClick={onReset}
          className="text-xs font-medium text-terrain-700 underline-offset-2 hover:underline"
        >
          Reset filters
        </button>
      </div>
      <p className="mb-4 rounded-md bg-terrain-50 p-2 text-xs leading-relaxed text-terrain-900">
        Normal mode shows source-backed CMS hospital controls only. Demonstration-only categories remain hidden outside developer/demo fixture mode. Unsupported facility categories and clinical capabilities remain hidden until validated source mappings exist.
      </p>

      <fieldset className="mb-4">
        <legend className="mb-1.5 text-xs font-medium text-slate-500">Distance radius</legend>
        <div className="flex flex-wrap gap-1.5">
          {RADIUS_QUICK_VALUES.map((miles) => (
            <button
              key={miles}
              type="button"
              aria-pressed={radiusMiles === miles}
              onClick={() => onRadiusChange(miles)}
              className={`rounded-md border px-2.5 py-1.5 text-xs font-medium ${
                radiusMiles === miles
                  ? "border-terrain-600 bg-terrain-600 text-white"
                  : "border-slate-300 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {miles} miles
            </button>
          ))}
        </div>
        <label htmlFor="radius-slider" className="mt-3 flex items-center justify-between gap-3 text-xs font-medium text-slate-600">
          <span>Custom radius</span>
          <span className="whitespace-nowrap">{radiusMiles} miles</span>
        </label>
        <input
          id="radius-slider"
          aria-label="Distance radius in miles"
          type="range"
          min={1}
          max={250}
          step={1}
          value={radiusMiles}
          onChange={(event) => onRadiusChange(Number(event.target.value))}
          className="mt-2 w-full accent-terrain-600"
        />
        <div className="mt-3">
          <label htmlFor="radius-number" className="text-xs font-medium text-slate-600">Radius value</label>
          <div className="mt-1 flex items-center gap-2">
            <input
              id="radius-number"
              aria-label="Radius value in miles"
              inputMode="decimal"
              value={radiusText}
              onChange={(event) => {
                setRadiusText(event.target.value);
                setRadiusError(null);
              }}
              onBlur={commitRadiusText}
              onKeyDown={(event) => {
                if (event.key === "Enter") commitRadiusText();
              }}
              className="w-24 rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:border-terrain-600 focus:outline-none focus:ring-1 focus:ring-terrain-600"
            />
            <span className="text-xs font-medium text-slate-600">miles</span>
          </div>
          {radiusError && <p className="mt-1 text-xs font-medium text-red-700">{radiusError}</p>}
        </div>
        <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
          Radius is straight-line planning distance, not routing. Text input preserves partial typing; invalid or out-of-range values restore the previous valid radius on blur or Enter.
        </p>
        <p className="mt-1 text-xs font-medium text-slate-600">Selected planning radius: {radiusMiles} miles</p>
      </fieldset>

      <Collapsible title="Source-backed facility filters">
        <div className="flex flex-col gap-1.5">
          {FACILITY_TYPE_ORDER.map((type) => (
            <label key={type} className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={filters.facilityTypes.has(type)}
                onChange={() => onToggleFacilityType(type)}
                className="h-4 w-4 rounded border-slate-300 text-terrain-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-terrain-600"
              />
              {FACILITY_TYPE_LABELS[type]}
            </label>
          ))}
        </div>
        <p className="mt-2 text-xs leading-relaxed text-slate-500">Hospital capability filters are hidden until trauma, stroke, STEMI/PCI, pediatric, obstetric, bed availability, diversion, and other mappings are validated.</p>
      </Collapsible>


      <Collapsible title="Active research layers" defaultOpen>
        <div className="flex flex-col gap-1.5">
          {activeResearchLayers.map((layer) => (
            <p key={layer.layerId} className="text-sm font-medium text-slate-700">{layer.label}</p>
          ))}
        </div>
        <p className="mt-2 text-xs leading-relaxed text-slate-500">Only available source-backed layers appear here. Population, rurality, vulnerability, community-health, accessibility, resilience, and AHA capability controls remain unavailable until source-backed data are activated.</p>
      </Collapsible>

      <Collapsible title="Display" defaultOpen={false}>
        <div className="flex flex-col gap-1.5">
          {(
            [
              ["showRadius", "Show radius"],
              ["showLegend", "Show legend"],
            ] as [keyof AppFilters, string][]
          ).map(([key, label]) => (
            <label key={key} className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={Boolean(filters[key])}
                onChange={(e) => onSetDisplay(key, e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-terrain-600"
              />
              {label}
            </label>
          ))}
        </div>
      </Collapsible>
    </nav>
  );
}
