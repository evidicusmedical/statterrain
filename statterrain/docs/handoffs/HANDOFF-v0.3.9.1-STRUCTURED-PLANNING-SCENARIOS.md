# StatTerrain v0.3.9.1 — Structured Planning Scenarios

PARTIAL — STRUCTURED PLANNING SCENARIO FOUNDATION IMPLEMENTED

## Implementation summary

A version 1.0 canonical, typed planning-scenario schema now provides stable local IDs, draft/ready-for-review/archived workflow status, null-safe planning geography, selected-facility snapshots, system and researcher assumptions, notes, source-state, limitations, traceability, and provenance. One active scenario is automatically persisted to browser local storage after a short debounce and is validated before restoration. Invalid stored content is rejected safely.

The workspace provides a compact Planning scenario control and an accessible drawer for creation, overview editing, purpose and notes, local JSON download, bounded JSON import preview/confirmation, and clear confirmation. Facility Details has explicit add/remove actions that retain saved facility snapshots. Planning location, radius, and resolved county fields synchronize without replacing researcher-authored fields.

Evidence JSON receives an additive `planningScenario` field (or `null`) and Markdown/Evidence Brief include the planning-scenario record and its safety limitation. ST-SOO-025 and the `structured-planning-scenario` capability are marked supported; ST-SOO-026 remains planned.

## Privacy and safety

Planning scenarios are stored locally in this browser unless exported. Do not enter protected health information or patient-identifying information. They are research records and do not provide clinical, dispatch, routing, transfer, or real-time operational guidance. Imported records are snapshots and are not automatically refreshed.

## Verification

Run `npm run lint`, `npm run typecheck`, all planning-scenario scripts, and `npm run build` before release. Browser verification remains to be completed when Chromium is available. Remaining limitations: this patch intentionally supplies one active local scenario only; no library, collaboration, account, cloud persistence, facility comparison, scoring, routing, or operational data is included.
