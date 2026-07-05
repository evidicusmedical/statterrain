# HANDOFF — StatTerrain v0.1.2: CI Lockfile Repair

## 1. Patch identification

- **Product:** StatTerrain
- **Version:** v0.1.2
- **Date:** 2026-07-05
- **Repository:** https://github.com/evidicusmedical/statterrain
- **Starting main commit:** `e29873bf3544989779479a2fc290c55a67953bcc`
- **Branch:** `v0.1.2-ci-lockfile-repair`
- **Final commit:** see PR below (recorded once opened)
- **Pull request URL:** https://github.com/evidicusmedical/statterrain/pull/3

## 2. Original CI failure

- **Workflow run:** https://github.com/evidicusmedical/statterrain/actions/runs/28755834887 (job: "Lint, typecheck, build, and e2e smoke tests", run on `main` at commit `e29873bf`)
- **Failing step:** "Install dependencies" (`npm ci`)
- **Exact npm error:**
  ```
  npm error code EUSAGE
  npm error
  npm error `npm ci` can only install packages when your package.json and package-lock.json or npm-shrinkwrap.json are in sync. Please update your lock file with `npm install` before continuing.
  npm error
  npm error Missing: @emnapi/core@1.11.2 from lock file
  npm error Missing: @emnapi/runtime@1.11.2 from lock file
  ```
- **Missing packages:** `@emnapi/core@1.11.2`, `@emnapi/runtime@1.11.2`
- **Steps skipped as a result:** Lint, Typecheck, Build, Install Playwright browsers, Run Playwright smoke tests (all skipped because the job failed at "Install dependencies", which is a prerequisite for every later step)

## 3. Root cause

