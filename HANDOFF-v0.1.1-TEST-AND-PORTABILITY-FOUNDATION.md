# StatTerrain — Handoff: v0.1.1 Test, Dependency, and Portability Foundation

Use this document to onboard another model or engineer to exactly what changed
in this pass, why, and what still needs a human decision. It supplements
`HANDOFF.md` (the general project handoff) rather than replacing it — read
that one first for overall architecture and product context.

## 1. Scope of this pass

Per the v0.1.1 spec: add automated end-to-end test coverage, a CI workflow,
a dependency/vulnerability review, a portability audit, and documentation
updates. **No new product features. No live data. No v0.2.0 work.** This
document exists to close out that scope cleanly.

## 2. What changed

### 2.1 Test-selector additions (minimal, non-visual)

Four components got small, additive hooks so Playwright can target elements
that have no unambiguous accessible role/name. No visual or behavioral change.

- `src/components/map/MapView.tsx` — `data-testid="map-view"` on the wrapper
  div; `pathOptions.className` on Leaflet `CircleMarker`s:
  `search-location-marker` for the search-result marker, and
  `facility-marker facility-marker-<id>` for each facility marker.
- `src/components/regional-summary/RegionalSummaryPanel.tsx` —
  `data-testid="facility-count-<type>"` on each facility-type summary tile.
- `src/components/facilities/FacilityDetailPanel.tsx` —
  `data-testid="facility-detail-panel"` / `"facility-detail-empty"` /
  `"facility-detail-name"`.

### 2.2 Playwright end-to-end smoke suite

- Added `playwright.config.ts` (Desktop Chrome project, `webServer` runs
  `npm run dev`, reuses an already-running dev server outside CI).
- Added `tests/smoke.spec.ts` — 12 tests covering the required checks: page
  load, synthetic-data notice, disclaimer, map rendering with no fatal
  console/page errors, three filter types (facility type, hospital
  capability, source confidence) each measurably changing results, facility
  selection → detail panel with source/confidence content, population
  overlay change, all three evidence-brief export formats
  (Markdown/JSON/CSV), and two responsive-layout checks (mobile viewport, no
  horizontal overflow; tablet viewport, core controls usable).
- Added npm scripts: `typecheck`, `test:e2e`, `test:e2e:ui`, `test:e2e:report`.
- Added `docs/TESTING.md` documenting coverage, selector strategy, how to run
  the suite, and a Replit-environment note about Playwright's browser
  installer (see §4).
- Result: **12/12 tests pass** (see §5 for the exact run captured for this
  handoff).

### 2.3 GitHub Actions CI workflow

- Added `.github/workflows/ci.yml` at the **repository root** (not inside
  `statterrain/`, consistent with GitHub's requirement that workflow files
  live under `.github/workflows/` at the repo root). It triggers on pushes
  and pull requests touching `statterrain/**`, and runs on a plain
  `ubuntu-latest` runner with `working-directory: statterrain` as the
  default for all steps: `npm ci` → `npm run lint` → `npm run typecheck` →
  `npm run build` → `npx playwright install --with-deps chromium` →
  `npm run test:e2e`, then uploads the Playwright HTML report as a build
  artifact (always, pass or fail).
- **This workflow has not been run on GitHub Actions itself** — it has only
  been reasoned through against `package.json`'s actual scripts and verified
  equivalent commands locally (see §5). Confirm it goes green on the first
  real push/PR.

### 2.4 Documentation updates

- `README.md` — added `typecheck` and `test:e2e` to the commands list, a new
  "Testing" section, `tests/` to the project-structure tree, and a
  `docs/TESTING.md` line in the documentation set.
- `docs/VERCEL_DEPLOYMENT.md` — added typecheck + Playwright commands to
  "Local verification before deploying", a new "Continuous integration"
  section, and a note explaining the `package-firewall.replit.local` URLs
  inside `package-lock.json` (see §4).
- `docs/TESTING.md` — new file (see §2.2).

## 3. Dependency and vulnerability review

Commands run: `npm audit`, `npm outdated`, `npm ls --depth=0` (full output
captured in §5).

- **`npm ls --depth=0`**: all first-level dependencies matched their
  `package.json` semver ranges at their latest compatible patch/minor
  version already (e.g. `next@14.2.35` satisfies `^14.2.18`,
  `typescript@5.9.3` satisfies `^5.5.4`). **No `package.json` version ranges
  needed to change** — the installed versions were already current within
  those ranges.
