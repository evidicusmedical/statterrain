import type { FacilityType } from "@/types/facility";

export const FACILITY_MARKER_COLORS: Record<FacilityType, string> = {
  hospital: "#b3261e",
  critical_access_hospital: "#b5720c",
  pharmacy: "#2d578a",
  dialysis: "#6d28d9",
  nursing_home: "#316559",
  behavioral_health: "#0f766e",
};

export const OVERLAY_COLOR_SCALE = ["#eef4fb", "#c9dcef", "#9dbfdc", "#6f9dc6", "#437f6e", "#295148"];

export function overlayColorForValue(value: number): string {
  const clamped = Math.max(0, Math.min(1, value));
  const idx = Math.min(
    OVERLAY_COLOR_SCALE.length - 1,
    Math.floor(clamped * OVERLAY_COLOR_SCALE.length),
  );
  return OVERLAY_COLOR_SCALE[idx];
}
