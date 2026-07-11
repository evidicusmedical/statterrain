import type { OverlayMetricId } from "@/types/metric";
import { OVERLAY_LABELS } from "@/types/metric";
import { FACILITY_MARKER_COLORS, OVERLAY_COLOR_SCALE } from "./mapStyles";
import { FACILITY_TYPE_LABELS, type FacilityType } from "@/types/facility";

const LEGEND_FACILITY_TYPES: FacilityType[] = ["hospital", "critical_access_hospital"];

export function MapLegend({
  overlay,
  onCollapse,
}: {
  overlay: OverlayMetricId | null;
  onCollapse: () => void;
}) {
  return (
    <div className="pointer-events-auto max-h-[42vh] w-[min(14rem,calc(100vw-1.5rem))] overflow-y-auto rounded-lg border border-slate-200 bg-white/95 p-2.5 text-[11px] shadow-panel sm:max-h-none sm:w-auto sm:max-w-[220px] sm:p-3 sm:text-xs">
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <h3 className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          Legend
        </h3>
        <button
          type="button"
          onClick={onCollapse}
          className="min-h-9 rounded-md border border-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-terrain-500 focus:ring-offset-1"
          aria-label="Hide legend"
        >
          Hide
        </button>
      </div>
      <ul className="mb-2 flex flex-col gap-0.5 sm:gap-1">
        {LEGEND_FACILITY_TYPES.map((type) => (
          <li key={type} className="flex items-center gap-2 text-slate-700">
            <span
              className="inline-block h-2.5 w-2.5 shrink-0 rounded-full border border-white shadow"
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
      <details className="mt-2 border-t border-slate-200 pt-1.5 text-[10px] leading-snug text-slate-500">
        <summary className="cursor-pointer font-semibold text-slate-600">Map note</summary>
        <p className="mt-1">
          CMS hospital markers are source-backed public records. Base map: OpenStreetMap. Map currency depends on contributor and tile-provider updates.
        </p>
      </details>
    </div>
  );
}
