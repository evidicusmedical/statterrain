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
} from "@/lib/export";
import { useMemo, useState } from "react";

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
        <p className="text-xs font-medium text-slate-600">
          {product.syntheticDataNotice}
        </p>
        <p className="rounded-md border border-amber-200 bg-amber-50 p-2 text-xs leading-relaxed text-amber-900">
          {product.disclaimer}
        </p>
        <p className="rounded-md bg-terrain-50 p-2 text-xs leading-relaxed text-terrain-900">
          {BRIEF_SCOPE_STATEMENT}
        </p>
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
            Download Markdown
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
            Download JSON
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
            Download CSV
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
            Download County ACS CSV
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
            Download County ACS JSON
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
