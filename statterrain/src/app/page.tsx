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
import { useState } from "react";

type MobileTab = "map" | "summary" | "detail";

export default function HomePage() {
  const state = useAppState();
  const [mobileTab, setMobileTab] = useState<MobileTab>("map");

  return (
    <div className="flex h-screen flex-col">
      <Header
        location={state.location}
        onSelectLocation={state.setLocation}
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
            onSetOverlay={(o) => state.setFilters((prev) => ({ ...prev, overlay: o }))}
            onSetConfidence={(c) => state.setFilters((prev) => ({ ...prev, confidence: c }))}
            onSetDisplay={(key, value) => state.setFilters((prev) => ({ ...prev, [key]: value }))}
            onReset={state.resetFilters}
          />
        </aside>

        <main className="flex min-h-0 flex-1 flex-col lg:flex-row">
          <section
            className={`min-h-0 flex-1 ${mobileTab === "map" ? "block" : "hidden"} lg:block`}
            aria-label="Map"
          >
            <MapViewClient
              location={state.location}
              radiusMiles={state.radiusMiles}
              facilities={state.visibleFacilities}
              overlay={state.filters.overlay}
              showRadius={state.filters.showRadius}
              showLegend={state.filters.showLegend}
              showLabels={state.filters.showLabels}
              selectedFacilityId={state.selectedFacility?.id ?? null}
              onSelectFacility={state.selectFacility}
            />
          </section>

          <section
            className={`min-h-0 w-full overflow-y-auto border-l border-slate-200 lg:block lg:w-[380px] ${
              mobileTab === "summary" ? "block" : "hidden"
            }`}
            aria-label="Regional summary"
          >
            <RegionalSummaryPanel facilities={state.visibleFacilities} />
          </section>

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
      >
        {(
          [
            ["map", "Map"],
            ["summary", "Summary"],
            ["detail", "Facility"],
          ] as [MobileTab, string][]
        ).map(([tab, label]) => (
          <button
            key={tab}
            type="button"
            onClick={() => setMobileTab(tab)}
            aria-current={mobileTab === tab}
            className={`flex-1 px-3 py-2.5 text-sm font-medium ${
              mobileTab === tab ? "border-t-2 border-terrain-600 text-terrain-700" : "text-slate-500"
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
          onSetOverlay={(o) => state.setFilters((prev) => ({ ...prev, overlay: o }))}
          onSetConfidence={(c) => state.setFilters((prev) => ({ ...prev, confidence: c }))}
          onSetDisplay={(key, value) => state.setFilters((prev) => ({ ...prev, [key]: value }))}
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
        }}
      />
    </div>
  );
}
