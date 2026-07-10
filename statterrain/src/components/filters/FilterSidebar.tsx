"use client";

import { Collapsible } from "@/components/ui/Collapsible";
import { radiusOptions } from "@/data/demo-region";
import { FACILITY_TYPE_LABELS, CAPABILITY_LABELS, type FacilityType, type CapabilityName } from "@/types/facility";
import { OVERLAY_LABELS, type OverlayMetricId } from "@/types/metric";
import type { AppFilters, ConfidenceFilter } from "@/hooks/useAppState";

const FACILITY_TYPE_ORDER: FacilityType[] = [
  "hospital",
  "critical_access_hospital",
  "pharmacy",
  "dialysis",
  "nursing_home",
  "behavioral_health",
];

const CAPABILITY_ORDER: CapabilityName[] = [
  "trauma_level_i",
  "trauma_level_ii",
  "trauma_level_iii",
  "pediatric_trauma",
  "burn_center",
  "acute_stroke_ready",
  "primary_stroke_center",
  "thrombectomy_capable",
  "comprehensive_stroke_center",
  "stemi_pci",
  "pediatric_emergency",
  "obstetric_capability",
];

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
  onSetConfidence: (c: ConfidenceFilter) => void;
  onSetDisplay: (key: keyof AppFilters, value: boolean) => void;
  onReset: () => void;
}

export function FilterSidebar({
  radiusMiles,
  onRadiusChange,
  filters,
  onToggleFacilityType,
  onToggleCapability,
  onSetOverlay,
  onSetConfidence,
  onSetDisplay,
  onReset,
}: FilterSidebarProps) {
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
        Display filters change what appears on the map. The evidence brief includes all available
        facility categories in the selected geography unless brief scope is explicitly changed.
      </p>

      <fieldset className="mb-4">
        <legend className="mb-1.5 text-xs font-medium text-slate-500">Distance radius</legend>
        <div className="flex flex-wrap gap-1.5">
          {radiusOptions.map((r) => (
            <button
              key={r.id}
              type="button"
              aria-pressed={radiusMiles === r.miles}
              onClick={() => onRadiusChange(r.miles)}
              className={`rounded-md border px-2.5 py-1.5 text-xs font-medium ${
                radiusMiles === r.miles
                  ? "border-terrain-600 bg-terrain-600 text-white"
                  : "border-slate-300 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {r.label}
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
        <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
          Use smaller radii such as 10 miles in dense metro areas. Radius is straight-line planning distance, not routing.
        </p>
        <p className="mt-1 text-xs font-medium text-slate-600">Selected planning radius: {radiusMiles} miles</p>
      </fieldset>

      <Collapsible title="Facility display filters">
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
      </Collapsible>

      <Collapsible title="Hospital capabilities" defaultOpen={false}>
        <div className="flex flex-col gap-1.5">
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={filters.capabilities.size === 0}
              onChange={() => {
                CAPABILITY_ORDER.forEach((c) => {
                  if (filters.capabilities.has(c)) onToggleCapability(c);
                });
              }}
              className="h-4 w-4 rounded border-slate-300 text-terrain-600"
            />
            Any trauma center / any capability
          </label>
          {CAPABILITY_ORDER.map((cap) => (
            <label key={cap} className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={filters.capabilities.has(cap)}
                onChange={() => onToggleCapability(cap)}
                className="h-4 w-4 rounded border-slate-300 text-terrain-600"
              />
              {CAPABILITY_LABELS[cap]}
            </label>
          ))}
        </div>
      </Collapsible>

      <Collapsible title="Population-health overlay" defaultOpen={false}>
        <div className="flex flex-col gap-1.5">
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="radio"
              name="overlay"
              checked={filters.overlay === null}
              onChange={() => onSetOverlay(null)}
              className="h-4 w-4 border-slate-300 text-terrain-600"
            />
            None
          </label>
          {OVERLAY_ORDER.map((o) => (
            <label key={o} className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="radio"
                name="overlay"
                checked={filters.overlay === o}
                onChange={() => onSetOverlay(o)}
                className="h-4 w-4 border-slate-300 text-terrain-600"
              />
              {OVERLAY_LABELS[o]}
            </label>
          ))}
        </div>
      </Collapsible>

      <Collapsible title="Source confidence display" defaultOpen={false}>
        <div className="flex flex-col gap-1.5">
          {(
            [
              ["high", "High confidence only"],
              ["high_medium", "High and medium confidence"],
              ["all", "Include all demonstration records"],
            ] as [ConfidenceFilter, string][]
          ).map(([value, label]) => (
            <label key={value} className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="radio"
                name="confidence"
                checked={filters.confidence === value}
                onChange={() => onSetConfidence(value)}
                className="h-4 w-4 border-slate-300 text-terrain-600"
              />
              {label}
            </label>
          ))}
        </div>
      </Collapsible>

      <Collapsible title="Display" defaultOpen={false}>
        <div className="flex flex-col gap-1.5">
          {(
            [
              ["showRadius", "Show radius"],
              ["showLegend", "Show legend"],
              ["showLabels", "Show facility labels"],
              ["showFreshness", "Show freshness badges"],
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
