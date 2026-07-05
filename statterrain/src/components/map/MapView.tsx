"use client";

import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Circle, Polygon, CircleMarker, Tooltip, Popup, useMap } from "react-leaflet";
import type { Facility } from "@/types/facility";
import type { SearchLocation } from "@/data/demo-region";
import { mapRegions } from "@/data/map-regions";
import type { OverlayMetricId } from "@/types/metric";
import { FACILITY_MARKER_COLORS, overlayColorForValue } from "./mapStyles";
import { FACILITY_TYPE_LABELS } from "@/types/facility";
import { MapLegend } from "./MapLegend";

interface MapViewProps {
  location: SearchLocation;
  radiusMiles: number;
  facilities: Facility[];
  overlay: OverlayMetricId | null;
  showRadius: boolean;
  showLegend: boolean;
  showLabels: boolean;
  selectedFacilityId: string | null;
  onSelectFacility: (id: string) => void;
}

function Recenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], map.getZoom());
  }, [lat, lng, map]);
  return null;
}

export function MapView({
  location,
  radiusMiles,
  facilities,
  overlay,
  showRadius,
  showLegend,
  showLabels,
  selectedFacilityId,
  onSelectFacility,
}: MapViewProps) {
  const radiusMeters = radiusMiles * 1609.34;

  const polygons = useMemo(() => {
    if (!overlay) return [];
    return mapRegions.map((region) => ({
      ...region,
      color: overlayColorForValue(region.values[overlay]),
    }));
  }, [overlay]);

  return (
    <div className="relative h-full w-full" data-testid="map-view">
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
        <Recenter lat={location.lat} lng={location.lng} />

        {overlay &&
          polygons.map((region) => (
            <Polygon
              key={region.id}
              positions={region.ring}
              pathOptions={{ color: region.color, fillColor: region.color, fillOpacity: 0.55, weight: 1 }}
            >
              <Tooltip sticky>{region.name}</Tooltip>
            </Polygon>
          ))}

        {showRadius && (
          <Circle
            center={[location.lat, location.lng]}
            radius={radiusMeters}
            pathOptions={{ color: "#316559", fillOpacity: 0.04, weight: 1.5, dashArray: "4 4" }}
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
            className: "search-location-marker",
          }}
        >
          <Tooltip permanent={showLabels} direction="top">
            {location.label}
          </Tooltip>
          <Popup>Search location: {location.label}</Popup>
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
            eventHandlers={{ click: () => onSelectFacility(f.id) }}
          >
            <Tooltip permanent={showLabels} direction="top" offset={[0, -6]}>
              {f.name}
            </Tooltip>
            <Popup>
              <div className="text-xs">
                <p className="font-semibold">{f.name}</p>
                <p className="text-slate-500">{FACILITY_TYPE_LABELS[f.facilityType]}</p>
                <p className="mt-1">{f.distanceMiles} mi away</p>
                <button
                  type="button"
                  onClick={() => onSelectFacility(f.id)}
                  className="mt-1 font-medium text-terrain-700 underline"
                >
                  View details
                </button>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>

      {showLegend && (
        <div className="pointer-events-none absolute bottom-3 left-3 z-[400]">
          <MapLegend overlay={overlay} />
        </div>
      )}
    </div>
  );
}
