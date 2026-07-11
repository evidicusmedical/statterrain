import type { Facility } from "@/types/facility";

const extensionPattern = /(?:ext\.?|extension|x)\s*(\d{1,8})\s*$/i;

export function normalizeCmsPhoneDisplay(value?: string | null): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;
  if (!/[0-9]/.test(trimmed)) return undefined;
  if (/[<>]/.test(trimmed)) return undefined;
  return trimmed.replace(/\s+/g, " ");
}

export function buildSafeTelephoneHref(value?: string | null): string | null {
  const display = normalizeCmsPhoneDisplay(value);
  if (!display) return null;
  const ext = display.match(extensionPattern)?.[1];
  const withoutExt = display.replace(extensionPattern, "");
  const hasInternationalPrefix = withoutExt.trim().startsWith("+");
  const digits = withoutExt.replace(/\D/g, "");
  if (digits.length === 10) return `tel:${digits}${ext ? `;ext=${ext}` : ""}`;
  if (digits.length === 11 && digits.startsWith("1")) return `tel:${digits}${ext ? `;ext=${ext}` : ""}`;
  if (hasInternationalPrefix && digits.length >= 8 && digits.length <= 15) return `tel:+${digits}${ext ? `;ext=${ext}` : ""}`;
  return null;
}

export function normalizeFacilityWebsite(value?: string | null): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;
  const candidate = /^[a-z][a-z0-9+.-]*:/i.test(trimmed) ? trimmed : (/^[\w.-]+\.[a-z]{2,}(?:[/:?#].*)?$/i.test(trimmed) ? `https://${trimmed}` : trimmed);
  try {
    const url = new URL(candidate);
    if (url.protocol !== "http:" && url.protocol !== "https:") return undefined;
    return url.toString();
  } catch {
    return undefined;
  }
}

export function formatFacilityAddress(facility: Pick<Facility, "address" | "city" | "state" | "zip"> & { addressLine2?: string; countyName?: string }): string | undefined {
  const street = [facility.address, facility.addressLine2].map((v) => v?.trim()).filter(Boolean).join(", ");
  const cityStateZip = [facility.city, [facility.state, facility.zip].map((v) => v?.trim()).filter(Boolean).join(" ")].map((v) => v?.trim()).filter(Boolean).join(", ");
  return [street, cityStateZip].filter(Boolean).join("\n") || undefined;
}
