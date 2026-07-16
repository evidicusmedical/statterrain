"use client";

import { Drawer } from "@/components/ui/Drawer";
import { product } from "@/config/product";
import type { BriefContext } from "@/lib/export";
import {
  BRIEF_SCOPE_STATEMENT,
  buildMarkdownBrief,
  downloadCsvBrief,
  downloadJsonBrief,
  downloadMarkdownBrief,
  downloadCountyAcsCsv,
  downloadCountyAcsJson,
  downloadRequirementsTraceabilityJson,
} from "@/lib/export";
import { useMemo, useState } from "react";
import { getTraceabilitySummary, requirementStatusLabel, type RequirementStatus, sooRequirements } from "@/config/sooRequirements";

interface EvidenceBriefDrawerProps {
  open: boolean;
  onClose: () => void;
  context: BriefContext;
}

type BriefAction = "markdown" | "json" | "csv" | "countyCsv" | "countyJson" | "copy";

export function EvidenceBriefDrawer({
  open,
  onClose,
  context,
}: EvidenceBriefDrawerProps) {
  const [copied, setCopied] = useState(false);
  const [activeAction, setActiveAction] = useState<BriefAction | null>(null);
  const [showTraceability, setShowTraceability] = useState(false);
  const [statusFilter, setStatusFilter] = useState<RequirementStatus | "all">("all");
  const traceabilitySummary = useMemo(() => getTraceabilitySummary(), []);
  const filteredRequirements = useMemo(() => sooRequirements.filter((requirement) => statusFilter === "all" || requirement.status === statusFilter), [statusFilter]);
  const markdown = useMemo(
    () => (open ? buildMarkdownBrief(context) : ""),
    [open, context],
  );

  const actionClass = (action: BriefAction) =>
    activeAction === action
      ? "rounded-md border border-terrain-800 bg-terrain-800 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-terrain-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terrain-700"
      : "rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terrain-600";

  async function handleCopy() {
    setActiveAction("copy");
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={`${product.name} evidence brief`}
      side="right"
    >
      <div className="flex flex-col gap-3 p-4">
        <section aria-labelledby="evidence-brief-introduction"><h2 id="evidence-brief-introduction" className="text-base font-semibold text-slate-900">Evidence Brief</h2><p className="mt-1 text-xs leading-relaxed text-slate-600">This Evidence Brief records the location, radius, facilities, county context, source data, and methods used in this StatTerrain analysis.</p></section>
        <div className="space-y-3 text-xs text-slate-700">
          <section><h3 className="font-semibold text-slate-900">Research area</h3><dl className="mt-1 grid grid-cols-[8rem_1fr] gap-y-1"><dt>Planning location</dt><dd>{context.locationLabel}</dd><dt>Coordinates</dt><dd>{context.planningLocation ? `${context.planningLocation.latitude}, ${context.planningLocation.longitude}` : "Not reported"}</dd><dt>Planning radius</dt><dd>{context.radiusMiles} miles</dd><dt>Containing county</dt><dd>{context.containingCounty?.fullName ?? "Not resolved"}</dd><dt>Intersecting counties</dt><dd>{context.intersectingCounties?.length ?? 0}</dd><dt>StatTerrain version</dt><dd>{product.prototypeVersion}</dd></dl></section>
          <section><h3 className="font-semibold text-slate-900">Facility results</h3><p className="mt-1">{context.briefFacilities.length} mapped hospitals within radius. Facility records, identifiers, address, straight-line distance, source classification, release, and retrieval date are included below and in the Evidence JSON.</p></section>
          <section><h3 className="font-semibold text-slate-900">Population context</h3><p className="mt-1">County values describe the whole containing county, not the population inside the selected radius.</p></section>
          <section><h3 className="font-semibold text-slate-900">Demographic context</h3><p className="mt-1">County estimates, United States percentages, differences, margins of error, groups measured, and the Age 18 to 64 derivation method are included below.</p></section>
          <section><h3 className="font-semibold text-slate-900">Data sources</h3><p className="mt-1">Centers for Medicare &amp; Medicaid Services; U.S. Census Bureau American Community Survey 2024 ACS 5-year (2020–2024); and U.S. Census Bureau TIGER/Line 2024 county boundaries.</p></section>
          <section><h3 className="font-semibold text-slate-900">Methods</h3><p className="mt-1">Facilities use a straight-line planning radius. Age 18 to 64 is derived from total population minus under age 18 minus age 65 and older. “Group measured” is the plain-language label for the ACS universe, meaning the population or household group included in the estimate.</p></section>
          <section aria-labelledby="requirements-traceability-heading"><h3 id="requirements-traceability-heading" className="font-semibold text-slate-900">Requirements traceability</h3><p className="mt-1">Registry v0.3.9 prototype: {traceabilitySummary.total} requirements. Supported: {traceabilitySummary.byStatus.supported}; Partially supported: {traceabilitySummary.byStatus["partially-supported"]}; Planned: {traceabilitySummary.byStatus.planned}; Data dependent: {traceabilitySummary.byStatus["data-dependent"]}; Out of scope: {traceabilitySummary.byStatus["out-of-scope"]}.</p><p className="mt-1">Supported requirements have an active method and source. Planned and data-dependent requirements are known future work, not available capabilities.</p><button type="button" aria-expanded={showTraceability} aria-controls="requirements-traceability-view" onClick={() => setShowTraceability((value) => !value)} className="mt-2 rounded border border-slate-300 bg-white px-2 py-1 font-semibold text-slate-700 hover:bg-slate-50">{showTraceability ? "Hide requirements traceability" : "View requirements traceability"}</button>{showTraceability && <div id="requirements-traceability-view" className="mt-2 space-y-2" aria-live="polite"><label className="block font-semibold" htmlFor="requirements-status-filter">Filter requirements by status</label><select id="requirements-status-filter" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as RequirementStatus | "all")} className="w-full rounded border border-slate-300 p-1"><option value="all">All</option>{Object.entries(requirementStatusLabel).map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select><p>Some facility-characteristic requirements depend on future authorized licensed data and remain inactive in this prototype.</p>{filteredRequirements.map((requirement) => <details key={requirement.id} className="rounded border border-slate-200 p-2"><summary className="cursor-pointer font-semibold text-slate-900">{requirement.id} — {requirement.title} <span className="font-normal">(Status: {requirementStatusLabel[requirement.status]})</span></summary><div className="mt-1 space-y-1"><p><strong>Objective:</strong> {requirement.objective}</p><p><strong>Sources:</strong> {requirement.sourceDependencies.map((source) => `${source.displayName}${source.active ? "" : " (inactive future dependency)"}`).join("; ")}</p><p><strong>Evidence mapping:</strong> {requirement.evidenceFields.join(", ") || "Evidence Brief context"}</p><p><strong>Limitation:</strong> {requirement.limitations[0] || "None recorded."}</p>{requirement.futureWork.length > 0 && <p><strong>Future work:</strong> {requirement.futureWork.join(" ")}</p>}</div></details>)}</div>}</section>
          <section><h3 className="font-semibold text-slate-900">Limitations</h3><p className="mt-1">Comparisons are descriptive and are not statistical significance tests. This is not clinical guidance or a real-time operational report.</p></section>
        </div>
        <section aria-labelledby="export-options-heading"><h3 id="export-options-heading" className="font-semibold text-slate-900">Export options</h3><p className="mt-1 text-xs text-slate-600">Exports preserve source, method, status, and margin-of-error metadata.</p></section>
        <div
          className="flex flex-wrap items-center gap-2"
          aria-label="Evidence brief actions"
        >
          <button
            type="button"
            onClick={() => {
              setActiveAction("markdown");
              downloadMarkdownBrief(context);
            }}
            aria-pressed={activeAction === "markdown"}
            className={actionClass("markdown")}
          >
            Download Evidence Markdown
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveAction("json");
              downloadJsonBrief(context);
            }}
            aria-pressed={activeAction === "json"}
            className={actionClass("json")}
          >
            Download Evidence JSON
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveAction("csv");
              downloadCsvBrief(context);
            }}
            aria-pressed={activeAction === "csv"}
            className={actionClass("csv")}
          >
            Download hospital CSV
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveAction("countyCsv");
              downloadCountyAcsCsv(context);
            }}
            aria-pressed={activeAction === "countyCsv"}
            className={actionClass("countyCsv")}
          >
            Download county demographic CSV
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveAction("countyJson");
              downloadCountyAcsJson(context);
            }}
            aria-pressed={activeAction === "countyJson"}
            className={actionClass("countyJson")}
          >
            Download county demographic JSON
          </button>
          <button type="button" onClick={() => downloadRequirementsTraceabilityJson()} className={actionClass("json")}>
            Download requirements traceability JSON
          </button>
          <button
            type="button"
            onClick={handleCopy}
            aria-pressed={activeAction === "copy"}
            className={actionClass("copy")}
          >
            {copied ? "Copied!" : "Copy Markdown"}
          </button>
        </div>
        <pre className="max-h-[70vh] overflow-y-auto whitespace-pre-wrap rounded-md border border-slate-200 bg-slate-50 p-3 text-[11px] leading-relaxed text-slate-700">
          {markdown}
        </pre>
      </div>
    </Drawer>
  );
}
