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

- **Replacement workflow run (first, PR #3 open):** https://github.com/evidicusmedical/statterrain/actions/runs/28756248124 (job id `85263768283`) — **FAILED**, but *not* at "Install dependencies" and *not* a lockfile error. `npm ci` reported success; the very next step ("Lint") failed with `sh: 1: next: not found` (exit 127).
- **Re-run of the identical job (no code change, to rule out a flake):** same run id, job id `85263932781` — **FAILED identically**, same signature both times. This rules out network flakiness.
- **Root cause of this second, distinct failure:** `npm error Exit handler never called!` appears in the "Install dependencies" step's log immediately before it reports success. This is a documented upstream npm defect in npm 10.8.2 (the version bundled with the Node 20 toolchain `actions/setup-node@v4` installs) — see `npm/cli` issues #7656, #7657, #7666, #7672, #8031. The bug causes `npm ci` to exit with status 0 (misreported as "success" by GitHub Actions) while some packages — in this repo's case, `next` — never get fully written to `node_modules/.bin`. This is **unrelated to the `package-lock.json` fix**: the lockfile-sync problem (Section 2/3) was fully and correctly resolved; this is a separate, pre-existing npm-tooling bug that the original CI workflow was always exposed to once the lockfile issue was fixed and `npm ci` could get further.
- **Fix identified (not yet applied — see Section 8a):** add a step to `.github/workflows/ci.yml` immediately after "Set up Node.js" and before "Install dependencies" to upgrade npm to a patched release:
  ```yaml
      - name: Upgrade npm (workaround for npm 10.8.2 "Exit handler never called" bug)
        run: npm install -g npm@10.9.2
  ```
  This is a one-line, additive change to the workflow file only — no application code, dependency manifest, or lockfile is touched by this fix.

### 8a. Blocked: cannot push this fix — requires manual action

The GitHub connection available in this environment issues OAuth tokens with a **fixed scope set** (`read:org, read:project, read:user, repo, user:email`) that does **not** include the `workflow` scope GitHub requires to create or update any file under `.github/workflows/`. This was confirmed directly: a real content change to `ci.yml` via the GitHub Contents API returned `403: refusing to allow an OAuth App to create or update workflow .github/workflows/ci.yml without workflow scope`. Reconnecting/re-authorizing the same GitHub connection was attempted and did **not** change the granted scopes (the connector does not expose a scope-selection step).

**Action required from the repository owner** — one of:
1. Apply the 3-line diff above directly in GitHub's web editor on branch `v0.1.2-ci-lockfile-repair` (Edit `.github/workflows/ci.yml` → insert the step shown above between "Set up Node.js" and "Install dependencies" → commit directly to the branch), **or**
2. Provide a personal access token (classic) with the `repo` + `workflow` scopes so this change can be pushed programmatically, **or**
3. Apply the same diff to `main` directly and rebase/merge PR #3 afterward.

Once the step is added and pushed to `v0.1.2-ci-lockfile-repair`, GitHub Actions will automatically re-run on PR #3; that run must show a fully green job (Lint, Typecheck, Build, Playwright e2e, upload-artifact) before merging.

- **Files this environment already pushed successfully (not blocked):** `statterrain/package-lock.json`, both handoff doc copies. These are the actual lockfile repair and are unaffected by the `workflow`-scope blocker.

## 9. Scope confirmation

This patch introduced no changes to: product features, public/synthetic data, backend services, database schema, authentication, AI/CMS integration, deployment configuration, or Replit-runtime-level dependencies. No application source code, tests, or product branding were touched. The functional changes are (a) a regenerated `package-lock.json` that makes `npm ci` succeed deterministically on the Node 20 toolchain used by GitHub Actions (applied), and (b) a one-line `ci.yml` step to work around an unrelated upstream npm 10.8.2 bug (identified, diff provided, **not yet applied** — requires `workflow`-scope write access this environment does not have).

## 10. Final statement

v0.1.2 is **not yet complete**. The `package-lock.json` fix (the originally reported failure) is verified correct both locally and on GitHub Actions (the "Install dependencies" step no longer fails with a lockfile-sync error). However, PR #3 cannot go green yet because of a second, independent, pre-existing npm 10.8.2 bug in the CI environment, and the one-line fix for it cannot be pushed from this environment due to a `workflow`-scope OAuth limitation — see Section 8a for the exact diff and required manual action. Do not merge PR #3 until the `workflow` fix is applied and a full green Actions run is confirmed. **v0.2.0 / CMS data integration work has not been started and should not begin until this PR is green and merged.**
