# Public Data Scripts

Plain Node.js `.mjs` scripts for the v0.2.0 public-data automation scaffold.

- `validate-source-registry.mjs` validates planned source placeholders and confirms no active or real-ingested public data source is configured.
- `generate-refresh-report.mjs` writes a deterministic readiness report without fetching external data or changing app-visible data.

Run from `statterrain/`:

```bash
npm run data:validate-sources
npm run data:refresh-report
```
