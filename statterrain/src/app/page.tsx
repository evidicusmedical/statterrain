"use client";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FilterSidebar } from "@/components/filters/FilterSidebar";
import { MapViewClient } from "@/components/map/MapViewClient";
import { FacilityDetailPanel } from "@/components/facilities/FacilityDetailPanel";
import { RegionalSummaryPanel } from "@/components/regional-summary/RegionalSummaryPanel";
import { EvidenceBriefDrawer } from "@/components/evidence/EvidenceBriefDrawer";
import { Drawer } from "@/components/ui/Drawer";
import { useAppState } from "@/hooks/useAppState";
import { useCallback, useState } from "react";
import type { SearchLocation } from "@/data/demo-region";

type MobileTab = "map" | "summary" | "detail";

export default function HomePage() {
  const state = useAppState();
  const [mobileTab, setMobileTab] = useState<MobileTab>("map");
  const [summaryOpen, setSummaryOpen] = useState(true);
  const handleSelectLocation = useCallback(
    (location: SearchLocation) => {
      state.setLocation(location);
      state.resetFilters();
      state.clearSelectedFacility();
    },
    [state],
  );
  const handleSelectFacility = useCallback(
    (facilityId: string) => {
      state.selectFacility(facilityId);
      setMobileTab("detail");
    },
    [state],
  );

  return (
    <div className="flex h-screen flex-col">
      <Header
        location={state.location}
        onSelectLocation={handleSelectLocation}
        onGenerateBrief={() => state.setBriefOpen(true)}
        onOpenFilters={() => state.setMobileFiltersOpen(true)}
      />

      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-72 shrink-0 border-r border-slate-200 lg:block">
          <FilterSidebar
            radiusMiles={state.radiusMiles}
            onRadiusChange={state.setRadiusMiles}
            filters={state.filters}
            onToggleFacilityType={state.toggleFacilityType}
            onToggleCapability={state.toggleCapability}
            onSetOverlay={(o) =>
              state.setFilters((prev) => ({ ...prev, overlay: o }))
            }
            onSetConfidence={(c) =>
              state.setFilters((prev) => ({ ...prev, confidence: c }))
            }
            onSetDisplay={(key, value) =>
              state.setFilters((prev) => ({ ...prev, [key]: value }))
            }
            onReset={state.resetFilters}
          />
        </aside>

        <main className="flex min-h-0 flex-1 flex-col lg:flex-row">
          <section
            className={`relative min-h-[55vh] flex-1 ${mobileTab === "map" ? "block" : "hidden"} lg:block lg:min-h-0`}
            aria-label="Map"
          >
            <div className="absolute right-2 top-2 z-[800] max-w-[calc(100%-1rem)] rounded-lg border border-slate-200 bg-white/95 p-1.5 shadow-sm backdrop-blur sm:right-3 sm:top-3 sm:p-2">
              <button
                type="button"
                onClick={() => setSummaryOpen((open) => !open)}
                className="min-h-10 rounded-md bg-terrain-700 px-2.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-terrain-800 focus:outline-none focus:ring-2 focus:ring-terrain-500 focus:ring-offset-2 sm:min-h-11 sm:px-3 sm:py-2 sm:text-sm"
                aria-expanded={summaryOpen}
                aria-controls="regional-summary-panel"
              >
                {summaryOpen ? "Hide summary" : "Show summary"}
              </button>
              <p className="mt-1 hidden text-[11px] text-slate-600 sm:block">
                {summaryOpen
                  ? "Hide summary to enlarge the map."
                  : "Show summary to review facilities and population context."}
              </p>
            </div>
            <MapViewClient
              location={state.location}
              radiusMiles={state.radiusMiles}
              facilities={state.visibleFacilities}
              overlay={state.filters.overlay}
              showRadius={state.filters.showRadius}
              showLegend={state.filters.showLegend}
              showLabels={state.filters.showLabels}
              selectedFacilityId={state.selectedFacility?.id ?? null}
              onSelectFacility={handleSelectFacility}
            />
          </section>

          {summaryOpen && (
            <section
              id="regional-summary-panel"
              className={`min-h-0 w-full overflow-y-auto border-l border-slate-200 lg:block lg:w-[380px] ${
                mobileTab === "summary" ? "block" : "hidden"
              }`}
              aria-label="Regional summary"
            >
              <RegionalSummaryPanel facilities={state.visibleFacilities} />
            </section>
          )}

          <section
            className={`min-h-0 w-full overflow-y-auto border-l border-slate-200 lg:block lg:w-[380px] ${
              mobileTab === "detail" ? "block" : "hidden"
            }`}
            aria-label="Facility detail"
          >
            <FacilityDetailPanel facility={state.selectedFacility} />
          </section>
        </main>
      </div>

      <nav
        className="flex border-t border-slate-200 bg-white lg:hidden"
        aria-label="Mobile view switcher"
        data-testid="mobile-workspace-tabs"
      >
        {(
          [
            ["map", "Map"],
            ["summary", summaryOpen ? "Summary" : "Show summary"],
            ["detail", "Facility"],
          ] as [MobileTab, string][]
        ).map(([tab, label]) => (
          <button
            key={tab}
            type="button"
            onClick={() => {
              if (tab === "summary" && !summaryOpen) setSummaryOpen(true);
              setMobileTab(tab);
            }}
            aria-current={mobileTab === tab}
            data-testid={`mobile-tab-${tab}`}
            className={`min-h-11 flex-1 px-3 py-2.5 text-sm font-medium ${
              mobileTab === tab
                ? "border-t-2 border-terrain-600 text-terrain-700"
                : "text-slate-500"
            }`}
          >
            {label}
          </button>
        ))}
      </nav>

      <Footer />

      <Drawer
        open={state.mobileFiltersOpen}
        onClose={() => state.setMobileFiltersOpen(false)}
        title="Filters"
        side="left"
      >
        <FilterSidebar
          radiusMiles={state.radiusMiles}
          onRadiusChange={state.setRadiusMiles}
          filters={state.filters}
          onToggleFacilityType={state.toggleFacilityType}
          onToggleCapability={state.toggleCapability}
          onSetOverlay={(o) =>
            state.setFilters((prev) => ({ ...prev, overlay: o }))
          }
          onSetConfidence={(c) =>
            state.setFilters((prev) => ({ ...prev, confidence: c }))
          }
          onSetDisplay={(key, value) =>
            state.setFilters((prev) => ({ ...prev, [key]: value }))
          }
          onReset={state.resetFilters}
        />
      </Drawer>

      <EvidenceBriefDrawer
        open={state.briefOpen}
        onClose={() => state.setBriefOpen(false)}
        context={{
          locationLabel: state.location.label,
          radiusMiles: state.radiusMiles,
          filters: state.filters,
          visibleFacilities: state.visibleFacilities,
          briefFacilities: state.facilitiesInRadius,
        }}
      />
    </div>
  );
}
