import type { CapabilityName, CapabilityRecord } from "@/types/facility";
import { CAPABILITY_LABELS } from "@/types/facility";
import type { ConfidenceLevel, FreshnessStatus } from "@/types/source";

interface CapabilityInput {
  capability: CapabilityName;
  level?: string | null;
  populationServed?: string | null;
  sourceId: string;
  sourceAgency: string;
  sourceDate: string;
  retrievalDate?: string;
  confidence: ConfidenceLevel;
  freshness: FreshnessStatus;
  expirationDate?: string | null;
  limitations?: string[];
}

/**
 * Builds a fully-populated capability record. Each capability carries its
 * own source attribution -- one facility-level source is never reused as
 * evidence for every capability a facility holds.
 */
export function makeCapability(input: CapabilityInput): CapabilityRecord {
  return {
    capability: input.capability,
    label: CAPABILITY_LABELS[input.capability],
    level: input.level ?? null,
    populationServed: input.populationServed ?? null,
    sourceId: input.sourceId,
    sourceAgency: input.sourceAgency,
    sourceDate: input.sourceDate,
    retrievalDate: input.retrievalDate ?? "2025-11-15",
    confidence: input.confidence,
    freshness: input.freshness,
    expirationDate: input.expirationDate ?? null,
    limitations: input.limitations ?? [
      "Synthetic demonstration capability record -- verify current status locally.",
    ],
    isSynthetic: true,
  };
}
