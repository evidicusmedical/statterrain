"use client";

import { useMemo, useState } from "react";
import { searchLocations, type SearchLocation } from "@/data/demo-region";
import { facilities as syntheticFacilities } from "@/data/facilities";
import { getPreviewCmsHospitalFacilities, getPublicDataArtifactSummary } from "@/lib/public-data/readPublicDataArtifacts";
import type { Facility, FacilityType, CapabilityName } from "@/types/facility";
import type { OverlayMetricId } from "@/types/metric";
import type { ConfidenceLevel } from "@/types/source";

export type ConfidenceFilter = "high" | "high_medium" | "all";

export interface AppFilters {
  facilityTypes: Set<FacilityType>;
  capabilities: Set<CapabilityName>;
  overlay: OverlayMetricId | null;
  confidence: ConfidenceFilter;
  showRadius: boolean;
  showLegend: boolean;
  showLabels: boolean;
  showFreshness: boolean;
}

const ALL_FACILITY_TYPES: FacilityType[] = [
  "hospital",
  "critical_access_hospital",
  "pharmacy",
  "dialysis",
  "nursing_home",
  "behavioral_health",
];

function defaultFilters(): AppFilters {
  return {
    facilityTypes: new Set(ALL_FACILITY_TYPES),
    capabilities: new Set(),
    overlay: null,
    confidence: "all",
    showRadius: true,
    showLegend: true,
    showLabels: false,
    showFreshness: true,
  };
}

function confidenceRank(c: ConfidenceLevel): number {
  return c === "high" ? 3 : c === "medium" ? 2 : 1;
}

function confidenceThreshold(filter: ConfidenceFilter): number {
  if (filter === "high") return 3;
  if (filter === "high_medium") return 2;
  return 1;
}

function haversineMiles(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const R = 3958.8;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLng = ((bLng - aLng) * Math.PI) / 180;
  const lat1 = (aLat * Math.PI) / 180;
  const lat2 = (bLat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(h));
}

export function useAppState() {
  const [location, setLocation] = useState<SearchLocation>(searchLocations[0]);
  const [radiusMiles, setRadiusMiles] = useState<number>(25);
  const [filters, setFilters] = useState<AppFilters>(defaultFilters());
  const [selectedFacilityId, setSelectedFacilityId] = useState<string | null>(null);
  const [briefOpen, setBriefOpen] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);
  const publicDataSummary = useMemo(() => getPublicDataArtifactSummary(), []);
  const publicDataPreviewFacilities = useMemo(() => getPreviewCmsHospitalFacilities(), []);
  const [publicDataPreviewEnabled, setPublicDataPreviewEnabled] = useState(false);

  const allFacilities = useMemo(() => {
    if (!publicDataPreviewEnabled || !publicDataSummary.canPreviewOnMap) return syntheticFacilities;
    return [...syntheticFacilities, ...publicDataPreviewFacilities];
  }, [publicDataPreviewEnabled, publicDataSummary.canPreviewOnMap, publicDataPreviewFacilities]);

  const facilitiesInRadius = useMemo(() => {
    return allFacilities
      .map((f) => ({
        ...f,
        distanceMiles: Number(
          haversineMiles(location.lat, location.lng, f.lat, f.lng).toFixed(1),
        ),
      }))
      .filter((f) => f.distanceMiles <= radiusMiles)
      .sort((a, b) => a.distanceMiles - b.distanceMiles);
  }, [allFacilities, location, radiusMiles]);

  const visibleFacilities: Facility[] = useMemo(() => {
    const threshold = confidenceThreshold(filters.confidence);
    return facilitiesInRadius.filter((f) => {
      if (!filters.facilityTypes.has(f.facilityType)) return false;
      if (confidenceRank(f.confidence) < threshold) return false;
      if (filters.capabilities.size > 0) {
        const hasAny = f.capabilities.some((c) => filters.capabilities.has(c.capability));
        if (!hasAny) return false;
      }
      return true;
    });
  }, [facilitiesInRadius, filters]);

  const selectedFacility = useMemo(
    () => visibleFacilities.find((f) => f.id === selectedFacilityId) ?? null,
    [visibleFacilities, selectedFacilityId],
  );

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
    publicDataPreviewEnabled,
    setPublicDataPreviewEnabled,
  };
}

export type AppState = ReturnType<typeof useAppState>;
