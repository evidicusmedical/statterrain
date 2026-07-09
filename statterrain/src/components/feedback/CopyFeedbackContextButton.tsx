"use client";

import { useState } from "react";
import { product } from "@/config/product";
import { BRIEF_SCOPE_STATEMENT } from "@/lib/export";

interface Props { locationLabel: string; radiusMiles: number; }

export function CopyFeedbackContextButton({ locationLabel, radiusMiles }: Props) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const context = [
      `${product.name} ${product.prototypeVersion}`,
      `Selected geography: ${locationLabel}`,
      `Selected radius/geography label: ${radiusMiles} miles`,
      `Data status: ${product.syntheticDataNotice}`,
      `Brief scope: ${BRIEF_SCOPE_STATEMENT}`,
      `Page URL: ${typeof window !== "undefined" ? window.location.href : "not available"}`,
    ].join("\n");

    await navigator.clipboard.writeText(context);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <button type="button" onClick={handleCopy} className="rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
      {copied ? "Feedback context copied" : "Copy feedback context"}
    </button>
  );
}
