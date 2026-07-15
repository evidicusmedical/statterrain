"use client";

import { useEffect, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Circle,
  Polygon,
  CircleMarker,
  Tooltip,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";
import type { Facility } from "@/types/facility";
import type { SearchLocation } from "@/data/demo-region";
import type { OverlayMetricId } from "@/types/metric";
import type { CountyContextState } from "@/lib/acs/countyContext";
import { FACILITY_MARKER_COLORS } from "./mapStyles";
import { FACILITY_TYPE_LABELS } from "@/types/facility";
import { buildCountyOverlayState } from "@/lib/acs/countyOverlay";

interface MapViewProps {
  layoutKey?: string;
  location: SearchLocation;
  radiusMiles: number;
  facilities: Facility[];
  overlay: OverlayMetricId | null;
  showRadius: boolean;
  showLegend: boolean;
  selectedLocationLabel?: string | null;
  coverageHeadline: string;
  coverageMessages: string[];
  selectedFacilityId: string | null;
  onSelectFacility: (id: string) => void;
  onOpenFacilityDetails?: (id: string) => void;
  onMapClick?: (lat: number, lng: number) => void;
  countyContext?: CountyContextState;
}

function ResizeOnLayoutChange({ layoutKey }: { layoutKey?: string }) {
  const map = useMap();
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => map.invalidateSize());
    return () => window.cancelAnimationFrame(frame);
  }, [layoutKey, map]);
  return null;
}

function Recenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], map.getZoom());
  }, [lat, lng, map]);
  return null;
}

function MapClickPlanningCenter({
  onMapClick,
}: {
  onMapClick?: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(event) {
      onMapClick?.(event.latlng.lat, event.latlng.lng);
    },
  });
  return null;
}

export function MapView({
  layoutKey,
  location,
  radiusMiles,
  facilities,
  overlay,
  showRadius,
  showLegend,
  selectedLocationLabel,
  coverageHeadline,
  selectedFacilityId,
  onSelectFacility,
  onOpenFacilityDetails,
  onMapClick,
  countyContext,
}: MapViewProps) {
  const radiusMeters = radiusMiles * 1609.34;
  void overlay;
  void showLegend;

  const countyOverlay = useMemo(
    () =>
      buildCountyOverlayState({
        containingCounty: countyContext?.containingCounty ?? null,
        counties: countyContext?.intersectingCounties ?? [],
        intersectingGeoids:
          countyContext?.intersectingCounties.map((county) => county.geoid) ??
          [],
      }),
    [countyContext],
  );

  const polygons = useMemo(() => {
    if (!countyContext?.boundaryFeatures.length) return [];
    return countyContext.boundaryFeatures.map((feature) => {
      const county = countyContext.intersectingCounties.find(
        (c) => c.geoid === feature.properties.GEOID,
      );
      const display = countyOverlay.counties.find(
        (entry) => entry.geoid === feature.properties.GEOID,
      );
      return {
        id: feature.properties.GEOID,
        name: county?.fullName ?? feature.properties.NAME,
        geometry: feature.geometry,
        display,
      };
    });
  }, [countyContext, countyOverlay]);
  return (
    <div
      className="statterrain-map-shell relative isolate z-0 h-full w-full overflow-hidden"
      data-testid="map-view"
    >
      <MapContainer
        center={[location.lat, location.lng]}
        zoom={11}
        scrollWheelZoom
        className="h-full w-full"
        aria-label="Regional emergency-care map"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ResizeOnLayoutChange layoutKey={layoutKey} />
        <Recenter lat={location.lat} lng={location.lng} />
        <MapClickPlanningCenter onMapClick={onMapClick} />

        {polygons.map((region) => (
          <Polygon
            key={region.id}
            positions={
              region.geometry.type === "Polygon"
                ? (region.geometry.coordinates as any).map((ring: number[][]) =>
                    ring.map(([lng, lat]) => [lat, lng]),
                  )
                : (region.geometry.coordinates as any).map(
                    (poly: number[][][]) =>
                      poly.map((ring) => ring.map(([lng, lat]) => [lat, lng])),
                  )
            }
            pathOptions={{
              color: region.display?.outlineColor ?? "#94a3b8",
              fillColor: region.display?.fillColor ?? "#f8fafc",
              fillOpacity: region.display?.fillOpacity ?? 0.08,
              weight: region.display?.outlineWeight ?? 1,
              className: `county-polygon county-role-${region.display?.role ?? "loaded"} ${region.display?.className ?? "county-boundary-outline"}`,
            }}
            interactive={false}
          >
            <Tooltip sticky>{region.name}</Tooltip>
          </Polygon>
        ))}

        {showRadius && (
          <Circle
            center={[location.lat, location.lng]}
            radius={radiusMeters}
            pathOptions={{
              color: "#316559",
              fillOpacity: 0.04,
              weight: 1.5,
              dashArray: "4 4",
            }}
          />
        )}

        <CircleMarker
          center={[location.lat, location.lng]}
          radius={7}
          pathOptions={{
            color: "#1f2937",
            fillColor: "#1f2937",
            fillOpacity: 1,
            weight: 2,
            className: "search-location-marker planning-location-marker",
          }}
        >
          <Tooltip direction="top">
            {selectedLocationLabel ? "Selected location" : location.label}
          </Tooltip>
          <Popup>
            Selected location: {selectedLocationLabel ?? location.label}
          </Popup>
        </CircleMarker>

        {facilities.map((f) => (
          <CircleMarker
            key={f.id}
            center={[f.lat, f.lng]}
            radius={f.id === selectedFacilityId ? 9 : 6}
            pathOptions={{
              color: f.id === selectedFacilityId ? "#111827" : "#ffffff",
              weight: f.id === selectedFacilityId ? 2.5 : 1,
              fillColor: FACILITY_MARKER_COLORS[f.facilityType],
              fillOpacity: 0.9,
              className: `facility-marker facility-marker-${f.id}`,
            }}
            eventHandlers={{
              click: (event) => {
                event.originalEvent.stopPropagation();
                onSelectFacility(f.id);
              },
            }}
          >
            <Tooltip direction="top" offset={[0, -6]}>
              {f.name}
            </Tooltip>
            <Popup>
              <div className="max-w-[min(16rem,calc(100vw-4rem))] text-xs">
                <p className="font-semibold">{f.name}</p>
                <p className="text-slate-500">
                  {FACILITY_TYPE_LABELS[f.facilityType]}
                </p>
                <p className="mt-1">{f.distanceMiles} mi away</p>
                <button
                  type="button"
                  onClick={() =>
                    (onOpenFacilityDetails ?? onSelectFacility)(f.id)
                  }
                  className="mt-2 min-h-9 rounded-md bg-terrain-700 px-3 py-2 font-medium text-white"
                >
                  View details
                </button>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>

      <div
        className="pointer-events-none absolute left-3 top-3 z-[350] max-w-[min(30rem,calc(100%-6rem))] rounded-full bg-white/95 px-3 py-2 text-xs font-semibold text-slate-700 shadow-panel"
        data-testid="selected-planning-location"
      >
        <span className="whitespace-nowrap">
          {selectedLocationLabel ?? location.label}
        </span>
        <span> · Radius {radiusMiles} mi</span>
        <span className="sr-only">
          Selected planning radius: {radiusMiles} miles
        </span>
        <span className="text-amber-800"> · {coverageHeadline}</span>
      </div>

      <div className="pointer-events-none absolute left-3 top-14 z-[350] rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm">
        Click the map to set planning center.
      </div>
    </div>
  );
}