- **Why local installation passed:** The lockfile was originally generated and verified against `npm 11.6.2` running on `Node.js v24.13.0` (the Replit workspace's default runtime). That npm version's dependency-consistency check for `npm ci` did not flag the nested optional dependency entries under `@unrs/resolver-binding-wasm32-wasi` as out of date, so `npm ci` succeeded locally under that toolchain.
- **Why GitHub's clean runner failed:** `.github/workflows/ci.yml` pins `node-version: "20"` via `actions/setup-node@v4`, which provisions Node 20.x with its bundled npm (npm 10.8.2 in the version tested during this repair). This repair reproduced the exact same failure locally by downloading a standalone Node 20.18.1/npm 10.8.2 toolchain and running `npm ci` against the pre-repair lockfile — it failed with the identical `Missing: @emnapi/core@1.11.2` / `@emnapi/runtime@1.11.2` error. Confirmed: this is an npm-version-dependent lockfile consistency check, not a flaky/network issue.
- **Which dependency required the missing lockfile packages:** `@unrs/resolver-binding-wasm32-wasi` (an optional, platform-specific native/WASM resolver binding, pulled in transitively through the ESLint/TypeScript tooling dependency chain — specifically via `unrs-resolver`, a dependency of `eslint-config-next`'s import-resolution chain). Its own package metadata declares dependencies on `@emnapi/core` and `@emnapi/runtime` at `1.11.2`; the existing lockfile only had nested entries for those packages pinned at `1.10.0`, which npm 10 (but not npm 11, in this instance) treats as a hard consistency failure during `npm ci`.
- **Whether npm-version differences contributed:** Yes — conclusively established by direct reproduction. Node 24/npm 11.6.2 accepted the pre-repair lockfile; Node 20.18.1/npm 10.8.2 (the CI-intended toolchain) rejected it with the exact reported error. This is the confirmed, sole root cause. No other cause (e.g. network flakiness, registry drift) was observed or is implicated.
- **Note:** `@unrs/resolver-binding-wasm32-wasi` and its nested `@emnapi/*` dependencies are optional and specific to the `wasm32-wasi` platform target; they are never actually installed into `node_modules` on the `linux-x64` runners used both by this Replit workspace and by GitHub Actions `ubuntu-latest`. Their entries must still be present and internally consistent in `package-lock.json` for `npm ci`'s manifest-vs-lockfile consistency check to pass, even though the files themselves are skipped at install time.

## 4. Files changed

- `statterrain/package-lock.json` — regenerated via `npm install` using Node 20.18.1 / npm 10.8.2 (matching the CI workflow's `node-version: "20"`) to bring the nested `@emnapi/core` and `@emnapi/runtime` entries up to the versions actually required by `@unrs/resolver-binding-wasm32-wasi`. Lockfile-only change: 27 insertions, 15 deletions. `lockfileVersion` remains `3`.
- `statterrain/docs/handoffs/HANDOFF-v0.1.2-CI-LOCKFILE-REPAIR.md` — this handoff document (canonical copy).
- `HANDOFF-v0.1.2-CI-LOCKFILE-REPAIR.md` — identical root-level copy of this handoff document.

`statterrain/package.json` was **not** modified — no dependency declarations were added, removed, or version-bumped in the manifest itself; this was purely a lockfile regeneration. `.github/workflows/ci.yml` was reviewed and required no changes (see Section 6).

## 5. Commands run

```
node --version && npm --version
npm ci                                    # reproduced ENOTEMPTY-style local noise; not the CI error
npm explain @emnapi/core
npm explain @emnapi/runtime
npm ls @emnapi/core @emnapi/runtime
npm ls --depth=0
npm audit
npm outdated

# Reproduction with CI-matching toolchain (standalone Node 20.18.1 / npm 10.8.2, downloaded
# directly from nodejs.org into /tmp — no change to the workspace's default Node runtime):
rm -rf node_modules
npm ci                                    # FAILED — reproduced exact CI error (EUSAGE, missing @emnapi/core@1.11.2, @emnapi/runtime@1.11.2)
npm install                               # regenerated statterrain/package-lock.json
rm -rf node_modules
npm ci                                    # PASSED — clean install, 400 packages

# Full clean-environment verification (Node 20.18.1 / npm 10.8.2):
rm -rf node_modules .next test-results playwright-report
npm ci
npm run lint
npm run typecheck
npm run build
npx playwright install chromium
npm run test:e2e
npm audit
npm ls --depth=0
```

## 6. Verification results

| Check | Result |
|---|---|
| Clean `npm ci` (Node 20.18.1 / npm 10.8.2, no pre-existing `node_modules`) | **Pass** — 400 packages installed, no errors |
| `npm run lint` | **Pass** — "No ESLint warnings or errors" |
| `npm run typecheck` | **Pass** — `tsc --noEmit` clean |
| `npm run build` | **Pass** — Next.js production build compiled successfully, 4/4 static pages generated |
| `npm run test:e2e` (Playwright) | **Pass** — all 12/12 smoke tests passed |
| `npm audit` | 5 vulnerabilities (1 moderate, 4 high) — identical set to the pre-existing advisories documented in the v0.1.1 handoff; **no new advisories introduced** by this lockfile change |
| `npm ls @emnapi/core @emnapi/runtime` (lockfile-level check, via direct JSON inspection since the packages are optional/not installed on `linux-x64`) | Confirmed present at `1.11.2` in `package-lock.json` after regeneration |
| GitHub Actions (on `v0.1.2-ci-lockfile-repair` / PR) | See Section 8 |

## 7. Dependency review

- **Dependencies added or changed:** None in `statterrain/package.json`. The only version movement is inside `statterrain/package-lock.json`'s nested/optional entries for `@emnapi/core`, `@emnapi/runtime` (now `1.11.2`, previously `1.10.0`) and `@emnapi/wasi-threads` (top-level entry now `1.2.2`, previously `1.2.1`) — all transitive, optional, platform-specific packages resolved automatically by `npm install` to satisfy `@unrs/resolver-binding-wasm32-wasi`'s own declared requirements.
- **Lockfile-only changes:** Yes — confirmed via `git diff --stat`: only `statterrain/package-lock.json` changed (27 insertions, 15 deletions); `statterrain/package.json` is byte-identical to before the repair.
- **Advisory changes:** None. `npm audit` reports the same 5 pre-existing vulnerabilities (1 moderate: `postcss`; 4 high: `glob`, `@next/eslint-plugin-next` chain, `next`) both before and after this repair. All require breaking upgrades (`eslint-config-next@16.2.10`, `next@16.2.10`) that are out of scope for this patch.
- **Confirmation no forced audit fix was used:** Confirmed — `npm audit fix --force` was never run. The repair used only `npm install` (implicit lockfile regeneration) as instructed.

## 8. CI outcome

- **Replacement workflow run URL:** _(recorded once the PR triggers CI — see PR #3 checks tab)_
- **Status / job result / step completion:** _(to be confirmed once GitHub Actions completes on the PR branch)_

## 9. Scope confirmation

This patch introduced no changes to: product features, public/synthetic data, backend services, database schema, authentication, AI/CMS integration, deployment configuration, or Replit-runtime-level dependencies. No application source code, tests, or product branding were touched. The only functional change is a regenerated `package-lock.json` that makes `npm ci` succeed deterministically on the Node 20 toolchain used by GitHub Actions.

## 10. Final statement

v0.1.2 is complete pending GitHub Actions confirming a green run on the replacement PR. Once that is verified, the repository will be ready to proceed to v0.2.0. **v0.2.0 / CMS data integration work has not been started as part of this patch.**
