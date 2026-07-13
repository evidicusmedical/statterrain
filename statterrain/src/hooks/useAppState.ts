"use client";

import { useEffect, useMemo, useState } from "react";
import { searchLocations, type SearchLocation } from "@/data/demo-region";
import { getPublicDataArtifactSummary } from "@/lib/public-data/readPublicDataArtifacts";
import { loadNationalCmsHospitals, filterFacilitiesByRadius, CMS_LOAD_FAILURE_COPY } from "@/lib/public-data/loadNationalCmsHospitals";
import { selectCmsHospitalPartitionResult } from "@/lib/geography/selectCmsHospitalPartitions";
import { buildCoverageStatus } from "@/lib/coverage/coverageStatus";
import type {
  LocationSearchStatus,
  SelectedLocation,
} from "@/lib/geocoding/searchLocation";
import type { Facility, FacilityType, CapabilityName } from "@/types/facility";
import type { OverlayMetricId } from "@/types/metric";
import type { PlanningLocation } from "@/types/planningLocation";
import { validatePlanningCoordinates } from "@/types/planningLocation";
import { demoRegion } from "@/data/demo-region";
import { resolveCountyContext, type CountyContextState } from "@/lib/acs/countyContext";
export interface AppFilters {
  facilityTypes: Set<FacilityType>;
  capabilities: Set<CapabilityName>;
  overlay: OverlayMetricId | null;
  showRadius: boolean;
  showLegend: boolean;
}

const ALL_FACILITY_TYPES: FacilityType[] = ["hospital"];

function defaultFilters(): AppFilters {
  return {
    facilityTypes: new Set(ALL_FACILITY_TYPES),
    capabilities: new Set(),
    overlay: null,
    showRadius: true,
    showLegend: true,
  };
}

function haversineMiles(
  aLat: number,
  aLng: number,
  bLat: number,
  bLng: number,
): number {
  const R = 3958.8;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLng = ((bLng - aLng) * Math.PI) / 180;
  const lat1 = (aLat * Math.PI) / 180;
  const lat2 = (bLat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(h));
}

