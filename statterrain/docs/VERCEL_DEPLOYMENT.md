# StatTerrain — Vercel Deployment

This project is a standard Next.js 14 App Router application with no Replit-specific
dependencies, no required environment variables, and no backend services. It deploys
to Vercel unmodified.

## Steps

1. Push this repository to GitHub (or any Git provider Vercel supports).
   - Repository name convention used during development: `statterrain`
   - Prototype branch: `v0.1.0-static-prototype`
2. In the Vercel dashboard, choose **Add New… → Project** and import the repository.
3. Framework preset: Vercel auto-detects **Next.js** — no changes needed.
4. Build command: `next build` (default). Output directory: managed automatically by
   the Next.js framework preset.
5. Environment variables: **none required.** `.env.example` is provided only for future
   real-data integrations and is not read by the current prototype.
6. Click **Deploy**. No further configuration is necessary.

## Local verification before deploying

```bash
npm install
npm run lint
npm run typecheck
npm run build
npm run start
```

```bash
npx playwright install chromium   # first run only
npm run test:e2e
```

All commands should complete without errors using only this repository's
`package.json` — no monorepo tooling, workspace files, or Replit configuration is
required. See `docs/TESTING.md` for what the end-to-end suite covers.

## Continuous integration

`.github/workflows/ci.yml` (repository root) runs the same lint/typecheck/
build/test sequence on every push and pull request touching `statterrain/**`,
using a plain `ubuntu-latest` GitHub-hosted runner with no Replit-specific
setup. This is a useful reference for reproducing a clean-environment install
outside Replit.

## Notes

- Map tiles are loaded from the public OpenStreetMap tile servers
  (`https://{s}.tile.openstreetmap.org/...`) at runtime; no API key is required for
  this attribution-compliant usage tier.
- The evidence-brief export (Markdown/JSON/CSV) runs entirely client-side using the
  Blob/URL browser APIs — no server route is involved.
- `package-lock.json` was generated inside the Replit environment, which routes
  npm through an internal package-firewall mirror, so its `resolved` URLs point
  at `package-firewall.replit.local`. This is transparent to npm on any other
  machine: `npm ci`/`npm install` re-resolve packages against whatever registry
  is configured locally (the public npm registry by default), so it does not
  block installs on Vercel, GitHub Actions, or a developer laptop. If you want
  a lockfile with public-registry URLs for cleanliness, regenerate it with
  `rm package-lock.json && npm install` from outside the Replit environment.
