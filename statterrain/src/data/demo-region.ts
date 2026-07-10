export interface SearchLocation {
  id: string;
  label: string;
  kind: "hospital" | "city" | "zip" | "county" | "address";
  lat: number;
  lng: number;
  regionId: string;
}

/**
 * A fictional demonstration region ("Terrace County / Cascadia Basin") used
 * to anchor all synthetic data. Coordinates are placed in a real-world-like
 * but fictional layout for demo purposes only.
 */
export const demoRegion = {
  id: "region-terrace-basin",
  name: "Terrace Basin Demonstration Region",
  centerLat: 43.62,
  centerLng: -116.2,
  stateName: "Demonstration State",
  countyName: "Terrace County",
};

export const searchLocations: SearchLocation[] = [
  {
    id: "loc-terrace-general",
    label: "Terrace Basin General Hospital",
    kind: "hospital",
    lat: 43.62,
    lng: -116.2,
    regionId: demoRegion.id,
  },
  {
    id: "loc-cascadia-city",
    label: "Cascadia City, Demonstration State",
    kind: "city",
    lat: 43.6,
    lng: -116.24,
    regionId: demoRegion.id,
  },
  {
    id: "loc-riverbend-zip",
    label: "83702 (Riverbend, Demonstration State)",
    kind: "zip",
    lat: 43.66,
    lng: -116.15,
    regionId: demoRegion.id,
  },
  {
    id: "loc-terrace-county",
    label: "Terrace County, Demonstration State",
    kind: "county",
    lat: 43.58,
    lng: -116.28,
    regionId: demoRegion.id,
  },
  {
    id: "loc-example-address",
    label: "400 Basin Parkway, Cascadia City, Demonstration State",
    kind: "address",
    lat: 43.605,
    lng: -116.21,
    regionId: demoRegion.id,
  },
  {
    id: "loc-highland-clinic",
    label: "Highland Rural Health Clinic",
    kind: "hospital",
    lat: 43.74,
    lng: -116.05,
    regionId: demoRegion.id,
  },
];

export const radiusOptions = [
  { id: "radius-10", label: "10 miles", miles: 10 },
  { id: "radius-25", label: "25 miles", miles: 25 },
  { id: "radius-50", label: "50 miles", miles: 50 },
  { id: "radius-100", label: "100 miles", miles: 100 },
] as const;
