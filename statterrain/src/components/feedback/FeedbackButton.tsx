"use client";

import { product } from "@/config/product";
import { BRIEF_SCOPE_STATEMENT } from "@/lib/export";

interface FeedbackContext {
  locationLabel?: string;
  radiusMiles?: number;
  facilityLabel?: string | null;
  facilityTypeLabel?: string | null;
  activeMobileTab?: string;
  summaryState?: string;
  evidenceBriefScope?: string;
}

function buildFeedbackHref(context: FeedbackContext = {}) {
  const currentUrl =
    typeof window !== "undefined" ? window.location.href : "URL not available";
  const generated =
    typeof window !== "undefined"
      ? new Date().toLocaleString()
      : new Date().toISOString();
  const selectedFacility = context.facilityLabel
    ? `${context.facilityLabel}${context.facilityTypeLabel ? ` (${context.facilityTypeLabel})` : ""}`
    : "None selected";
  const body = [
    "StatTerrain Beta Feedback",
    "",
    "Context:",
    `- App: ${product.name}`,
    `- Version: ${product.prototypeVersion}`,
    "- Data status: Synthetic demonstration data only",
    `- URL: ${currentUrl}`,
    `- Selected geography: ${context.locationLabel ?? "Not available"}`,
    `- Selected radius/geography label: ${context.radiusMiles ? `${context.radiusMiles} miles` : "Not available"}`,
    `- Selected facility: ${selectedFacility}`,
    `- Active mobile tab: ${context.activeMobileTab ?? "Not available"}`,
    `- Summary state: ${context.summaryState ?? "Not available"}`,
    `- Evidence brief scope: ${context.evidenceBriefScope ?? BRIEF_SCOPE_STATEMENT}`,
    `- Generated: ${generated}`,
    "- Note: This app uses synthetic demo data only.",
    "",
    "Feedback:",
    "[Please describe what worked, what was confusing, what data looked wrong or missing, and what use case you were testing.]",
  ].join("\n");

  return `mailto:${product.feedback.recipient}?subject=${encodeURIComponent(product.feedback.subject)}&body=${encodeURIComponent(body)}`;
}

export function FeedbackButton({
  className = "",
  context,
}: {
  className?: string;
  context?: FeedbackContext;
}) {
  return (
    <a
      href={buildFeedbackHref(context)}
      target="_blank"
      rel="noreferrer"
      className={`inline-flex whitespace-nowrap rounded-md border border-terrain-600 px-3 py-2 text-sm font-semibold text-terrain-700 hover:bg-terrain-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terrain-600 ${className}`}
    >
      {product.feedback.label}
    </a>
  );
}
