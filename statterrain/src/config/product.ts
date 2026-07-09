/**
 * Central product configuration for StatTerrain.
 *
 * This is the single source of truth for product naming, branding copy, and
 * legal/disclaimer text. Do not hard-code the product name, tagline, or
 * disclaimer elsewhere in the app -- import them from here so the product
 * can be renamed later by editing only this file (plus a small number of
 * branding assets documented in docs/BRAND_AND_NAMING.md).
 */

export const product = {
  name: "StatTerrain",
  shortName: "StatTerrain",
  tagline: "Emergency-care resources and population-health intelligence",
  description:
    "StatTerrain is a public-data mapping and evidence-brief platform for emergency and EMS clinicians, medical directors, quality-improvement teams, and regional planners to understand nearby facilities, publicly documented capabilities, and population-health context.",
  status: "Working product name -- final trademark and domain clearance pending.",
  prototypeVersion: "v0.1.5 prototype",
  repositoryNamePlaceholder: "statterrain",
  repositoryUrlPlaceholder: "https://github.com/<your-org>/statterrain",
  supportContactPlaceholder: "support@example.com (placeholder -- update before real use)",
  feedback: {
    href: "mailto:mathew.h.lowe@gmail.com?subject=StatTerrain%20Beta%20Feedback",
    label: "Send Feedback",
  },
  disclaimer:
    "StatTerrain summarizes public datasets for education, planning, quality improvement, orientation, and evidence-based write-ups. It is not intended for patient-specific triage, transfer decisions, medical direction, live diversion status, bed availability, or emergency response. Facility capabilities and operating status must be verified through official local channels.",
  syntheticDataNotice:
    "Synthetic demonstration data — not a real-world source. Do not use for operational or clinical purposes.",
} as const;

export type Product = typeof product;
