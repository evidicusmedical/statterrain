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
  status:
    "Working product name -- final trademark and domain clearance pending.",
  prototypeVersion: "v0.3.3 prototype",
  repositoryNamePlaceholder: "statterrain",
  repositoryUrlPlaceholder: "https://github.com/<your-org>/statterrain",
  supportContactPlaceholder:
    "support@example.com (placeholder -- update before real use)",
  feedback: {
    recipient: "mathew.h.lowe+statterrain@gmail.com",
    subject: "StatTerrain Beta Feedback",
    label: "Send Feedback",
  },
  disclaimer:
    "Planning prototype only. StatTerrain is for education, orientation, quality improvement, and public-data situational awareness. It is not for clinical care, patient-specific decisions, EMS routing, triage, transfer decisions, dispatch, medical control, live diversion, bed availability, or emergency response. CMS hospital facility listings are public source-backed data when enabled; other prototype data remain synthetic demonstration data. Verify facility capability, operating status, maps, and public-data findings with official sources. Population-health metrics are area-level planning context and do not describe or diagnose any individual person. This tool does not provide medical, legal, operational, or emergency advice. In an emergency, use local emergency protocols and official emergency communication channels.",
  syntheticDataNotice:
    "Synthetic demonstration data — not a real-world source. Do not use for operational or clinical purposes.",
} as const;

export type Product = typeof product;
