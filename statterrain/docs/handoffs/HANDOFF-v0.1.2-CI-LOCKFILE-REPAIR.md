# HANDOFF — StatTerrain v0.1.2: CI Lockfile Repair

## 1. Patch identification

- **Product:** StatTerrain
- **Version:** v0.1.2
- **Date:** 2026-07-05
- **Repository:** https://github.com/evidicusmedical/statterrain
- **Starting main commit:** `e29873bf3544989779479a2fc290c55a67953bcc`
- **Branch:** `v0.1.2-ci-lockfile-repair`
- **Pull request URL:** https://github.com/evidicusmedical/statterrain/pull/3
- **Final CI outcome:** **GREEN** — https://github.com/evidicusmedical/statterrain/actions/runs/28757377035 (all steps: Lint, Typecheck, Build, Playwright e2e x12, Upload Playwright report — all passed)

## 2. Original CI failure

- **Workflow run:** https://github.com/evidicusmedical/statterrain/actions/runs/28755834887 (run on `main` at commit `e29873bf`)
- **Failing step:** "Install dependencies" (`npm ci`)
- **Exact npm error:**
  ```
  npm error code EUSAGE
  npm error `npm ci` can only install packages when your package.json and package-lock.json or npm-shrinkwrap.json are in sync.
  npm error Missing: @emnapi/core@1.11.2 from lock file
  npm error Missing: @emnapi/runtime@1.11.2 from lock file
  ```
- **Steps skipped as a result:** Lint, Typecheck, Build, Install Playwright browsers, Run Playwright smoke tests (all downstream of "Install dependencies").

## 3. Root cause #1 — lockfile/npm-version drift (fixed)

