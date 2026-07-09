# CMS geocoding and geography join

## Release tracking rule

Every patch must update `product.prototypeVersion` in `src/config/product.ts`. This visible version is used to confirm Vercel deployment freshness and prevent stale UI confusion. Tests must be updated with each patch to assert the expected visible version.

## v0.2.7.1 live-geocoded preview status

PR #24 produced 5 live Census Geocoder matches and 5 geography joins for CMS Hospital General Information preview records. Preview eligibility requires real-public-data mode, non-fixture metadata, validation-safe output, valid latitude/longitude, matched geocoding status, joined geography status, and `usedInCurrentApp: false`.

Coordinates are public-data preview context only. Do not infer ED, trauma, stroke, STEMI, PCI, pediatric, perinatal, ICU, bed availability, transfer capability, operating status, or any clinical capability from geocoding results. The default map remains synthetic and broader CMS national coverage is not complete.
