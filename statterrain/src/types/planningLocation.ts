export type PlanningLocationInputMethod =
  | "address-search"
  | "place-search"
  | "coordinate-search"
  | "facility-selection"
  | "map-click";

export type PlanningLocation = {
  latitude: number;
  longitude: number;
  displayLabel: string;
  inputMethod: PlanningLocationInputMethod;
  resolvedAt: string;
  searchQuery?: string;
  state?: string;
};

export function validatePlanningCoordinates(latitude: number, longitude: number): boolean {
  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}
