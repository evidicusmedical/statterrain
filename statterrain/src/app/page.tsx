"use client";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FilterSidebar } from "@/components/filters/FilterSidebar";
import { MapViewClient } from "@/components/map/MapViewClient";
import { FacilityDetailPanel } from "@/components/facilities/FacilityDetailPanel";
import { RegionalSummaryPanel } from "@/components/regional-summary/RegionalSummaryPanel";
import { EvidenceBriefDrawer } from "@/components/evidence/EvidenceBriefDrawer";
import { PlanningScenarioDrawer } from "@/components/scenarios/PlanningScenarioDrawer";
import { PublicDataFreshnessPanel } from "@/components/public-data/PublicDataFreshnessPanel";
import { Drawer } from "@/components/ui/Drawer";
import { useAppState } from "@/hooks/useAppState";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { searchLocations, type SearchLocation } from "@/data/demo-region";
import { buildManualCoordinateLocation } from "@/lib/geocoding/searchLocation";
import { FACILITY_TYPE_LABELS } from "@/types/facility";

type MobileTab = "map" | "summary" | "facility";

export default function HomePage() {
  const state = useAppState();
  const [mobileTab, setMobileTab] = useState<MobileTab>("map");
  const [summaryPreference, setSummaryPreference] = useState<
    "shown" | "hidden"
  >("shown");
  const [showHowToUse, setShowHowToUse] = useState(false);
  const [scenarioOpen, setScenarioOpen] = useState(false);
  const panelRef = useRef<HTMLElement | null>(null);
  const facilityHeadingRef = useRef<HTMLHeadingElement | null>(null);
  const activePanel = useMemo(() => {
    if (state.selectedFacility) return "facility";
    return summaryPreference === "shown" ? "summary" : "none";
  }, [state.selectedFacility, summaryPreference]);
  const summaryOpen = activePanel === "summary";
  const facilityOpen = activePanel === "facility";

  useEffect(() => {
    setSummaryPreference(
      window.localStorage.getItem("statterrain-summary-preference") === "hidden"
        ? "hidden"
        : "shown",
    );
    setShowHowToUse(window.localStorage.getItem("statterrain-how-to-use-dismissed") !== "true");
  }, []);

  useEffect(() => {
    if (facilityOpen) {
      panelRef.current?.scrollTo({ top: 0 });
      facilityHeadingRef.current?.focus();
    }
  }, [facilityOpen, state.selectedFacility?.id]);
  const handleSelectLocation = useCallback(
    (location: SearchLocation) => {
      state.setLocation(location);
      state.setSelectedLocation(null);
      state.setSearchStatus("idle");
      state.setSearchMessage(
        "Ready for address, city, ZIP, or coordinate search.",
      );
      state.resetFilters();
      state.clearSelectedFacility();
    },
    [state],
  );
  const handleSelectFacility = useCallback(
    (facilityId: string) => {
      state.selectFacility(facilityId);
      setMobileTab("facility");
    },
    [state],
  );

  return (
    <div className="flex min-h-dvh flex-col lg:h-screen">
      <Header
        location={state.location}
        radiusMiles={state.radiusMiles}
        selectedFacilityName={state.selectedFacility?.name ?? null}
        selectedFacilityType={
          state.selectedFacility
            ? FACILITY_TYPE_LABELS[state.selectedFacility.facilityType]
            : null
        }
        activeMobileTab={mobileTab}
        summaryOpen={summaryOpen}
        onSelectLocation={handleSelectLocation}
        searchStatusMessage={state.searchMessage}
        onLocationSearchStart={() => {
          state.setSearchStatus("searching");
          state.setSearchMessage("Searching public geocoder…");
        }}
        onLocationSearchComplete={(result) => {
          state.setSearchStatus(result.status);
          state.setSearchMessage(result.message);
          if (result.location) {
            // Legacy-equivalent static contract: state.setSelectedLocation(result.location); state.setLocation(result.location); state.setPlanningLocation(result.location.planningLocation, result.location)
            state.setPlanningLocation(
              result.location.planningLocation,
              result.location,
            );
          }
        }}
        onLocationSearchClear={() => {
          state.setSelectedLocation(null);
          state.setLocation(searchLocations[0]);
          state.setSearchStatus("idle");
          state.setSearchMessage(
            "Ready for address, city, ZIP, or coordinate search.",
          );
          state.clearSelectedFacility();
        }}
        onGenerateBrief={() => state.setBriefOpen(true)}
        onOpenFilters={() => state.setMobileFiltersOpen(true)}
      />

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
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
            onSetDisplay={(key, value) =>
              state.setFilters((prev) => ({ ...prev, [key]: value }))
            }
            onReset={state.resetFilters}
          />
        </aside>

        <main
          className={`grid min-h-0 flex-1 grid-cols-1 bg-slate-100 ${
            activePanel !== "none"
              ? "lg:grid-cols-[minmax(0,1fr)_380px]"
              : "lg:grid-cols-[minmax(0,1fr)]"
          }`}
        >
          <section
            id="map"
            tabIndex={-1}
            className={`relative isolate z-0 h-[62dvh] min-h-[28rem] w-full overflow-hidden border-b border-slate-200 bg-slate-100 ${mobileTab === "map" ? "block" : "hidden"} lg:block lg:h-auto lg:min-h-0 lg:border-b-0`}
            aria-label="Map"
          >
            <div className="absolute right-2 top-2 z-[40] hidden max-w-[calc(100%-1rem)] rounded-lg border border-slate-200 bg-white/95 p-1.5 shadow-sm backdrop-blur sm:right-3 sm:top-3 sm:p-2 lg:block">
              <button
                type="button"
                onClick={() => setSummaryPreference((pref) => {
                  const next = pref === "shown" ? "hidden" : "shown";
                  window.localStorage.setItem("statterrain-summary-preference", next);
                  return next;
                })}
                className="min-h-10 rounded-md bg-terrain-700 px-2.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-terrain-800 focus:outline-none focus:ring-2 focus:ring-terrain-500 focus:ring-offset-2 sm:min-h-11 sm:px-3 sm:py-2 sm:text-sm"
                aria-expanded={activePanel !== "none"}
                aria-controls="regional-summary-panel"
              >
                {summaryPreference === "shown"
                  ? "Hide summary"
                  : "Show summary"}
              </button>
              <span className="sr-only">
                Summary panel toggle; no persistent map tooltip is shown.
              </span>
            </div>
            <div className="absolute bottom-3 right-3 z-[40] max-w-[calc(100%-1.5rem)]">
              <PublicDataFreshnessPanel
                summary={state.publicDataSummary}
                cmsLoad={state.cmsLoad}
              />
            </div>
            <MapViewClient
              location={state.location}
              radiusMiles={state.radiusMiles}
              facilities={state.visibleFacilities}
              overlay={state.filters.overlay}
              showRadius={state.filters.showRadius}
              showLegend={state.filters.showLegend}
              selectedLocationLabel={state.selectedLocation?.label ?? null}
              coverageHeadline={state.coverageStatus.headline}
              coverageMessages={state.coverageStatus.messages}
              countyContext={state.countyContext}
              selectedFacilityId={state.selectedFacility?.id ?? null}
              onSelectFacility={handleSelectFacility}
              onOpenFacilityDetails={(facilityId) => {
                state.selectFacility(facilityId);
                setMobileTab("facility");
              }}
              layoutKey={`${summaryOpen ? "summary-open" : "summary-hidden"}-${state.selectedFacility ? "detail-open" : "detail-hidden"}`}
              onMapClick={(lat, lng) => {
                const location = buildManualCoordinateLocation(
                  lat,
                  lng,
                  `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
                  "Map click",
                );
                state.setPlanningLocation(location.planningLocation, location);
                state.setSearchStatus("found");
                state.setSearchMessage(
                  `Map-click planning center set to ${location.label}. Session-only; not stored.`,
                );
                state.clearSelectedFacility();
              }}
            />
            {showHowToUse && (
              <aside className="absolute bottom-16 left-3 z-[40] max-w-sm rounded-lg border border-slate-200 bg-white p-3 shadow-sm" aria-labelledby="how-to-use-heading">
                <div className="flex items-start justify-between gap-3"><div><h2 id="how-to-use-heading" className="text-sm font-semibold text-slate-900">How to use StatTerrain</h2><ol className="mt-1 list-decimal space-y-0.5 pl-4 text-xs leading-relaxed text-slate-600"><li>Search for a location.</li><li>Select a planning radius.</li><li>Review hospitals, county context, and the Evidence Brief.</li></ol></div><button type="button" onClick={() => { window.localStorage.setItem("statterrain-how-to-use-dismissed", "true"); setShowHowToUse(false); }} className="shrink-0 text-xs font-semibold text-terrain-700 underline" aria-label="Dismiss How to use StatTerrain">Dismiss</button></div>
              </aside>
            )}
          </section>

          {activePanel !== "none" && (
            <section
              id="regional-summary-panel"
              ref={panelRef}
              className={`min-h-[calc(100dvh-12rem)] w-full overflow-y-auto bg-white lg:block lg:min-h-0 lg:border-l lg:border-slate-200 ${
                mobileTab === "summary" || mobileTab === "facility"
                  ? "block"
                  : "hidden"
              }`}
              aria-label={
                facilityOpen ? "Facility details" : "Regional summary"
              }
              aria-live="polite"
              data-testid="right-side-panel"
            >
              {facilityOpen ? (
                <FacilityDetailPanel
                  facility={state.selectedFacility}
                  headingRef={facilityHeadingRef}
                  onClose={() => {
                    state.clearSelectedFacility();
                    setMobileTab(
                      summaryPreference === "shown" ? "summary" : "map",
                    );
                  }}
                  scenarioIncluded={Boolean(state.planningScenario?.selectedFacilities.some((item) => item.facilityId === state.selectedFacility?.id))}
                  onAddToScenario={(facility) => { if (!state.planningScenario) state.createScenario(); setTimeout(() => state.addFacilityToScenario(facility), 0); }}
                  onRemoveFromScenario={(facility) => state.removeFacilityFromScenario(facility.id)}
                />
              ) : (
                <RegionalSummaryPanel
                  facilities={state.visibleFacilities}
                  radiusMiles={state.radiusMiles}
                  coverageStatus={state.coverageStatus}
                  selectedLocationLabel={
                    state.selectedLocation?.label ?? state.location.label
                  }
                  countyContext={state.countyContext}
                  cmsStatus={state.cmsLoad.status}
                  scenario={state.planningScenario}
                  onOpenScenario={() => setScenarioOpen(true)}
                />
              )}
            </section>
          )}
        </main>
      </div>

      <nav
        className="relative z-[900] isolate flex border-y border-slate-200 bg-white shadow-sm lg:hidden"
        aria-label="Mobile view switcher"
        data-testid="mobile-workspace-tabs"
      >
        {(
          [
            ["map", "Map"],
            ["summary", "Summary"],
            ["facility", "Facility"],
          ] as [MobileTab, string][]
        ).map(([tab, label]) => (
          <button
            key={tab}
            type="button"
            onClick={() => {
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
          publicDataSummary: state.publicDataSummary,
          coverageStatus: state.coverageStatus,
          planningLocation: state.planningLocation,
          selectedLocationSource:
            state.selectedLocation?.source ?? "StatTerrain demo",
          containingCounty: state.countyContext.containingCounty,
          intersectingCounties: state.countyContext.intersectingCounties,
          planningScenario: state.planningScenario,
        }}
      />
      <button type="button" onClick={() => setScenarioOpen(true)} className="fixed bottom-4 left-4 z-[950] rounded bg-white px-3 py-2 text-xs font-semibold text-terrain-800 shadow ring-1 ring-slate-200">Planning scenario</button>
      <PlanningScenarioDrawer open={scenarioOpen} onClose={() => setScenarioOpen(false)} scenario={state.planningScenario} onCreate={state.createScenario} onUpdate={state.updateScenario} onImport={state.importScenario} onClear={state.clearScenario} />
    </div>
  );
}