- One extraneous package is reported: `@emnapi/wasi-threads` (a transitive
  native-binary helper pulled in by another dependency, not a direct
  dependency of this project). Harmless; not introduced by this pass — it
  appears in a clean `npm install` regardless of these changes.
- **`npm outdated`**: every outdated entry is a **major** version bump
  (React 18→19, Next 14→16, ESLint 8→10, TypeScript 5→6, Tailwind 3→4,
  react-leaflet 4→5, `@types/*` majors). Per the spec constraint ("safe,
  non-breaking updates only — no major version bumps"), **none of these were
  applied.**
- **`npm audit`**: 5 vulnerabilities (1 moderate, 4 high), all rooted in
  `next`'s and `eslint-config-next`'s transitive dependencies (`next` itself,
  its bundled `postcss`, and `glob` via `@next/eslint-plugin-next`). The
  **only** fix path `npm audit` offers is `npm audit fix --force`, which
  upgrades `next` to `16.2.10` — a major version bump, explicitly out of
  scope for this pass. **Deferred, not applied.** This is a static-data,
  client-only prototype with no server-side attack surface handling
  untrusted input, which lowers the practical severity of these specific
  advisories (they are mostly about server-side request handling,
  middleware, and Image Optimizer paths this app doesn't exercise), but they
  should be revisited before any production use beyond a demo, and
  certainly before/alongside any future `v0.2.0` work that adds a live
  backend.

## 4. Portability audit

Grepped `statterrain/` (source, config, docs) case-insensitively for
`replit`, `repl.co`, `replit.dev`, `REPL_ID`, `REPL_SLUG`.

- **`src/`, `next.config.mjs`, `tailwind.config.ts`, `postcss.config.js`,
  `tsconfig.json`**: zero matches. No Replit-specific code, env-var reads, or
  config exists in the application itself.
- **Docs (`HANDOFF.md`, `README.md`, `docs/VERCEL_DEPLOYMENT.md`,
  `docs/PRODUCT_SCOPE.md`)**: matches are all *prose describing the absence*
  of Replit dependencies (e.g. "no Replit-specific dependencies") — expected
  and correct, not a portability problem.
- **`.env.example`**: present but intentionally empty of required values;
  documents that zero environment variables are needed.
- **`package-lock.json`**: contains `resolved` URLs pointing at
  `http://package-firewall.replit.local/npm/...` for every package. This is
  a byproduct of this Replit workspace's `NPM_CONFIG_REGISTRY` environment
  variable (an internal package-firewall mirror), not something baked into
  the project's own configuration (no `.npmrc` in `statterrain/` sets this).
  **This does not block portability**: `npm ci`/`npm install` on any other
  machine (Vercel, GitHub Actions, a developer laptop) uses whatever
  registry *that* environment has configured — normally the public npm
  registry — and will re-resolve every package against it, ignoring the
  stale `replit.local` hostname baked into this lockfile's `resolved`
  fields. This is documented in `docs/VERCEL_DEPLOYMENT.md`. If a fully
  "clean" lockfile is wanted, regenerate it from outside Replit with
  `rm package-lock.json && npm install`.
- **Workflow / `.replit` config**: the `StatTerrain` Replit workflow
  (`cd statterrain && npm run dev`) exists purely for local preview inside
  this workspace and is not part of the shipped repository content — it's
  Replit project configuration, not `statterrain/` project configuration.

**Conclusion: the `statterrain/` application code and its own configuration
are fully portable.** The only Replit fingerprint is inside the generated
`package-lock.json`'s `resolved` URLs, which is inert outside this
environment for the reasons above.

## 5. Verification commands run (this session)

All commands below were run from `statterrain/` against the checked-in state
at the end of this pass.

```
$ npm ci                                    # see note below
$ npm run lint                              → ✔ No ESLint warnings or errors
$ npm run typecheck                         → tsc --noEmit, no output (pass)
$ npm run build                             → ✓ Compiled successfully, 4/4 static pages generated
$ npm run test:e2e                          → 12 passed (35.4s)
$ npm audit                                 → 5 vulnerabilities (1 moderate, 4 high) — see §3
$ npm outdated                              → 11 packages, all major-version-only — see §3
$ npm ls --depth=0                          → 16 direct deps + 1 extraneous transitive — see §3
```

**`npm ci` note**: in this Replit sandbox, `npm ci` intermittently failed
with `ENOTEMPTY` errors while removing a pre-existing `node_modules`
directory containing native/compiled artifacts (e.g. `next/dist/build/swc`,
`es-abstract`'s versioned subfolders). This reproduced across multiple clean
attempts (including after `mv`-ing `node_modules` out of the way first) and
appears to be a filesystem/container-specific quirk of this workspace rather
than a lockfile or dependency problem — `npm install` against the same
`package.json`/`package-lock.json` completed successfully every time, and
the resulting install passed lint, typecheck, build, and the full e2e suite
without issue. The `package-lock.json` itself was regenerated during this
session (see git diff) to fix an unrelated pre-existing lockfile/tree
mismatch (a missing `@emnapi/wasi-threads` entry) that was causing `npm ci`
to fail with a clear "Missing: ... from lock file" error before that fix.
**Recommend treating the GitHub Actions run of `.github/workflows/ci.yml`
(a clean `ubuntu-latest` runner, no pre-existing `node_modules`) as the
authoritative `npm ci` verification**, since it won't hit this sandbox-local
issue.

```
$ git status --short
 M .replit
 M statterrain/.gitignore
 M statterrain/README.md
 M statterrain/docs/VERCEL_DEPLOYMENT.md
 M statterrain/package-lock.json
 M statterrain/package.json
 M statterrain/src/components/facilities/FacilityDetailPanel.tsx
 M statterrain/src/components/map/MapView.tsx
 M statterrain/src/components/regional-summary/RegionalSummaryPanel.tsx
?? .github/
?? statterrain/docs/TESTING.md
?? statterrain/playwright.config.ts
?? statterrain/tests/
?? statterrain/docs/handoffs/

$ git diff --name-status
M       .replit
M       statterrain/.gitignore
M       statterrain/README.md
M       statterrain/docs/VERCEL_DEPLOYMENT.md
M       statterrain/package-lock.json
M       statterrain/package.json
M       statterrain/src/components/facilities/FacilityDetailPanel.tsx
M       statterrain/src/components/map/MapView.tsx
M       statterrain/src/components/regional-summary/RegionalSummaryPanel.tsx

$ git diff --check
(no output — no whitespace errors)
```

Notes on the diff list:
- `.replit` and `replit.nix` (new, untracked) changed as a side effect of
  installing the Nix system libraries Chromium needs to launch in this
  sandbox (glib, nss, dbus, gtk3, etc. — see §6). This is Replit workspace
  configuration, not part of the `statterrain/` application, and does not
  affect portability (see §4).
- `statterrain/package-lock.json` changed because it was regenerated to fix
  a pre-existing lockfile/tree mismatch (see the `npm ci` note above), not
  because any dependency version was intentionally bumped.

## 6. Environment notes specific to this Replit workspace

These do not affect the shipped project but are useful if you continue work
here:

- Playwright's `npx playwright install --with-deps chromium` fails in this
  container (no `apt`/`sudo`). Chromium itself installs fine via
  `npx playwright install chromium` (without `--with-deps`); the missing
  shared libraries were then supplied via Nix packages (glib, nss, nspr,
  dbus, at-spi2-atk, cups, libdrm, libxkbcommon, mesa, gtk3, pango, cairo,
  alsa-lib, the relevant Xorg libs, expat, libgbm). This is already reflected
  in the workspace's Nix configuration. On GitHub Actions' `ubuntu-latest`
  runner, `--with-deps` works normally and this workaround is unnecessary.
- If the Next.js dev server serves stale/mismatched build assets (404s for
  hashed `_next/static/...` chunks after many hot-reloads), clear `.next/`
  and restart the dev server.

## 7. What was explicitly NOT done (and why)

- **No major dependency version bumps** (React 19, Next 16, Tailwind 4,
  ESLint 10, TypeScript 6, react-leaflet 5) — out of scope per spec; also
  the only path to closing the current `npm audit` findings, so those
  remain open (§3).
- **No new product features, no live data, no v0.2.0 work** — out of scope
  per spec.
- **No feature branch was created or committed to
  `v0.1.1-test-and-portability-foundation`.** The agent operating in this session cannot
  create git branches or make commits directly; only the platform's
  automatic checkpointing on `main` applies. If a dedicated branch and a
  commit with the message `test: add StatTerrain CI and smoke test
  foundation` are required, a human (or a git-capable follow-up task) needs
  to create the branch and commit from the current `main` working tree
  state.

## 8. How to resume / verify

1. `cd statterrain && npm install` (prefer `install` over `ci` in this
   sandbox; see §5's `npm ci` note — `ci` is expected to work cleanly on any
   standard machine or CI runner).
2. `npm run lint && npm run typecheck && npm run build` — should all pass
   with no changes needed.
3. `npx playwright install chromium` (or `--with-deps` outside Replit) then
   `npm run test:e2e` — should show `12 passed`.
4. Push to GitHub and confirm `.github/workflows/ci.yml` goes green on a
   real Actions runner — this is the one piece of this pass that could not
   be verified end-to-end from inside this session.
5. Decide, with the user, whether the
   `v0.1.1-test-and-portability-foundation` branch and the specified commit
   message still need to be created manually, per §7.

## 9. Git Synchronization Outcome (attempted, blocked)

A follow-up pass attempted to reconcile the completed v0.1.1 work with
`origin/main` and publish it to a reviewable branch. **The synchronization
could not be performed** because this execution environment hard-blocks all
git write operations — not just for the main agent, but identically inside
this assigned background task session. What was confirmed and attempted:

- **Original local commit**: `f0e3c75` ("Add automated testing and CI
  workflow for enhanced application stability") — contains the full v0.1.1
  test/CI/portability change set described in §2–§4 of this document.
- **Current local `HEAD` at sync time**: `0c5bf3f` ("Document steps for
  synchronizing code with remote history"), one commit ahead of `f0e3c75`.
  This extra commit only adds an attached-asset text file (the pasted sync
  instructions) and touches no application code — `f0e3c75` remains intact
  and unmodified underneath it.
- **Remote `main` commit (`origin/main`) before rebase**: `dae0f84` ("Add a
  portable frontend prototype for emergency care resource mapping"), per the
  last successful fetch in this workspace. `origin/main` does **not**
  contain `698f889` or `f0e3c75` — those are local-only commits, which is
  why the earlier push attempt was rejected as a non-fast-forward.
- **Backup branch**: `git branch backup-v0.1.1-before-sync f0e3c75` was
  attempted and rejected by the sandbox with: *"Destructive git operations
  are not allowed in the main agent. Use the `project_tasks` skill..."* —
  the same restriction applied even though this was already running as a
  dedicated background task, not the main agent. The command left a stale
  `.git/refs/heads/backup-v0.1.1-before-sync.lock` file; removing even that
  lock file via `rm` was **also blocked** by the same guard. **No backup
  branch exists as a result** — `f0e3c75` and `0c5bf3f` remain safe and
  unmodified on `main`, which is the only protection currently in place.
- **`git fetch origin --prune`**: attempted; the command did not return
  within the available time and no output was captured (may have been
  silently blocked by the same guard rather than a network issue — not
  confirmed either way).
- **Review branch `v0.1.1-test-and-portability-foundation`**: **not
  created** — blocked by the same restriction before this step could be
  reached.
- **Rebase**: **not attempted** — no review branch existed to rebase.
- **Conflicts**: none encountered (rebase never started).
- **Rebased commit hash**: none — no rebase occurred.
- **Verification commands (lint/typecheck/build/Playwright)**: **not
  re-run** in this pass, since no new commit/branch state was produced to
  verify. The most recent confirmed-passing results remain those in §5 of
  this document (12/12 Playwright tests, clean lint/typecheck/build)
  against `f0e3c75`'s tree.
- **Push result**: **no push was made** — nothing was pushed to `origin` in
  this pass, `main` or otherwise.
- **Remote branch URL**: none — no branch was pushed.
- **Pull request**: none was created.
- **No force push or remote-history overwrite occurred.** No git write
  command of any kind succeeded in this pass; `main`, `origin/main`, and all
  existing branches/commits are exactly as they were before this attempt.

**Root cause**: this Replit workspace's sandbox blocks git branch/commit/
push-adjacent operations unconditionally, for both the main agent and any
background task agent operating on this same repository checkout. Creating
the backup branch, the review branch, the rebase, and the push all require
a git-capable actor that isn't available from inside this
workspace's task-execution environment. This is an environment limitation,
not a decision about the v0.1.1 content itself, which remains complete,
tested, and unchanged in commit `f0e3c75`.

**Recommended next manual action**: from a git-capable environment outside
this sandbox (a developer machine, GitHub's web UI, or GitHub Actions with
push permissions), pull this repository at its current `main` (`0c5bf3f`,
with `f0e3c75` as its parent), then run:

```
git branch backup-v0.1.1-before-sync f0e3c75
git fetch origin --prune
git switch -C v0.1.1-test-and-portability-foundation f0e3c75
git rebase origin/main
# resolve any conflicts, then:
cd statterrain && npm ci && npm run lint && npm run typecheck && npm run build && npm run test:e2e
cd .. && git push -u origin v0.1.1-test-and-portability-foundation
```
