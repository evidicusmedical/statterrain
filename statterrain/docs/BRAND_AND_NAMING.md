# StatTerrain — Brand & Naming

## Current status

"StatTerrain" is a **working product name**. Final trademark search and domain
clearance are pending — see `product.status` in `src/config/product.ts`, which is
surfaced in the app footer.

## Centralized configuration

All product naming, tagline, and legal copy live in a single file:
`src/config/product.ts`. To rename the product:

1. Update `name`, `shortName`, `tagline`, `description`, and the placeholder fields
   in `src/config/product.ts`.
2. Update `package.json` `name` field and this document.
3. Review `README.md` for any hard-coded mentions of the name.

Do not hard-code "StatTerrain" (or any tagline/disclaimer text) directly inside
components — always import from `src/config/product.ts` so a rename only touches
one file plus this documentation.

## Visual identity (prototype)

- Primary palette: `terrain` (deep green, evokes topography/terrain mapping) and
  `clinical` (blue, evokes clinical/health data), defined in `tailwind.config.ts`.
- Wordmark: set in monospace (`font-mono`) in the header to suggest a data/analytics
  tool rather than a consumer health app.
- Logo mark: a simple concentric "radius rings + pin" glyph rendered inline as SVG in
  `src/components/layout/Header.tsx`, echoing the map/geography theme without
  requiring an external image asset.

## Naming rationale

"Stat" nods to both statistics and emergency ("stat") urgency; "Terrain" nods to
geographic/topographic mapping of population-health and facility data.