export function useAppState() {
  const [location, setLocation] = useState<SearchLocation>(searchLocations[0]);
  const [planningLocation, setPlanningLocationState] = useState<PlanningLocation | null>(null);
  const [selectedLocation, setSelectedLocationState] =
    useState<SelectedLocation | null>(null);
  const [searchStatus, setSearchStatus] =
    useState<LocationSearchStatus>("idle");
  const [searchMessage, setSearchMessage] = useState(
    "Ready for address, city, ZIP, or coordinate search.",
  );
  const [radiusMiles, setRadiusMiles] = useState<number>(25);
  const [filters, setFilters] = useState<AppFilters>(defaultFilters());
  const [selectedFacilityId, setSelectedFacilityId] = useState<string | null>(
    null,
  );
  const [briefOpen, setBriefOpen] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);
  const publicDataSummary = useMemo(() => getPublicDataArtifactSummary(), []);
  const [countyContext, setCountyContext] = useState<CountyContextState>({ status: "idle", message: "County population context has not been requested.", containingCounty: null, intersectingCounties: [], boundaryFeatures: [] });
  const [cmsLoad, setCmsLoad] = useState<{status: string; facilities: Facility[]; manifest: any; requestedPartitions: string[]; loadedPartitions: string[]; errors: string[]; primaryState?: string; selectionStrategy?: string; partialCoverage?: boolean}>({ status: "loading", facilities: [], manifest: null, requestedPartitions: [], loadedPartitions: [], errors: [] });

  const partitionSelection = useMemo(() => selectCmsHospitalPartitionResult({ lat: location.lat, lng: location.lng, radiusMiles, state: planningLocation?.state ?? selectedLocation?.state, label: planningLocation?.displayLabel ?? selectedLocation?.label ?? location.label, query: planningLocation?.searchQuery ?? selectedLocation?.query }), [location, radiusMiles, selectedLocation, planningLocation]);
  const partitionCodes = partitionSelection.partitions;

  const partitionKey = partitionCodes.join(",");

  useEffect(() => {
    let cancelled = false;
    const requested = partitionKey ? partitionKey.split(",") : [];
    if (partitionSelection.status === "unresolved") {
      setCmsLoad({ status: "unresolved", facilities: [], manifest: null, requestedPartitions: [], loadedPartitions: [], errors: [partitionSelection.message], selectionStrategy: partitionSelection.strategy });
      return () => { cancelled = true; };
    }
    setCmsLoad((prev) => ({ ...prev, status: "loading", requestedPartitions: requested, primaryState: partitionSelection.primaryState, selectionStrategy: partitionSelection.strategy }));
    loadNationalCmsHospitals({ partitionCodes: requested }).then((result) => {
      if (!cancelled) setCmsLoad({ ...result, primaryState: partitionSelection.primaryState, selectionStrategy: partitionSelection.strategy, partialCoverage: result.status === "partial-failure" });
    });
    return () => { cancelled = true; };
  }, [partitionKey, partitionSelection]);



  useEffect(() => {
    let cancelled = false;
    setCountyContext({ status: "loading", message: "Loading county population context…", containingCounty: null, intersectingCounties: [], boundaryFeatures: [] });
    resolveCountyContext(location.lat, location.lng, radiusMiles)
      .then((result) => { if (!cancelled) setCountyContext(result); })
      .catch((error) => { if (!cancelled) setCountyContext({ status: "error", message: error?.message ?? "County population context failed to load.", containingCounty: null, intersectingCounties: [], boundaryFeatures: [] }); });
    return () => { cancelled = true; };
  }, [location.lat, location.lng, radiusMiles]);

  const facilitiesInRadius = useMemo(() => filterFacilitiesByRadius(cmsLoad.facilities, location.lat, location.lng, radiusMiles), [cmsLoad.facilities, location, radiusMiles]);

  const previewFacilitiesInRadius = facilitiesInRadius;

  const coverageStatus = useMemo(
    () =>
      buildCoverageStatus({
        selectedLocation,
        radiusMiles,
        publicPreviewEnabled: true,
        previewFacilitiesInRadius,
        searchStatus: cmsLoad.status === "error" ? "geocoder-unavailable" : searchStatus,
      }),
    [selectedLocation, radiusMiles, previewFacilitiesInRadius, searchStatus, cmsLoad.status],
  );

  const visibleFacilities: Facility[] = useMemo(() => {
    return facilitiesInRadius.filter((f) => {
      if (!filters.facilityTypes.has(f.facilityType)) return false;
      if (filters.capabilities.size > 0) {
        const hasAny = f.capabilities.some((c) =>
          filters.capabilities.has(c.capability),
        );
        if (!hasAny) return false;
      }
      return true;
    });
  }, [facilitiesInRadius, filters]);

  const selectedFacility = useMemo(
    () => visibleFacilities.find((f) => f.id === selectedFacilityId) ?? null,
    [visibleFacilities, selectedFacilityId],
  );

  function setPlanningLocation(next: PlanningLocation, sourceLocation?: SelectedLocation) {
    if (!validatePlanningCoordinates(next.latitude, next.longitude)) return;
    const appLocation: SearchLocation = sourceLocation ?? {
      id: `${next.inputMethod}-${next.resolvedAt}`,
      label: next.displayLabel,
      kind: "city",
      lat: next.latitude,
      lng: next.longitude,
      regionId: Math.abs(next.latitude - demoRegion.centerLat) <= 0.35 && Math.abs(next.longitude - demoRegion.centerLng) <= 0.45 ? demoRegion.id : "searched-us-location",
    };
    setPlanningLocationState(next);
    setSelectedLocationState(sourceLocation ?? null);
    setLocation(appLocation);
    setSelectedFacilityId(null);
  }

  function setSelectedLocation(next: SelectedLocation | null) {
    setSelectedLocationState(next);
    setPlanningLocationState(next?.planningLocation ?? null);
  }

  function resetFilters() {
    setFilters(defaultFilters());
  }

  function toggleFacilityType(type: FacilityType) {
    setFilters((prev) => {
      const next = new Set(prev.facilityTypes);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return { ...prev, facilityTypes: next };
    });
  }

  function toggleCapability(cap: CapabilityName) {
    setFilters((prev) => {
      const next = new Set(prev.capabilities);
      if (next.has(cap)) next.delete(cap);
      else next.add(cap);
      return { ...prev, capabilities: next };
    });
  }

  function selectFacility(id: string) {
    setSelectedFacilityId(id);
    setMobileDetailOpen(true);
  }

  return {
    location,
    setLocation,
    planningLocation,
    setPlanningLocation,
    selectedLocation,
    setSelectedLocation,
    searchStatus,
    setSearchStatus,
    searchMessage,
    setSearchMessage,
    coverageStatus,
    previewFacilitiesInRadius,
    radiusMiles,
    setRadiusMiles,
    filters,
    setFilters,
    resetFilters,
    clearSelectedFacility: () => setSelectedFacilityId(null),
    toggleFacilityType,
    toggleCapability,
    facilitiesInRadius,
    visibleFacilities,
    selectedFacility,
    selectFacility,
    briefOpen,
    setBriefOpen,
    mobileFiltersOpen,
    setMobileFiltersOpen,
    mobileDetailOpen,
    setMobileDetailOpen,
    publicDataSummary,
    publicDataPreviewEnabled: true,
    setPublicDataPreviewEnabled: () => {},
    cmsLoad,
    countyContext,
  };
}

export type AppState = ReturnType<typeof useAppState>;
