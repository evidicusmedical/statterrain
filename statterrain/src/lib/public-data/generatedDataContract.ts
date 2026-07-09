import type { GeneratedDatasetContract } from "@/types/publicData";

export const GENERATED_PUBLIC_DATA_SCHEMA_VERSION = "generated-public-data-v0.2.0";

export const GENERATED_PUBLIC_DATA_DISPLAY_RULE =
  "Generated public data must not become app-visible unless validation passes or an explicitly labeled last-known-good fallback is used. The current app must continue using synthetic data.";

export type PublicGeneratedDataFile<TRecord = unknown> = GeneratedDatasetContract<TRecord>;

export function isGeneratedDataSafeToDisplay(contract: PublicGeneratedDataFile): boolean {
  const { metadata, records } = contract;
  return Boolean(
    metadata.safeToDisplay &&
      (metadata.validationStatus === "pass" || metadata.lastKnownGoodStatus.active) &&
      metadata.recordCount === records.length &&
      metadata.dataMode !== "not-yet-ingested",
  );
}
