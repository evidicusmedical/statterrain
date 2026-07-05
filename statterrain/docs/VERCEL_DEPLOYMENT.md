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
npm run build
npm run start
```

All four commands should complete without errors using only this repository's
`package.json` — no monorepo tooling, workspace files, or Replit configuration is
required.

## Notes

- Map tiles are loaded from the public OpenStreetMap tile servers
  (`https://{s}.tile.openstreetmap.org/...`) at runtime; no API key is required for
  this attribution-compliant usage tier.
- The evidence-brief export (Markdown/JSON/CSV) runs entirely client-side using the
  Blob/URL browser APIs — no server route is involved.