- The lockfile was originally generated under `npm 11.6.2` / `Node.js v24.13.0` (the Replit workspace's default runtime). That npm version's dependency-consistency check did not flag nested optional entries under `@unrs/resolver-binding-wasm32-wasi` (`@emnapi/core`, `@emnapi/runtime`) as stale, so `npm ci` passed locally.
- `.github/workflows/ci.yml` pins Node 20.x, which bundles npm 10.8.x. That npm version's stricter consistency check rejected the same lockfile with the `EUSAGE` error above. Reproduced directly with a standalone Node 20.18.1/npm 10.8.2 toolchain.
- **Fix:** regenerated `statterrain/package-lock.json` via `npm install` to bring the nested `@emnapi/*` entries in sync. This alone resolved the original `EUSAGE` error, confirmed on GitHub's runner.

## 4. Root cause #2 — the real blocker: Replit's local package-firewall baked into the lockfile (fixed)

After root cause #1 was fixed, CI still failed — but with a different, misleading symptom: `npm error Exit handler never called!` in the "Install dependencies" step, consistently at the ~72-second mark, across every subsequent run.

**Four workaround attempts were tried and all failed to fix it**, because they targeted the wrong layer (npm's own internal behavior) rather than the actual cause:
1. Upgrading npm to 10.9.2 (added as a workflow step) — did not help.
2. Adding `--no-audit --no-fund` to `npm ci` (theory: audit/fund network calls stalling) — did not help.
3. Pinning `node-version: "20.18.1"` instead of floating `"20"` (theory: a newer Node 20 patch regressed) — did not help.
4. Setting `NODE_OPTIONS: "--dns-result-order=ipv4first"` (theory: IPv6 DNS hangs against the registry, a documented GitHub Actions/Node issue) — did not help.

**The actual root cause**, found by inspecting the lockfile's `resolved` fields directly: every package in `statterrain/package-lock.json` was resolved against `http://package-firewall.replit.local/npm/...` — an internal Replit sandbox hostname (`NPM_CONFIG_REGISTRY` is set to this value inside the Replit workspace, transparently proxying/scanning all npm traffic). This hostname is **only reachable inside the Replit sandbox**. On GitHub's public runners it doesn't resolve, so every tarball fetch during `npm ci` stalls — and after enough retries/timeouts, npm's own signal-handling defect (a well-documented, still-unpatched upstream bug — `npm/cli` issues #7656/#8404, fix PR #8429 not yet released) surfaces as the misleading "Exit handler never called!" message instead of a clear network error. This explains why none of the four npm/Node-level workarounds could have worked — they didn't address the unreachable host.

- **Fix:** regenerated `statterrain/package-lock.json` a second time, this time forcing `npm install --registry=https://registry.npmjs.org/` so every `resolved` field in the lockfile points to the real, public npm registry instead of the Replit-internal proxy.
- **Verification of the fix:** `node -e` check confirmed 0 of 434 packages in the regenerated lockfile resolve to anything other than `https://registry.npmjs.org`. Full local suite re-run and passed (see Section 6). Pushed to the branch, and the next GitHub Actions run went fully green — see Section 8.

**Lesson for future patches on this repo (and any Replit-developed repo pushed to external CI):** any lockfile regenerated inside the Replit workspace should be regenerated with an explicit `--registry=https://registry.npmjs.org/` (or equivalent `.npmrc` override) before committing, since the workspace's default `npm_config_registry` points to a Replit-internal proxy that external CI runners cannot reach.

## 5. Files changed

- `statterrain/package-lock.json` — regenerated twice: (1) to fix the `@emnapi/*` version-sync issue, (2) to fix the `resolved` URLs to point to the public npm registry instead of the Replit-internal package firewall. Final state: 434 packages, all resolved against `https://registry.npmjs.org`.
- `statterrain/docs/handoffs/HANDOFF-v0.1.2-CI-LOCKFILE-REPAIR.md` — this handoff document (canonical copy).
- `HANDOFF-v0.1.2-CI-LOCKFILE-REPAIR.md` — identical root-level copy.
- `.github/workflows/ci.yml` — four workflow changes were applied by the repo owner (manually, via GitHub's web UI, since this environment lacks the `workflow` OAuth scope needed to push to files under `.github/workflows/`) while diagnosing root cause #2:
  1. `npm install -g npm@10.9.2` step added after "Set up Node.js".
  2. `npm ci` changed to `npm ci --no-audit --no-fund`.
  3. `node-version` pinned from `"20"` to `"20.18.1"`.
  4. `env: NODE_OPTIONS: "--dns-result-order=ipv4first"` added at the job level.

  **None of these four changes were the actual fix** (the fix was the lockfile registry regeneration in Section 4). They are harmless and CI is green with them in place, but they are not verified-necessary per the original task scope. **Recommendation:** revert all four to keep the diff minimal, since the task scope specifies `ci.yml` changes only if verified necessary. This has not been done yet — pending confirmation from the repo owner, since reverting requires the same manual `workflow`-scope edit process.

`statterrain/package.json` was **not** modified in either lockfile regeneration — no dependency declarations were added, removed, or version-bumped.

## 6. Verification results (final, after both fixes)

| Check | Result |
|---|---|
| `npm install --registry=https://registry.npmjs.org/` (clean, no pre-existing `node_modules`) | **Pass** — 398 packages added |
| Lockfile `resolved` field audit | **Pass** — 0/434 packages resolve to `package-firewall.replit.local`; all point to `registry.npmjs.org` |
| `npm run lint` | **Pass** — "No ESLint warnings or errors" |
| `npm run typecheck` | **Pass** — `tsc --noEmit` clean |
| `npm run build` | **Pass** — Next.js production build, 4/4 static pages generated |
| `npm run test:e2e` (Playwright) | **Pass** — 12/12 smoke tests passed |
| `npm audit --audit-level=high` | 5 vulnerabilities (1 moderate, 4 high) — identical pre-existing Next.js/postcss advisories from the v0.1.1 handoff; no new advisories introduced |
| GitHub Actions on `v0.1.2-ci-lockfile-repair` (PR #3) | **PASS** — run [28757377035](https://github.com/evidicusmedical/statterrain/actions/runs/28757377035): Lint, Typecheck, Build, Playwright e2e (12/12), Upload Playwright report all green |

## 7. Dependency review

- **Dependencies added or changed:** None in `statterrain/package.json`.
- **Lockfile-only changes:** Confirmed — only `statterrain/package-lock.json` changed across both regenerations; `package.json` is byte-identical to before the repair.
- **Advisory changes:** None. Same 5 pre-existing vulnerabilities (1 moderate: `postcss`; 4 high: `glob`/`next`/`eslint-config-next` chain) before and after. All require breaking upgrades (`next@16.2.10`) out of scope for this patch.
- **Confirmation no forced audit fix was used:** Confirmed — `npm audit fix --force` was never run.

## 8. CI outcome — full timeline

1. Run [28755834887](https://github.com/evidicusmedical/statterrain/actions/runs/28755834887) (pre-fix, `main`) — **FAILED**: `EUSAGE` lockfile-sync error (Section 2).
2. Lockfile fix #1 pushed (Section 3) — subsequent run **FAILED** differently: `npm error Exit handler never called!`, misreported as success, next step failed with `next: not found`.
3. Re-ran identically (no code change) to rule out a flake — **FAILED identically**. Ruled out simple flakiness.
4. Four sequential workaround attempts on `ci.yml` (npm version bump, `--no-audit --no-fund`, Node patch pin, IPv4 DNS order) — **all four FAILED** with the identical ~72s "Exit handler never called!" signature. Runs: 28756846315, 28756978322, 28757128551.
5. Root cause #2 identified (Section 4): lockfile `resolved` URLs pointed to the Replit-internal `package-firewall.replit.local` proxy, unreachable from GitHub's runners.
6. Lockfile fix #2 pushed (registry forced to `https://registry.npmjs.org/`) — run [28757377035](https://github.com/evidicusmedical/statterrain/actions/runs/28757377035) — **PASSED**, fully green.

## 9. Scope confirmation

This patch introduced no changes to: product features, public/synthetic data, backend services, database schema, authentication, AI/CMS integration, or deployment configuration. No application source code, tests, or product branding were touched. The functional change is a twice-regenerated `package-lock.json`. Four incidental `ci.yml` changes were applied while diagnosing the real root cause; none were the actual fix and reverting them is recommended but not yet done (see Section 5).

## 10. Final statement

v0.1.2 is **complete**. PR #3 (https://github.com/evidicusmedical/statterrain/pull/3) is open, mergeable, and CI is fully green. The true root cause of the CI failure was two-fold: (1) an npm-version-dependent lockfile consistency check, and (2) — the real, non-obvious blocker — the lockfile's `resolved` URLs pointing to a Replit-sandbox-internal package proxy that GitHub's runners cannot reach. Both are fixed via lockfile regeneration alone; no application code or dependency manifest changes were required. **Outstanding item:** consider reverting the four incidental `ci.yml` workaround changes (Section 5) to keep the diff minimal, since they were verified unnecessary. **v0.2.0 / CMS data integration work has not been started and should not begin until this PR is merged**, at the repo owner's discretion.
