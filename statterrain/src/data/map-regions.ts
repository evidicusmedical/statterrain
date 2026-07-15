import type { OverlayMetricId } from "@/types/metric";

export interface MapRegionPolygon {
  id: string;
  name: string;
  /** [lat, lng][] ring describing a simple demonstration polygon. */
  ring: [number, number][];
  /** Per-overlay demonstration intensity, 0-1, used to drive choropleth color. */
  values: Record<OverlayMetricId, number>;
}

const overlayBase = (
  base: Partial<Record<OverlayMetricId, number>>,
): Record<OverlayMetricId, number> => ({
  total_population: 0.4,
  pop_65_plus: 0.4,
  pediatric_population: 0.4,
  poverty: 0.4,
  uninsured_population: 0.4,
  disability_population: 0.4,
  limited_english: 0.3,
  no_vehicle: 0.3,
  copd: 0.4,
  coronary_heart_disease: 0.4,
  stroke_prevalence: 0.4,
  poor_mental_health: 0.4,
  social_vulnerability: 0.4,
  rurality: 0.4,
  ...base,
});

export const mapRegions: MapRegionPolygon[] = [
  {
    id: "grid-central",
    name: "Central Basin (urban core)",
    ring: [
      [43.63, -116.25],
      [43.63, -116.18],
      [43.58, -116.18],
      [43.58, -116.25],
    ],
    values: overlayBase({
      pop_65_plus: 0.5,
      poverty: 0.55,
      no_vehicle: 0.6,
      social_vulnerability: 0.6,
      rurality: 0.15,
      limited_english: 0.5,
    }),
  },
  {
    id: "grid-riverbend",
    name: "Riverbend District",
    ring: [
      [43.69, -116.18],
      [43.69, -116.1],
      [43.63, -116.1],
      [43.63, -116.18],
    ],
    values: overlayBase({
      pediatric_population: 0.55,
      copd: 0.3,
      rurality: 0.35,
    }),
  },
  {
    id: "grid-highland",
    name: "Highland Highlands (rural)",
    ring: [
      [43.79, -116.12],
      [43.79, -115.98],
      [43.7, -115.98],
      [43.7, -116.12],
    ],
    values: overlayBase({
      pop_65_plus: 0.75,
      copd: 0.7,
      coronary_heart_disease: 0.65,
      stroke_prevalence: 0.6,
      rurality: 0.95,
      no_vehicle: 0.35,
      social_vulnerability: 0.55,
    }),
  },
  {
    id: "grid-north-basin",
    name: "North Basin Corridor",
    ring: [
      [43.75, -116.32],
      [43.75, -116.2],
      [43.68, -116.2],
      [43.68, -116.32],
    ],
    values: overlayBase({
      poverty: 0.45,
      poor_mental_health: 0.55,
      social_vulnerability: 0.5,
      rurality: 0.55,
    }),
  },
  {
    id: "grid-basin-valley",
    name: "Basin Valley (rural)",
    ring: [
      [43.56, -116.4],
      [43.56, -116.25],
      [43.44, -116.25],
      [43.44, -116.4],
    ],
    values: overlayBase({
      pop_65_plus: 0.8,
      poverty: 0.65,
      no_vehicle: 0.55,
      rurality: 0.98,
      social_vulnerability: 0.75,
      copd: 0.6,
    }),
  },
  {
    id: "grid-southfork",
    name: "Southfork Corridor",
    ring: [
      [43.6, -116.18],
      [43.6, -116.05],
      [43.48, -116.05],
      [43.48, -116.18],
    ],
    values: overlayBase({
      poverty: 0.5,
      limited_english: 0.6,
      poor_mental_health: 0.5,
      social_vulnerability: 0.55,
      rurality: 0.4,
    }),
  },
  {
    id: "grid-eastgate",
    name: "Eastgate Suburbs",
    ring: [
      [43.66, -116.19],
      [43.66, -116.1],
      [43.58, -116.1],
      [43.58, -116.19],
    ],
    values: overlayBase({
      pediatric_population: 0.6,
      pop_65_plus: 0.3,
      poverty: 0.25,
      rurality: 0.2,
    }),
  },
];
