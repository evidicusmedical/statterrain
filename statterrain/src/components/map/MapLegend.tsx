import type { OverlayMetricId } from "@/types/metric";
import { OVERLAY_LABELS } from "@/types/metric";
import { FACILITY_MARKER_COLORS, OVERLAY_COLOR_SCALE } from "./mapStyles";
import { FACILITY_TYPE_LABELS, type FacilityType } from "@/types/facility";

const LEGEND_FACILITY_TYPES: FacilityType[] = [
  "hospital",
  "critical_access_hospital",
  "pharmacy",
  "dialysis",
  "nursing_home",
  "behavioral_health",
];

export function MapLegend({ overlay }: { overlay: OverlayMetricId | null }) {
  return (
    <div className="pointer-events-auto max-w-[220px] rounded-lg border border-slate-200 bg-white/95 p-3 text-xs shadow-panel">
      <h3 className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        Legend
      </h3>
      <ul className="flex flex-col gap-1 mb-2">
        {LEGEND_FACILITY_TYPES.map((type) => (
          <li key={type} className="flex items-center gap-2 text-slate-700">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full border border-white shadow"
              style={{ backgroundColor: FACILITY_MARKER_COLORS[type] }}
              aria-hidden
            />
            {FACILITY_TYPE_LABELS[type]}
          </li>
        ))}
      </ul>
      {overlay && (
        <div className="border-t border-slate-200 pt-2">
          <p className="mb-1 font-medium text-slate-600">{OVERLAY_LABELS[overlay]}</p>
          <div className="flex h-2.5 w-full overflow-hidden rounded">
            {OVERLAY_COLOR_SCALE.map((c) => (
              <span key={c} style={{ backgroundColor: c }} className="flex-1" />
            ))}
          </div>
          <div className="mt-1 flex justify-between text-[10px] text-slate-400">
            <span>Lower</span>
            <span>Higher</span>
          </div>
        </div>
      )}
      <p className="mt-2 border-t border-slate-200 pt-1.5 text-[10px] leading-snug text-slate-400">
        Synthetic demonstration data. Not verified operational status.
      </p>
    </div>
  );
}
