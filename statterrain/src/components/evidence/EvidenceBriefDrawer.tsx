"use client";

import { Drawer } from "@/components/ui/Drawer";
import { product } from "@/config/product";
import type { BriefContext } from "@/lib/export";
import { buildMarkdownBrief, downloadCsvBrief, downloadJsonBrief, downloadMarkdownBrief } from "@/lib/export";
import { useMemo, useState } from "react";

interface EvidenceBriefDrawerProps {
  open: boolean;
  onClose: () => void;
  context: BriefContext;
}

export function EvidenceBriefDrawer({ open, onClose, context }: EvidenceBriefDrawerProps) {
  const [copied, setCopied] = useState(false);
  const markdown = useMemo(() => (open ? buildMarkdownBrief(context) : ""), [open, context]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <Drawer open={open} onClose={onClose} title={`${product.name} evidence brief`} side="right">
      <div className="flex flex-col gap-3 p-4">
        <p className="text-xs text-slate-500">{product.syntheticDataNotice}</p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => downloadMarkdownBrief(context)}
            className="rounded-md bg-terrain-600 px-3 py-2 text-xs font-semibold text-white hover:bg-terrain-700"
          >
            Download Markdown
          </button>
          <button
            type="button"
            onClick={() => downloadJsonBrief(context)}
            className="rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Download JSON
          </button>
          <button
            type="button"
            onClick={() => downloadCsvBrief(context)}
            className="rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Download CSV
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className="rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
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
