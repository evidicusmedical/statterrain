function applyHemisphere(value: number, hemi?: string): number {
  if (!hemi) return value;
  return /[SW]/i.test(hemi) ? -Math.abs(value) : Math.abs(value);
}

export function parseCoordinateSearch(query: string): { lat: number; lng: number } | null | "invalid" {
  const normalized = query.trim().replace(/[()]/g, " ").replace(/°/g, " ");
  const explicit = normalized.match(/lat(?:itude)?\s*[:=]?\s*([+-]?\d+(?:\.\d+)?)\s*([NS])?\s*(?:[,;\s]+)?lon(?:gitude)?\s*[:=]?\s*([+-]?\d+(?:\.\d+)?)\s*([EW])?/i);
  const hemiPair = normalized.match(/([+-]?\d+(?:\.\d+)?)\s*([NS])\s*[,;\s]+([+-]?\d+(?:\.\d+)?)\s*([EW])/i);
  const plainPair = normalized.match(/^\s*([+-]?\d+(?:\.\d+)?)\s*(?:,|\s)\s*([+-]?\d+(?:\.\d+)?)\s*$/);
  let lat: number | null = null;
  let lng: number | null = null;
  if (explicit) {
    lat = applyHemisphere(Number(explicit[1]), explicit[2]);
    lng = applyHemisphere(Number(explicit[3]), explicit[4]);
  } else if (hemiPair) {
    lat = applyHemisphere(Number(hemiPair[1]), hemiPair[2]);
    lng = applyHemisphere(Number(hemiPair[3]), hemiPair[4]);
  } else if (plainPair) {
    lat = Number(plainPair[1]);
    lng = Number(plainPair[2]);
  } else {
    return null;
  }
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) return "invalid";
  return { lat, lng };
}
