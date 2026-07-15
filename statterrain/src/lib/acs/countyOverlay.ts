import type { AcsCountyRecord } from "@/lib/acs/types";

export type CountyOverlayRole = "containing" | "intersecting" | "loaded";

export const COUNTY_BOUNDARY_LIMITATION =
  "County boundaries identify whole-county geography. They do not show population distribution within a county.";

export interface CountyOverlayDisplay {
  geoid: string;
  role: CountyOverlayRole;
  fillColor: string;
  fillOpacity: number;
  outlineColor: string;
  outlineWeight: number;
  className: string;
}

export function buildCountyOverlayState(args: {
  containingCounty: AcsCountyRecord | null;
  counties: AcsCountyRecord[];
  intersectingGeoids?: string[];
}) {
  const intersecting = new Set(
    args.intersectingGeoids ?? args.counties.map((county) => county.geoid),
  );
  return {
    loadedCountyGeoids: args.counties.map((county) => county.geoid),
    boundarySource:
      "National county boundary partitions from generated static artifacts",
    limitation: COUNTY_BOUNDARY_LIMITATION,
    counties: args.counties.map((county): CountyOverlayDisplay => {
      const role: CountyOverlayRole =
        county.geoid === args.containingCounty?.geoid
          ? "containing"
          : intersecting.has(county.geoid)
            ? "intersecting"
            : "loaded";
      return {
        geoid: county.geoid,
        role,
        fillColor: role === "containing" ? "#f8fafc" : "#ffffff",
        fillOpacity: role === "containing" ? 0.12 : 0.03,
        outlineColor: role === "containing" ? "#111827" : "#475569",
        outlineWeight: role === "containing" ? 3 : 1.5,
        className: `county-polygon county-role-${role} county-boundary-outline`,
      };
    }),
  };
}
